import { Ros } from 'roslib';
import { IRosConnection, RosOptions } from '../interfaces/IRosConnection';
import { ConnectionEventPayloads } from '../events/ConnectionEvents';



export class RosConnection implements IRosConnection {
    private ros: Ros;


    constructor(options: RosOptions) {
        this.ros = new Ros(options)
    }

    public callOnConnection(message: object): void {
        this.ros.callOnConnection(message)
    }

    public close(): void {
        this.ros.close()
    }

    public connect(url: string): void {
        this.ros.connect(url)
    }

    public on<K extends keyof ConnectionEventPayloads>(event: K, callback: ConnectionEventPayloads[K]): this {
       this.ros.on(event, callback);
       return this;
    }

    public isConnected(): boolean {
        return this.ros.isConnected;
    }

}