import { Ros } from 'roslib';
import { IRosConnection, RosOptions } from '../interfaces/IRosConnection';
import { ConnectionEventPayloads, ConnectionEvents } from '../events/ConnectionEvents';

/* TODO: Adding some more internal state management maybe? I was thinking having something like 
*  isReconnecting, isConnecting, isDicsonnecting. These would make it better for lifecycle management.
*/

export class RosConnection implements IRosConnection {
    private ros: Ros;
    private listenerMap: Map<ConnectionEvents, ConnectionEventPayloads[ConnectionEvents][]> = new Map();

    private isConnecting: boolean = false;
    private isDisconnecting: boolean = false;
    private isReconnecting: boolean = false;

    constructor(options: RosOptions) {
        this.ros = new Ros(options)
    }

    public close(): void {
        if (!this.isConnected()) {
            console.warn('ROS connection is already closed.');
            return;
        }
        if (this.isDisconnecting) {
            console.warn('Disconnection already in progress.');
            return;
        }
        this.isDisconnecting = true;
        this.removeAllListeners();
        this.ros.close();
        this.isDisconnecting = false;
    }
    
    public connect(url: string): void {
        if (this.isConnected()) {
            console.warn('Already connected to ROS.');
            return;
        }
        if (this.isConnecting) {
            console.warn('Connection attempt already in progress.');
            return;
        }
        this.isConnecting = true;
        this.ros.connect(url);
    }
    
    public on<K extends keyof ConnectionEventPayloads>(event: K, callback: ConnectionEventPayloads[K]): this {
        let callbacks = this.listenerMap.get(event);
        if (!callbacks) {
            callbacks = [];
            this.listenerMap.set(event, callbacks);
        }
        callbacks.push(callback);
        this.ros.on(event, callback);
        return this;
    }

    public off<K extends keyof ConnectionEventPayloads>(event: K, callback: ConnectionEventPayloads[K]): this {
        const callbacks = this.listenerMap.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
                this.ros.off(event, callback);
            }
            if (callbacks.length === 0) {
                this.listenerMap.delete(event);
            }
        }
        return this;
    }

    public isConnected(): boolean {
        return this.ros.isConnected;
    }

    public handleUnexpectedDisconnect(): void {
        console.warn('Handling unexpected disconnect.');
        this.removeAllListeners();
    }

    private removeAllListeners(): void {
        this.listenerMap.forEach((callbacks, event) => {
            callbacks.forEach((callback) => {
                this.ros.off(event, callback);
            });
        });
        this.listenerMap.clear();
        console.info('Cleaning up listeners.');
    }

    public getRosInstance(): Ros {
        return this.ros;
    }

}