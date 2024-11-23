export interface IRosConnection {
    connect(url: string): void;
    close(): void;
    on(event:string, callback: (...args: unknown[]) => void): void;
    isConnected(): boolean;
}

export type RosOptions = {
    url?: string | undefined;
    groovyCompatibility?: boolean | undefined;
    transportLibrary?: "websocket" | "workersocket" | "socket.io" | RTCPeerConnection | undefined;
    transportOptions?: RTCDataChannelInit | undefined;
}