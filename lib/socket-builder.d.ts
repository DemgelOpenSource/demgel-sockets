/// <reference types="socket.io" />
/// <reference types="lodash" />
import { interfaces as i } from "inversify";
import { SocketIO } from "./socket";
export declare class SocketBuilder {
    kernel: i.Kernel;
    hubs: SocketContainer;
    scripts: string;
    /**
     * Should all hubs be singleton? Or let socket.io handle rooms/namespace members
     */
    registerHub(target: Function, namespace?: string): void;
    registerMethod(target: any, name: string | undefined, key: string): void;
    registerMiddleware(target: any, middleware: (socket: SocketIO.Socket, next: any) => void): void;
    build(socket: SocketIO): void;
}
export declare class SocketContainer {
    hubs: Map<Function, InternalSocketHub>;
    addHubIfNotExists(namespace: Function): InternalSocketHub;
    getHub(namespace: Function): InternalSocketHub | undefined;
    addMethodIfNotExists(namespace: Function, eventName: string | undefined, methodName: string): SocketMethod | undefined;
}
export interface InternalSocketHub {
    methods: Map<string, SocketMethod>;
    middleware: Array<(socket: SocketIO.Socket, next: any) => void>;
    namespace?: string;
    type?: any;
    socketNamespace?: SocketIO.Namespace;
}
export interface SocketMethod {
    name: string;
    method: string;
}
