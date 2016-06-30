export * from "./setup";
export * from "./socket";
export * from "./decorators/socket";
export * from "./decorators/example-middleware";
export * from "./hub";
export * from "./hub-handler";
import {useSockets} from "./setup";
import {ExpressMvc, Context} from "@demgel/mvc";

declare module "@demgel/mvc/lib/express-mvc" {
    export interface ExpressMvc {
        useSockets(...hubs: any[]): ExpressMvc;
    }
}

ExpressMvc.prototype.useSockets = useSockets;

declare module "@demgel/mvc/lib/context" {
    export interface Context {
        socketId?: string;
    }
}