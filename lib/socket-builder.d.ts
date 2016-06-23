/// <reference types="lodash" />
/// <reference types="socket.io" />
import { interfaces as i } from "inversify";
import { SocketIO } from "./socket";
export declare class SocketBuilder {
    kernel: i.Kernel;
    hubs: SocketContainer;
    /**
     * Should all hubs be singleton? Or let socket.io handle rooms/namespace members
     */
    registerHub(target: Function, namespace?: string): void;
    registerMethod(target: any, name: string, key: string): void;
    registerMiddleware(target: any, middleware: (socket, next) => void): void;
    build(socket: SocketIO): void;
}
export declare class SocketContainer {
    hubs: Map<Function, SocketHub>;
    addHubIfNotExists(namespace: Function): SocketHub;
    getHub(namespace: Function): SocketHub;
    addMethodIfNotExists(namespace: Function, eventName: string, methodName: string): SocketMethod;
}
export interface SocketHub {
    methods: Map<string, SocketMethod>;
    middleware: Array<(socket, next) => void>;
    namespace?: string;
    type?: any;
    socketNamespace?: SocketIO.Namespace;
}
export interface SocketMethod {
    name: string;
    method: string;
}
