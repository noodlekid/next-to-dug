export enum ConnectionEvents {
    CONNECTED = 'connected',
    ERROR = 'error',
    CLOSE = 'closed',
    FAILED_TO_RECONNECT = 'failed_to_reconnect',
    ENTER_SAFE_STATE = 'enter_safe_state',
}

export type ConnectionEventPayloads = {
    [ConnectionEvents.CONNECTED]: () => void;
    [ConnectionEvents.ERROR]: (error: Error) => void;
    [ConnectionEvents.CLOSE]: () => void;
    [ConnectionEvents.FAILED_TO_RECONNECT]: () => void;
    [ConnectionEvents.ENTER_SAFE_STATE]: (reason: string) => void;
    /*  TODO: Add events like RECONNECTING, DISCONNECTED, HEARTBEAT_TIMEOUT for
    *   more fine control.
    */
}