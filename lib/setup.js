"use strict";
const mvc_1 = require("@demgel/mvc");
const socket_1 = require("./socket");
const socket_builder_1 = require("./socket-builder");
mvc_1.k.bind(socket_builder_1.SocketBuilder).to(socket_builder_1.SocketBuilder).inSingletonScope().onActivation((context, builder) => {
    builder.kernel = mvc_1.k;
    return builder;
});
function useSockets(emvc, ...hubs) {
    emvc.kernel.bind(socket_1.SocketIO).to(socket_1.SocketIO).inSingletonScope().onActivation((context, socketIO) => {
        socketIO.kernel = mvc_1.k;
        socketIO.httpServer = emvc.httpServer;
        socketIO.init();
        return socketIO;
    });
    // Initize SocketIO - should now be available to app
    let sockets = emvc.kernel.get(socket_1.SocketIO);
    getBuilder().build(sockets);
}
exports.useSockets = useSockets;
function getBuilder() {
    return mvc_1.k.get(socket_builder_1.SocketBuilder);
}
exports.getBuilder = getBuilder;
