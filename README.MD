# Demgel MVC Sockets

## Installation

```
npm install --save @demgel/mvc @demgel/sockets
```

## Status
This is still in alpha, many features are missing, or incomplete. Feel free to make PRs to fix/improve any feature.
## Setup

``` typescript
import {expressMvc} from "@demgel/mvc";
import "@demgel/sockets";
import {SomeHub} from "./hubs";

let Hubs = [SomeHub, ...]; // This will work

let server = expressMvc(...);
server.useSockets(SomeHub, ...); // This will also work, but isn't required to pass in the HUBs (the call is required)
server.listen(3000);
```

There is no need to actually pass the Hubs to the server, but you do need to reference them at least once before calling useSockets(), there is the option to pass them into `useSockets`, which just leads to an easy way to insure they are processed.

## A Hub

``` typescript
import {Hub, SocketMethod} from "@demgel/sockets";
import {injectable} from "inversify";

@injectable()
@Hub("simplehub") // If you don't pass value, it will generate a name for you
export class SimpleHub {
    constructor(@inject(SomeService) someService: SomeService) {
        this.someService = someService;
    }

    @SocketMethod() // will use the event "somemethod"
    someMethod() {
        // Do Something
    }

    @SocketMethod("another") // will use the event "another"
    anotherMethod() {
        // Do something....
    }
}
```

`injectable` is required, or InversifyJS will not able to resolve the class when a connection comes through.

## To Come

- [ ] A Context passed to the Hubs