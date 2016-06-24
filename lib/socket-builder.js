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
        debug(`registering method ${target.constructor.name}`, this.hubs);
        let container = this.hubs.addMethodIfNotExists(target.constructor, name, key);
    }
    registerMiddleware(target, middleware) {
        let container = this.hubs.addHubIfNotExists(target);
        container.middleware.push(middleware);
    }
    build(socket) {
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
        return this.hubs.get(namespace);
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
