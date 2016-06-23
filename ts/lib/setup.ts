import {ExpressMvc, k} from "@demgel/mvc";
import {SocketIO} from "./socket";
import {SocketBuilder} from "./socket-builder";

k.bind<SocketBuilder>(SocketBuilder).to(SocketBuilder).inSingletonScope().onActivation((context, builder) => {
    builder.kernel = k;
    return builder;
});

export function useSockets(emvc: ExpressMvc, ...hubs: any[]) {
    emvc.kernel.bind<SocketIO>(SocketIO).to(SocketIO).inSingletonScope().onActivation((context, socketIO) => {
        socketIO.kernel = k;
        socketIO.httpServer = emvc.httpServer;
        socketIO.init();
        return socketIO;
    })

    // Initize SocketIO - should now be available to app
    let sockets = emvc.kernel.get<SocketIO>(SocketIO);
    getBuilder().build(sockets);
}

export function getBuilder(): SocketBuilder {
    return k.get<SocketBuilder>(SocketBuilder);
}