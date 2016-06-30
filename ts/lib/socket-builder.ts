import {injectable, interfaces as i} from "inversify";
import * as _debug from "debug";
import {SocketIO} from "./socket";
import {HubHandler} from "./hub-handler";
import {SocketHub} from "./hub";

const debug = _debug("demgel:sockets:builder");

@injectable()
export class SocketBuilder {
    kernel: i.Kernel;
    hubs: SocketContainer = new SocketContainer();
    scripts: string;

    /**
     * Should all hubs be singleton? Or let socket.io handle rooms/namespace members
     */
    registerHub(target: Function, namespace?: string) {
        debug(`registering hub (${target.name})`);
        if (!namespace) {
            namespace = target.name.toLowerCase();
        }
        
        let container = this.hubs.addHubIfNotExists(target);
        container.type = target;
        container.namespace = namespace;
    }

    registerMethod(target: any, name: string | undefined,  key: string) {
        debug(`registering method ${target.constructor.name}`)
        let container = this.hubs.addMethodIfNotExists(target.constructor, name, key);
    }

    registerMiddleware(target: any, middleware: (socket: SocketIO.Socket, next: any) => void) {
        let container = this.hubs.addHubIfNotExists(target);
        container.middleware.push(middleware);
    }

    build(socket: SocketIO) {
        debug("building sockets");
        this.hubs.hubs.forEach(hub => {
            let handler = Reflect.getMetadata("socket-handler", hub.type);
            if (!handler) {
                debug("handler not found, using default");
                // Register a HubHandler for each Hub
                handler = class extends HubHandler {
                }
            }

            this.kernel.bind("HubHandler" + hub.namespace).to(handler).inSingletonScope();            
            this.kernel.bind(hub.type).to(hub.type).onActivation((context: i.Context, hubInstance: SocketHub) => {
                hubInstance.handler = this.kernel.get<HubHandler>("HubHandler" + hub.namespace);1
                return hubInstance;
            });

            this.scripts = `\nfunction ${hub.namespace}() {\n\tthis.socket = io("/${hub.namespace}")}`;

            hub.methods.forEach(method => {
                let methodCount: Array<string> = Reflect.getMetadata("design:paramtypes", hub.type.prototype, method.method);
                let params = '';
                methodCount.forEach((param, idx) => {
                    if (idx === 0) {
                        params += `var${idx}`;
                    } else {
                        params += `, var${idx}`;
                    }
                })
                this.scripts += `\n${hub.namespace}.prototype.${method.name} = function(${params}) {this.socket.emit("${method.name}", [${params}]);}`;
            })

            hub.socketNamespace = socket.socketServer.of("/" + hub.namespace);
            hub.middleware.forEach(middleware => {
                if (hub.socketNamespace) {
                    hub.socketNamespace.use(middleware);
                } else {
                    throw new Error("Error creating socket namespace.");
                } 
            });
            hub.socketNamespace.on("connection", (socket) => {
                this.kernel.get<HubHandler>("HubHandler" + hub.namespace).connect(socket);
                hub.methods.forEach(method => {
                    debug("adding event: " + method.name);
                    socket.on(method.name, (data: any) => {
                        let caller = this.kernel.get(hub.type);
                        (<any>caller)[method.method].apply(caller, data);
                    });
                });
                socket.on("disconnect", () => {
                    this.kernel.get<HubHandler>("HubHandler" + hub.namespace).disconnect(socket);
                })
            });
        })
    }
}

export class SocketContainer {
    hubs = new Map<Function, InternalSocketHub>();

    addHubIfNotExists(namespace: Function): InternalSocketHub {
        if (!this.hubs.has(namespace)) {
            let container: InternalSocketHub = {
                methods: new Map<string, SocketMethod>(),
                middleware: []
            };
            this.hubs.set(namespace, container);
        }
        let resolved = this.hubs.get(namespace);
        if (!resolved) {
            throw new Error("Unable to resolve container for " + namespace.name);
        }
        return resolved;
    }

    getHub(namespace: Function): InternalSocketHub | undefined {
        return this.hubs.get(namespace);
    }

    addMethodIfNotExists(namespace: Function, eventName: string | undefined, methodName: string): SocketMethod | undefined {
        let method: SocketMethod;
        let container = this.addHubIfNotExists(namespace);
        if (!eventName) {
            eventName = methodName.toLowerCase();
        }
        if (!container) {
            throw new Error("Unable to find container for " + namespace.name);
        }
        if (!container.methods.has(eventName)) {
            let method: SocketMethod = {
                name: eventName,
                method: methodName
            }
            container.methods.set(eventName, method);
        }

        return container.methods.get(eventName);
    }
}

export interface InternalSocketHub {
    // All the underlying methods
    methods: Map<string, SocketMethod>;
    middleware: Array<(socket: SocketIO.Socket, next: any) => void>;
    namespace?: string;
    type?: any;
    socketNamespace?: SocketIO.Namespace;
}

export interface SocketMethod {
    // The socket event name
    name: string;
    // The methodname to call
    method: string;
}