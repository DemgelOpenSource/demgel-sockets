/// <reference types="socket.io" />
/// <reference types="node" />
import { mvcService } from "@demgel/mvc";
import { interfaces as i } from "inversify";
import { Server } from "http";
export declare class SocketIO extends mvcService {
    kernel: i.Kernel;
    socketServer: SocketIO.Server;
    httpServer: Server;
    constructor();
    init(): void;
}
