import {getBuilder} from "../setup";

export function testMiddleware() {
    return (target: any) => {
        getBuilder().registerMiddleware(target, (socket, next) => {
            console.log("Fired middleware");
            next();
        });
    }
}