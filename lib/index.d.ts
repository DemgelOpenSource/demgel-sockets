export * from "./setup";
export * from "./socket";
export * from "./decorators/socket";
export * from "./decorators/example-middleware";
export * from "./hub";
export * from "./hub-handler";
declare module "@demgel/mvc/lib/express-mvc" {
    interface ExpressMvc {
        useSockets(...hubs: any[]): ExpressMvc;
    }
}
declare module "@demgel/mvc/lib/context" {
    interface Context {
        socketId?: string;
    }
}
