"use strict";
const setup_1 = require("../setup");
function testMiddleware() {
    return (target) => {
        setup_1.getBuilder().registerMiddleware(target, (socket, next) => {
            console.log("Fired middleware");
            next();
        });
    };
}
exports.testMiddleware = testMiddleware;
