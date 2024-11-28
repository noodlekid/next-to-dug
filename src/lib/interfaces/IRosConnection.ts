import { ConnectionEvents } from "../events/ConnectionEvents";
import { Ros } from 'roslib';

export interface IRosConnection {
    connect(url?: string): void;
    close(): void;
    on(event: ConnectionEvents, callback: (...args: unknown[]) => void): void;
    off(event: ConnectionEvents, callback: (...args: unknown[]) => void): void;
    isConnected(): boolean;
    getRosInstance(): Ros;
    handleUnexpectedDisconnect(): void;
}

export type RosOptions = {
    url?: string | undefined;
    groovyCompatibility?: boolean | undefined;
    transportLibrary?: "websocket" | "workersocket" | "socket.io" | RTCPeerConnection | undefined;
    transportOptions?: RTCDataChannelInit | undefined;
}