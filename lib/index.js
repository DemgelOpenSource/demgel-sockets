"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require("./setup"));
__export(require("./socket"));
__export(require("./decorators/socket"));
__export(require("./decorators/example-middleware"));
__export(require("./hub"));
__export(require("./hub-handler"));
const setup_2 = require("./setup");
const mvc_1 = require("@demgel/mvc");
mvc_1.ExpressMvc.prototype.useSockets = setup_2.useSockets;
