import { IConnectionManager } from "../interfaces/IConnectionManager";
import { IRosConnection } from "../interfaces/IRosConnection";
import { ConnectionEventPayloads, ConnectionEvents } from '../events/ConnectionEvents';
import { createRosConnection } from '../connections/RosConnectionFactory';

import TypedEmitter from 'typed-emitter';
import EventEmitter from 'events';
import { IRosClient } from "../interfaces/IRosClient";
import { RosClient } from "../clients/RosClient";

export class ConnectionManager implements IConnectionManager {
    private static instance: ConnectionManager;
    public rosConnection: IRosConnection | null = null;
    private rosClient: IRosClient | null = null;
    private connectionUrls: string[] = [];
    private currentUrlIndex: number = 0;
    private reconnectionAttempts: number = 0;
    private reconnectionTimeoutId: NodeJS.Timeout | null = null;
    private eventEmitter: TypedEmitter<ConnectionEventPayloads>;
    private heartbeatIntervalId: NodeJS.Timeout | null = null;
    private listenerMap: Map<ConnectionEvents, (...args: unknown[]) => void> = new Map();

    private constructor() {
        this.eventEmitter = new EventEmitter() as TypedEmitter<ConnectionEventPayloads>;

        // Attach internal handlers only once
        this.eventEmitter.on(ConnectionEvents.CONNECTED, this.handleConnection.bind(this));
        this.eventEmitter.on(ConnectionEvents.ERROR, this.handleError.bind(this));
        this.eventEmitter.on(ConnectionEvents.CLOSE, this.handleClose.bind(this));
    }

    public getRosClient(): IRosClient {
        if (!this.rosConnection || !this.isConnected()) {
            throw new Error('No ROS connection available.');
        }
        if (!this.rosClient) {
            this.rosClient  = new RosClient(this.rosConnection);
        }

        return this.rosClient;
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
            throw new Error('At least one ROS bridge URL must be provided.');
        }

        this.connectionUrls = urls;
        this.currentUrlIndex = 0;
        this.establishConnection(this.connectionUrls[this.currentUrlIndex]);
    }

    public disconnect(): void {
        if (this.rosConnection && this.isConnected()) {
            console.log('Disconnecting from ROS...');
            this.stopHeartbeat();
            this.rosConnection.close();
            this.rosConnection = null;
            console.log('Disconnected from ROS!');
        }

        if (this.reconnectionTimeoutId) {
            clearTimeout(this.reconnectionTimeoutId);
            this.reconnectionTimeoutId = null;
        }
    }

    public on<K extends keyof ConnectionEventPayloads>(event: K, listener: ConnectionEventPayloads[K]): void {
        this.eventEmitter.on(event, listener);
    }

    public off<K extends keyof ConnectionEventPayloads>(event: K, listener: ConnectionEventPayloads[K]): void {
        this.eventEmitter.off(event, listener);
    }

    public isConnected(): boolean {
        return this.rosConnection ? this.rosConnection.isConnected() : false;
    }

    private establishConnection(url: string): void {

        if (this.rosConnection && this.isConnected()) {
            console.warn('Already connected to ROS.');
            return;
        }

        if (this.rosConnection) {
            console.log('Cleaning up previous listeners before reconnecting...');
            this.cleanupListeners();
            this.rosConnection.close();
            this.rosConnection = null;
        }

        const options = { url: url };
        this.rosConnection = createRosConnection(options);
        console.log(`Connecting to ROS at ${url}...`);
        this.rosConnection.connect();

        const events: (keyof ConnectionEventPayloads)[] = [
            ConnectionEvents.CONNECTED,
            ConnectionEvents.ERROR,
            ConnectionEvents.CLOSE,
        ];

        events.forEach((event) => {
            const relay = (...args: unknown[]) => {
                this.eventEmitter.emit(event, ...args);
            };

            this.listenerMap.set(event, relay);
            this.rosConnection!.on(event, relay);
        });

        console.log('Listeners attached!');
    }

    private handleConnection(): void {
        console.log('Connected to ROS.');
        this.reconnectionAttempts = 0;

        if (this.reconnectionTimeoutId) {
            clearTimeout(this.reconnectionTimeoutId);
            this.reconnectionTimeoutId = null;
        }
        
        this.stopHeartbeat();
        this.startHeartbeat();
    }

    private handleError(error: unknown): void {

        if (error instanceof Error) {
            console.error('ROS Connection Error:', error.message, error.stack);
        } else {
            console.error('ROS Connection Error:', error);
        }

        if (this.reconnectionAttempts < 8) {
            this.reconnectionAttempts++;
            console.log(`Reconnection attempt #${this.reconnectionAttempts}`);
            this.currentUrlIndex = (this.currentUrlIndex + 1) % this.connectionUrls.length;
            
            const delay = Math.pow(2, this.reconnectionAttempts) * 1000;
            this.reconnectionTimeoutId = setTimeout(() => {
                console.log(`Attempting reconnection to ${this.connectionUrls[this.currentUrlIndex]}...`);
                this.establishConnection(this.connectionUrls[this.currentUrlIndex]);
            }, delay);
        } else {
            console.error('Max reconnection attempts reached.');
            this.eventEmitter.emit(ConnectionEvents.FAILED_TO_RECONNECT);
        }
    }

    private handleClose(): void {
        console.warn('Connection to ROS closed.');
        this.stopHeartbeat()
        if (this.rosConnection) {
            this.rosConnection.handleUnexpectedDisconnect();
        }
        this.rosClient = null;
        this.handleError(new Error('Reconnecting after unexpected close.'));
    }

    private startHeartbeat(): void {
        if (this.heartbeatIntervalId) return;
    
        console.log('Heartbeat check initiated.');
        this.heartbeatIntervalId = setInterval(() => {
            console.log('Is connected:', this.isConnected());
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

    private cleanupListeners(): void {
        if (this.rosConnection) {
            console.log('Removing all existing listeners...');

            const events: (keyof ConnectionEventPayloads)[] = [
                ConnectionEvents.CONNECTED,
                ConnectionEvents.ERROR,
                ConnectionEvents.CLOSE,
            ];

            events.forEach((event) => {
                const relay = this.listenerMap.get(event);
                if (relay) {
                    this.rosConnection!.off(event, relay);
                    this.listenerMap.delete(event);
                }
            });
        }
    }
}
