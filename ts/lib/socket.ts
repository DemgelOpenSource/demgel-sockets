import {ExpressMvc, mvcService} from "@demgel/mvc";
import {injectable, inject, interfaces as i} from "inversify";
import * as io from "socket.io";
import * as _debug from "debug";
import {Server} from "http";

let debug = _debug("socket:main");

@injectable()
export class SocketIO extends mvcService {
    kernel: i.Kernel;
    socketServer: SocketIO.Server;
    httpServer: Server;

    constructor() {
        super();
    }

    init() {        
        debug("adding socket to ExpressMvc");        
        this.socketServer = io(this.httpServer);

        // this.socketServer.on("connection", (socket) => {
        //     console.log("Connection made", socket.id);
        //     socket.on('disconnect', () => {
        //         console.log("Client " + socket.id + " disconnected");
        //     })
        // })
    }
}