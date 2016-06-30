/// <reference types="lodash" />
/// <reference types="socket.io" />
export declare abstract class HubHandler {
    clients: Map<string, ClientConnection>;
    constructor();
    connect(socket: SocketIO.Socket): void;
    disconnect(socket: SocketIO.Socket): void;
}
export interface ClientConnection {
    ssid: string;
    id: string;
    rooms: Array<string>;
    disconnect: number | undefined;
}
