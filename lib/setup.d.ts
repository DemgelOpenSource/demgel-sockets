import { ExpressMvc } from "@demgel/mvc";
import { SocketBuilder } from "./socket-builder";
export declare function useSockets(emvc: ExpressMvc, ...hubs: any[]): void;
export declare function getBuilder(): SocketBuilder;
