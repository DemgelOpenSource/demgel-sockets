import {getBuilder} from "../setup";

export function Hub(namespace?: string) {
    return (target: any) => {
        getBuilder().registerHub(target, namespace);
    }
}

export function SocketMethod(name?: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        getBuilder().registerMethod(target, name, propertyKey);
    }
}

export function SocketHandler(handler: any) {
    return (target: any) => {
        Reflect.defineMetadata("socket-handler", handler, target);
    }
}