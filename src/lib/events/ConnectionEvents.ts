export enum ConnectionEvents {
    // Names of events emitted by ROS object
    CONNECTED = 'connection',
    ERROR = 'error',
    CLOSE = 'close',

    // Custome event names
    FAILED_TO_RECONNECT = 'failed_to_reconnect',
    ENTER_SAFE_STATE = 'enter_safe_state',
}

export type ConnectionEventPayloads = {
    // Events emitted by the ROS object
    [ConnectionEvents.CONNECTED]: () => void;
    [ConnectionEvents.ERROR]: (error: Error) => void;
    [ConnectionEvents.CLOSE]: () => void;


    // Custom events
    [ConnectionEvents.FAILED_TO_RECONNECT]: () => void;
    [ConnectionEvents.ENTER_SAFE_STATE]: (reason: string) => void;
    /*  TODO: Add events like RECONNECTING, DISCONNECTED, HEARTBEAT_TIMEOUT for
    *   more fine control.
    */
}