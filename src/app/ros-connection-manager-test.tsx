"use client"
import React, { useEffect, useState, useReducer } from 'react';
import { ConnectionManager } from '@/lib/managers/ConnectionManager';
import { ConnectionEvents } from '@/lib/events/ConnectionEvents';

const connectionManager = ConnectionManager.getInstance();

const RosConnectionManagerTest = () => {

    const [urls, setUrls] = useState('ws://localhost:9090');
    const [connectionStatus, setConnectionStatus] = useState<string>(false);

    const connect = () => {
        const urlArray = urls.split(',').map(url => url.trim());
        connectionManager.connect(urlArray);
    };

    const disconnect = () => {
        connectionManager.disconnect();
    };

    useEffect(() => {
        var tempStatus = 'not connected'
        if (connectionManager.isConnected()) {
            tempStatus = 'connected'
        } 

        setConnectionStatus(tempStatus);

    }, [ConnectionManager])

    return (
        <div>
            <h1>ROS Connection Manager Test</h1>
            <label htmlFor="urls">ROS Bridge URLs (comma-separated):</label><br />
            <input
                type="text"
                id="urls"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                size={50}
            /><br /><br />
            <button onClick={connect}>Connect</button>
            <button onClick={disconnect}>Disconnect</button>
            <p>{connectionStatus}</p>
        </div>
    );
};

export default RosConnectionManagerTest;
