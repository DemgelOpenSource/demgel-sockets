"use strict";
const setup_1 = require("../setup");
function Hub(namespace) {
    return (target) => {
        setup_1.getBuilder().registerHub(target, namespace);
    };
}
exports.Hub = Hub;
function SocketMethod(name) {
    return (target, propertyKey, descriptor) => {
        setup_1.getBuilder().registerMethod(target, name, propertyKey);
    };
}
exports.SocketMethod = SocketMethod;
function testMiddleware() {
    return (target) => {
        setup_1.getBuilder().registerMiddleware(target, (socket, next) => {
            console.log("Fired middleware");
        });
    };
}
exports.testMiddleware = testMiddleware;
