import { ConnectionEvents } from "../events/ConnectionEvents";

export interface IConnectionManager {
    connect(url: string[]): void;
    disconnect(): void;
    isConnected(): boolean;
    on(event: ConnectionEvents, listener: (...args: unknown[]) => void): void;
  }