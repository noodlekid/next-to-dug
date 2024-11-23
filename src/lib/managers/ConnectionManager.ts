import { IConnectionManager } from "../interfaces/IConnectionManager";
import { IRosConnection } from "../interfaces/IRosConnection";
import { ConnectionEventPayloads, ConnectionEvents } from '../events/ConnectionEvents';
import { createRosConnection } from '../connections/RosConnectionFactory';

import TypedEmmiter from 'typed-emitter'
import EventEmitter from 'events';

export class ConnectionManager implements IConnectionManager {
    private static instance: ConnectionManager;
    private rosConnection: IRosConnection | null = null;
    private connectionUrls: string[]= [];
    private currentUrlIndex: number = 0;
    private reconnectionAttempts: number = 0;
    private eventEmitter: TypedEmmiter<ConnectionEventPayloads>;
    private heartbeatIntervalId: NodeJS.Timeout | null = null;
    private listenerMap: Map<string, (...args: unknown[]) => void> = new Map();

    private constructor() {
        this.eventEmitter = new EventEmitter() as TypedEmmiter<ConnectionEventPayloads>
    }


    public static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    public connect(urls: string[]): void {
        if (this.rosConnection && this.isConnected()) {
            console.warn('Already connected to ROS.');
            return;
        }

        if (!urls || urls.length === 0) {
            throw new Error('At least one ROS bridge URL muts be provided.')
        }

        this.connectionUrls = urls;
        this.currentUrlIndex = 0;
        this.establishConnection(this.connectionUrls[this.currentUrlIndex]);
    }

    public disconnect(): void {
      if (this.rosConnection && this.isConnected()) {
        console.log('Disconnecting from ROS...');
        // Stop hearbeat once I actually implement heart beat
        this.stopHeartbeat()
        this.rosConnection.close();
        this.rosConnection = null;
      }
    }


    // TODO: Temporary shit fix to make sure the listener conform to the right type
    public on<K extends keyof ConnectionEventPayloads>(event: K, listener: ConnectionEventPayloads[K]): void {
        if (this.rosConnection) {
            // wrapper for the listener that matches the type expected by rosConnection
            const wrapper = (...args: unknown[]): void => {
                if (event === ConnectionEvents.ERROR && args[0] instanceof Error) {
                    (listener as (error: Error) => void)(args[0]);
                } else if (event === ConnectionEvents.ENTER_SAFE_STATE && typeof args[0] === 'string') {
                    (listener as (reason: string) => void)(args[0]);
                } else if (args.length === 0) {
                    (listener as () => void)();
                }
            };
    
            // Store the wrapper so it can be tossed out later
            this.listenerMap.set(event.toString() + listener.toString(), wrapper);
    
            this.rosConnection.on(event, wrapper);
        }
    
        this.eventEmitter.on(event, listener);
    }

    public off<K extends keyof ConnectionEventPayloads>(event: K, listener: ConnectionEventPayloads[K]): void {
        if (this.rosConnection) {
            const key = event.toString() + listener.toString();
            // Uses the shit fix wrapper to ensure typing
            const wrapper = this.listenerMap.get(key);
            if (wrapper) {
                this.rosConnection.off(event, wrapper);
                this.listenerMap.delete(key);
            }
        }
    
        this.eventEmitter.off(event, listener);
    }

    public isConnected(): boolean {
        return this.rosConnection ? this.rosConnection.isConnected(): false;
    }

    private establishConnection(url: string): void {
        const options = { url: url };
        this.rosConnection = createRosConnection(options)
        console.log(`Connecting to ROS at ${url}...`);
        this.rosConnection.connect();
    
        this.rosConnection.on(ConnectionEvents.CONNECTED, this.handleConnection.bind(this));
        this.rosConnection.on(ConnectionEvents.ERROR, this.handleError.bind(this));
        this.rosConnection.on(ConnectionEvents.CLOSE, this.handleClose.bind(this));
      }

    private handleConnection(): void {
        console.log('Connected to ROS.');
        this.reconnectionAttempts = 0;
        // Insert some other shit to handle heart beat
        this.startHeartbeat()
    }


    /*  TODO: I was thinking maybe implementing a jittering reconnect, but I think the 
    *   exponential backoff will do just fine for now. Pending testing.
    */
    private handleError(...args: unknown[]): void {
        const error = args[0];
        if (error instanceof Error) {
            console.error('ROS Connection Error:', error.message, error.stack);
    
            if (this.reconnectionAttempts < 5) {
                this.reconnectionAttempts++;
                console.log(`Reconnection attempt #${this.reconnectionAttempts}`);
                this.currentUrlIndex = (this.currentUrlIndex + 1) % this.connectionUrls.length;
    
                setTimeout(() => {
                    console.log(`Attempting reconnection to ${this.connectionUrls[this.currentUrlIndex]}...`);
                    this.establishConnection(this.connectionUrls[this.currentUrlIndex]);
                }, Math.pow(2, this.reconnectionAttempts) * 1000);
            } else {
                console.error('Max reconnection attempts reached.');
                this.eventEmitter.emit(ConnectionEvents.FAILED_TO_RECONNECT);
            }
        } else {
            console.error('Unexpected error type:', args);
        }
    }

    private handleClose(): void {
        console.warn('Connection to ROS closed.');
        this.handleError(new Error('Reconnecting after unexpected close.'));

    }

    private startHeartbeat(): void {
        if (this.heartbeatIntervalId) return;

        this.heartbeatIntervalId = setInterval(() => {
            if (!this.isConnected()) {
                console.warn('Heartbeat missed. Attempting to reconnect...');
                this.handleError(new Error('Missed heartbeat.'));
            }
        }, 5000);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }


}
