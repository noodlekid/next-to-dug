import { ConnectionEvents } from "../events/ConnectionEvents";

export interface IRosConnection {
    connect(url?: string): void;
    close(): void;
    on(event: ConnectionEvents, callback: (...args: unknown[]) => void): void;
    off(event: ConnectionEvents, callback: (...args: unknown[]) => void): void;
    isConnected(): boolean;
}

export type RosOptions = {
    url?: string | undefined;
    groovyCompatibility?: boolean | undefined;
    transportLibrary?: "websocket" | "workersocket" | "socket.io" | RTCPeerConnection | undefined;
    transportOptions?: RTCDataChannelInit | undefined;
}