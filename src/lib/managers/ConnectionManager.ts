import { IConnectionManager } from "../interfaces/IConnectionManager";
import { IRosConnection } from "../interfaces/IRosConnection";

export class ConnectionManager implements IConnectionManager {
    private static instance: ConnectionManager;
    private rosConnection: IRosConnection | null = null;
    private connectionUrls: string[]= [];
    private currentUrlIndex: number = 0;
    private reconnectionAttempts: number;


    public static getInstance(options?: any): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager(options);
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
        this.establishedConnection(this.connectionUrls[this.currentUrlIndex]);
    }

    public disconnect(): void {
      if (this.rosConnection && this.isConnected()) {
        console.log('Disconnecting from ROS...');
        this.rosConnection.close();
        // Stop hearbeat once I actually implement heart beat
      }
    }

    public isConnected(): boolean {
        return this.rosConnection ? this.rosConnection.isConnected(): false;
    }

    private establishConnection(url: string): void {
        this.rosConnection = new RosConnection();
        console.log(`Connecting to ROS at ${url}...`);
        this.rosConnection.connect(url);
    
        this.rosConnection.on('connection', this.handleConnection.bind(this));
        this.rosConnection.on('error', this.handleError.bind(this));
        this.rosConnection.on('close', this.handleClose.bind(this));
      }

    private handleConnection(): void {
        console.log('Connected to ROS.');
        this.reconnectionAttempts = 0;
        // Insert some other shit to handle heart beat
    }

}
