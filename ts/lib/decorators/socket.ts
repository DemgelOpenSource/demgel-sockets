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

export function testMiddleware() {
    return (target) => {
        getBuilder().registerMiddleware(target, (socket, next) => {
            console.log("Fired middleware");
        });
    }
}