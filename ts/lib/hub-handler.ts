import {IncomingMessage} from "http";
import {injectable} from "inversify";
import * as cookie from "cookie";

@injectable()
export abstract class HubHandler {
    // Clients currently connected
    clients: Map<string, ClientConnection>;

    constructor() {
        this.clients = new Map<string, ClientConnection>();
    }

    connect(socket: SocketIO.Socket) {
        var t: any = cookie.parse(socket.handshake.headers.cookie);
        if (!t.ssid) {
            socket.disconnect();
            return;
        }
        let connection: ClientConnection | undefined = this.clients.get(t.ssid);

        if (!connection) {
            connection = {
                ssid: t.ssid,
                id: socket.id,
                rooms: [],
                disconnect: undefined
            }
            this.clients.set(t.ssid, connection);
        } else {
            connection.id = socket.id;
            if (connection.disconnect) {
                clearTimeout(connection.disconnect);
                connection.disconnect = undefined;
            }
        }
    }

    disconnect(socket: SocketIO.Socket) {
        var t: any = cookie.parse(socket.handshake.headers.cookie);
        if (!t.ssid) {
            return;
        }
        let connection: ClientConnection | undefined = this.clients.get(t.ssid);
        if (!connection) {
            return;
        }
        connection.disconnect = setTimeout(() => {
            this.clients.delete(t.ssid);
        });
    }
}

export interface ClientConnection {
    ssid: string;
    id: string;
    rooms: Array<string>;
    disconnect: number | undefined;
}
