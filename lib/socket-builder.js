"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const inversify_1 = require("inversify");
const _debug = require("debug");
const hub_handler_1 = require("./hub-handler");
const debug = _debug("demgel:sockets:builder");
let SocketBuilder = class SocketBuilder {
    constructor() {
        this.hubs = new SocketContainer();
    }
    /**
     * Should all hubs be singleton? Or let socket.io handle rooms/namespace members
     */
    registerHub(target, namespace) {
        debug(`registering hub (${target.name})`);
        if (!namespace) {
            namespace = target.name.toLowerCase();
        }
        let container = this.hubs.addHubIfNotExists(target);
        container.type = target;
        container.namespace = namespace;
    }
    registerMethod(target, name, key) {
        debug(`registering method ${target.constructor.name}`);
        let container = this.hubs.addMethodIfNotExists(target.constructor, name, key);
    }
    registerMiddleware(target, middleware) {
        let container = this.hubs.addHubIfNotExists(target);
        container.middleware.push(middleware);
    }
    build(socket) {
        debug("building sockets");
        this.hubs.hubs.forEach(hub => {
            let handler = Reflect.getMetadata("socket-handler", hub.type);
            if (!handler) {
                debug("handler not found, using default");
                // Register a HubHandler for each Hub
                handler = class extends hub_handler_1.HubHandler {
                }
                ;
            }
            this.kernel.bind("HubHandler" + hub.namespace).to(handler).inSingletonScope();
            this.kernel.bind(hub.type).to(hub.type).onActivation((context, hubInstance) => {
                hubInstance.handler = this.kernel.get("HubHandler" + hub.namespace);
                1;
                return hubInstance;
            });
            this.scripts = `\nfunction ${hub.namespace}() {\n\tthis.socket = io("/${hub.namespace}")}`;
            hub.methods.forEach(method => {
                let methodCount = Reflect.getMetadata("design:paramtypes", hub.type.prototype, method.method);
                let params = '';
                methodCount.forEach((param, idx) => {
                    if (idx === 0) {
                        params += `var${idx}`;
                    }
                    else {
                        params += `, var${idx}`;
                    }
                });
                this.scripts += `\n${hub.namespace}.prototype.${method.name} = function(${params}) {this.socket.emit("${method.name}", [${params}]);}`;
            });
            hub.socketNamespace = socket.socketServer.of("/" + hub.namespace);
            hub.middleware.forEach(middleware => {
                if (hub.socketNamespace) {
                    hub.socketNamespace.use(middleware);
                }
                else {
                    throw new Error("Error creating socket namespace.");
                }
            });
            hub.socketNamespace.on("connection", (socket) => {
                this.kernel.get("HubHandler" + hub.namespace).connect(socket);
                hub.methods.forEach(method => {
                    debug("adding event: " + method.name);
                    socket.on(method.name, (data) => {
                        let caller = this.kernel.get(hub.type);
                        caller[method.method].apply(caller, data);
                    });
                });
                socket.on("disconnect", () => {
                    this.kernel.get("HubHandler" + hub.namespace).disconnect(socket);
                });
            });
        });
    }
};
SocketBuilder = __decorate([
    inversify_1.injectable(), 
    __metadata('design:paramtypes', [])
], SocketBuilder);
exports.SocketBuilder = SocketBuilder;
class SocketContainer {
    constructor() {
        this.hubs = new Map();
    }
    addHubIfNotExists(namespace) {
        if (!this.hubs.has(namespace)) {
            let container = {
                methods: new Map(),
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
    getHub(namespace) {
        return this.hubs.get(namespace);
    }
    addMethodIfNotExists(namespace, eventName, methodName) {
        let method;
        let container = this.addHubIfNotExists(namespace);
        if (!eventName) {
            eventName = methodName.toLowerCase();
        }
        if (!container) {
            throw new Error("Unable to find container for " + namespace.name);
        }
        if (!container.methods.has(eventName)) {
            let method = {
                name: eventName,
                method: methodName
            };
            container.methods.set(eventName, method);
        }
        return container.methods.get(eventName);
    }
}
exports.SocketContainer = SocketContainer;
