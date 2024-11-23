import { Ros } from 'roslib';
import { IRosConnection, RosOptions } from '../interfaces/IRosConnection';
import { ConnectionEventPayloads, ConnectionEvents } from '../events/ConnectionEvents';

/* TODO: Adding some more internal state management maybe? I was thinking having something like 
*  isReconnecting, isConnecting, isDicsonnecting. These would make it better for lifecycle management.
*/

export class RosConnection implements IRosConnection {
    private ros: Ros;
    private listenerMap: Map<ConnectionEvents, ConnectionEventPayloads[ConnectionEvents]> = new Map();


    constructor(options: RosOptions) {
        this.ros = new Ros(options)
    }

    public close(): void {
        this.removeAllListeners();
        this.ros.close();
    }
    
    public connect(url: string): void {
        this.ros.connect(url);
    }
    
    public on<K extends keyof ConnectionEventPayloads>(event: K, callback: ConnectionEventPayloads[K]): this {
        this.listenerMap.set(event, callback);
        this.ros.on(event, callback);
        return this;
    }

    public off<K extends keyof ConnectionEventPayloads>(event: K, callback: ConnectionEventPayloads[K]): this {
        if (this.listenerMap.has(event)) {
            this.ros.off(event, callback);
            this.listenerMap.delete(event);
        }
        return this;
    }

    public isConnected(): boolean {
        return this.ros.isConnected;
    }

    private removeAllListeners(): void {
        this.listenerMap.forEach((listener, event) => {
            this.ros.off(event, listener);
        });
        this.listenerMap.clear(); // Clear the map after removing all listeners
    }

}