import { Ros } from 'roslib';
import { IRosConnection, RosOptions } from '../interfaces/IRosConnection';
import { ConnectionEventPayloads, ConnectionEvents } from '../events/ConnectionEvents';

/* TODO: Adding some more internal state management maybe? I was thinking having something like 
*  isReconnecting, isConnecting, isDicsonnecting. These would make it better for lifecycle management.
*/

export class RosConnection implements IRosConnection {
    private ros: Ros;


    constructor(options: RosOptions) {
        this.ros = new Ros(options)
    }

    public close(): void {
        this.removeAllListners();
        this.ros.close();
    }
    
    public connect(url: string): void {
        this.ros.connect(url);
    }
    
    public on<K extends keyof ConnectionEventPayloads>(event: K, callback: ConnectionEventPayloads[K]): this {
        this.ros.on(event, callback);
        return this;
    }

    public off<K extends keyof ConnectionEventPayloads>(event: K, callback: ConnectionEventPayloads[K]): this {
        this.ros.off(event, callback);
        return this;
    }

    public isConnected(): boolean {
        return this.ros.isConnected;
    }

    private removeAllListners(): void {
        this.ros.off(ConnectionEvents.CONNECTED, () => {});
        this.ros.off(ConnectionEvents.ERROR, () => {});
        this.ros.off(ConnectionEvents.CLOSE, () => {});
        this.ros.off(ConnectionEvents.FAILED_TO_RECONNECT, () => {});
        this.ros.off(ConnectionEvents.ENTER_SAFE_STATE, () => {});
    }

}