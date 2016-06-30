import {ExpressMvc, kernel} from "@demgel/mvc";
import {SocketIO} from "./socket";
import {SocketBuilder} from "./socket-builder";
import {Request, Response, NextFunction} from "express";
import * as uuid from "node-uuid";

kernel.bind<SocketBuilder>(SocketBuilder).to(SocketBuilder).inSingletonScope().onActivation((context, builder) => {
    builder.kernel = kernel;
    return builder;
});

export function useSockets(...hubs: any[]): ExpressMvc {
    (<ExpressMvc>this).kernel.bind<SocketIO>(SocketIO).to(SocketIO).inSingletonScope().onActivation((context, socketIO) => {
        socketIO.kernel = kernel;
        socketIO.httpServer = this.httpServer;
        socketIO.init();
        return socketIO;
    });

    // Initize SocketIO - should now be available to app
    let sockets = (<ExpressMvc>this).kernel.get<SocketIO>(SocketIO);
    getBuilder().build(sockets);

    this.express.get("/demgel-sockets", (req: Request, res: Response) => {
        let ssid = req.cookies.ssid;
        if (!ssid) {
            res.cookie('ssid', uuid.v4());
        }

        res.write(getBuilder().scripts);
        res.end();
    });

    this.express.use((req: Request, res: Response, next: NextFunction) => {
        let ssid = req.cookies.ssid;
        if (ssid && req.context) {
            req.context.socketId = ssid;
        }
        next();
    });
    return this;
}

export function getBuilder(): SocketBuilder {
    return kernel.get<SocketBuilder>(SocketBuilder);
}