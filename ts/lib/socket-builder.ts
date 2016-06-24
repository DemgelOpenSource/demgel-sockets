import {injectable, interfaces as i} from "inversify";
import * as _debug from "debug";
import {SocketIO} from "./socket";

const debug = _debug("demgel:sockets:builder");

@injectable()
export class SocketBuilder {
    kernel: i.Kernel;
    hubs: SocketContainer = new SocketContainer();

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

    registerMethod(target: any, name: string, key: string) {
        debug(`registering method ${target.constructor.name}`, this.hubs)
        let container = this.hubs.addMethodIfNotExists(target.constructor, name, key);
    }

    registerMiddleware(target: any, middleware: (socket, next) => void) {
        let container = this.hubs.addHubIfNotExists(target);
        container.middleware.push(middleware);
    }

    build(socket: SocketIO) {
        debug("building sockets");
        this.hubs.hubs.forEach(hub => {
            this.kernel.bind(hub.type).to(hub.type);
            hub.socketNamespace = socket.socketServer.of("/" + hub.namespace);
            hub.middleware.forEach(middleware => {
                hub.socketNamespace.use(middleware);
            });
            hub.socketNamespace.on("connection", (socket) => {
                console.log("Connected to namespace " + hub.namespace);
                debug("socket request", socket.client.request.context);
                hub.methods.forEach(method => {
                    debug("adding event: " + method.name);
                    socket.on(method.name, (socket) => {
                        let caller = this.kernel.get(hub.type);
                        caller[method.method]();
                    });
                });
            });
        })
    }
}

export class SocketContainer {
    hubs = new Map<Function, SocketHub>();

    addHubIfNotExists(namespace: Function): SocketHub {
        if (!this.hubs.has(namespace)) {
            let container: SocketHub = {
                methods: new Map<string, SocketMethod>(),
                middleware: []
            };
            this.hubs.set(namespace, container);
        }
        return this.hubs.get(namespace);
    }

    getHub(namespace: Function): SocketHub {
        return this.hubs.get(namespace);
    }

    addMethodIfNotExists(namespace: Function, eventName: string, methodName: string): SocketMethod {
        let method: SocketMethod;
        let container = this.addHubIfNotExists(namespace);
        if (!eventName) {
            eventName = methodName.toLowerCase();
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

export interface SocketHub {
    // All the underlying methods
    methods: Map<string, SocketMethod>;
    middleware: Array<(socket, next) => void>;
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