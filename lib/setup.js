"use strict";
const mvc_1 = require("@demgel/mvc");
const socket_1 = require("./socket");
const socket_builder_1 = require("./socket-builder");
const uuid = require("node-uuid");
mvc_1.kernel.bind(socket_builder_1.SocketBuilder).to(socket_builder_1.SocketBuilder).inSingletonScope().onActivation((context, builder) => {
    builder.kernel = mvc_1.kernel;
    return builder;
});
function useSockets(...hubs) {
    this.kernel.bind(socket_1.SocketIO).to(socket_1.SocketIO).inSingletonScope().onActivation((context, socketIO) => {
        socketIO.kernel = mvc_1.kernel;
        socketIO.httpServer = this.httpServer;
        socketIO.init();
        return socketIO;
    });
    // Initize SocketIO - should now be available to app
    let sockets = this.kernel.get(socket_1.SocketIO);
    getBuilder().build(sockets);
    this.express.get("/demgel-sockets", (req, res) => {
        let ssid = req.cookies.ssid;
        if (!ssid) {
            res.cookie('ssid', uuid.v4());
        }
        res.write(getBuilder().scripts);
        res.end();
    });
    this.express.use((req, res, next) => {
        let ssid = req.cookies.ssid;
        if (ssid && req.context) {
            req.context.socketId = ssid;
        }
        next();
    });
    return this;
}
exports.useSockets = useSockets;
function getBuilder() {
    return mvc_1.kernel.get(socket_builder_1.SocketBuilder);
}
exports.getBuilder = getBuilder;
