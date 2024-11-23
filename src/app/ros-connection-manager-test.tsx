"use client"
import React, { useState, useEffect } from 'react';
import { ConnectionManager } from '@/lib/managers/ConnectionManager';

const RosConnectionManagerTest = () => {
    const [urls, setUrls] = useState('ws://localhost:9090');
    const [status, setStatus] = useState('Not Connected');
    const connectionManager = ConnectionManager.getInstance();

    useEffect(() => {
        // Register callback to receive status updates
        connectionManager.registerStatusCallback((newStatus) => {
            setStatus(newStatus);
        });

        // Cleanup on unmount: reset callback to prevent memory leaks
        return () => {
            connectionManager.registerStatusCallback(() => {});
        };
    }, [connectionManager]);

    const connect = () => {
        const urlArray = urls.split(',').map(url => url.trim());
        connectionManager.connect(urlArray);
    };

    const disconnect = () => {
        connectionManager.disconnect();
    };

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
            <p id="status">Status: {status}</p>
        </div>
    );
};

export default RosConnectionManagerTest;
