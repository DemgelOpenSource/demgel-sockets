export declare function Hub(namespace?: string): (target: any) => void;
export declare function SocketMethod(name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function SocketHandler(handler: any): (target: any) => void;
