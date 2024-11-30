"use client"
import React, { useState, useEffect } from 'react';
import { ConnectionManager } from '@/lib/managers/ConnectionManager';
import { ConnectionEvents } from '@/lib/events/ConnectionEvents';

const RosConnectionManagerTest = () => {
    const [urls, setUrls] = useState('ws://localhost:9090');
    const [status, setStatus] = useState('Not Connected');
    const [connectionManager, setConnectionManager] = useState<ConnectionManager | null>(null);

    useEffect(() => {
        const manager = ConnectionManager.getInstance();
        setConnectionManager(manager);

        const handleConnected = () => setStatus('Connected');
        const handleError = (error: { message: unknown; }) => setStatus(`Error: ${error.message}`);
        const handleClosed = () => setStatus('Disconnected');

        manager.on(ConnectionEvents.CONNECTED, handleConnected);
        manager.on(ConnectionEvents.ERROR, handleError);
        manager.on(ConnectionEvents.CLOSE, handleClosed);

        return () => {
            manager.off(ConnectionEvents.CONNECTED, handleConnected);
            manager.off(ConnectionEvents.ERROR, handleError);
            manager.off(ConnectionEvents.CLOSE, handleClosed);
        };
    }, []);

    const connect = () => {
        if (connectionManager) {
            const urlArray = urls.split(',').map(url => url.trim());
            connectionManager.connect(urlArray);
        }
    };

    const disconnect = () => {
        if (connectionManager) {
            connectionManager.disconnect();
        }
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
