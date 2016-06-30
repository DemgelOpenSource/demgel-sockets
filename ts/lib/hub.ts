import {injectable} from "inversify";
import {HubHandler} from "./hub-handler";

@injectable()
export abstract class SocketHub {
    handler: HubHandler;
}