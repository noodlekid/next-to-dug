import { ConnectionEvents } from "../events/ConnectionEvents";
import { IRosConnection } from "./IRosConnection";


export interface IConnectionManager {
    connect(url: string[]): void;
    disconnect(): void;
    getConnectionStatus(): boolean;
    getRosInstance(): IRosConnection | null;
    on(event: ConnectionEvents, listener: (...args: unknown[]) => void): void;
  }