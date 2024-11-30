import {Ros} from 'roslib';

const ros = new Ros({
    url: 'ws://localhost:8080'
});

ros.on('connection', () => {
    console.log('Connected to websocket server.');
});

ros.on('close', () => {
    console.log('Connection to websocket server closed.');
});

export { ros }