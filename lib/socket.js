"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const mvc_1 = require("@demgel/mvc");
const inversify_1 = require("inversify");
const io = require("socket.io");
const _debug = require("debug");
let debug = _debug("socket:main");
let SocketIO = class SocketIO extends mvc_1.mvcService {
    constructor() {
        super();
    }
    init() {
        debug("adding socket to ExpressMvc");
        this.socketServer = io(this.httpServer);
        this.socketServer.on("connection", (socket) => {
            console.log("Connection made", socket.id);
            socket.on('disconnect', () => {
                console.log("Client " + socket.id + " disconnected");
            });
        });
    }
};
SocketIO = __decorate([
    inversify_1.injectable(), 
    __metadata('design:paramtypes', [])
], SocketIO);
exports.SocketIO = SocketIO;
