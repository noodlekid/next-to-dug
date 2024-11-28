import { Message, Param, Service, Topic } from 'roslib';

export interface IRosClient {
    listTopics(callback: (topics: string[]) => void): void;
    listServices(callback: (services: string[]) => void): void;
    listParams(callback: (params: string[]) => void): void;
    listNodes(callback: (nodes: string[]) => void): void;

    getTopic(name: string, messageType: string): Topic;
    getService(name: string, serviceType: string): Service;
    getParam(name: string): Param;

    subscribeTopic(topic: Topic, callback: (message: Message) => void): void;
    unsubsribeTopic(topic: Topic): void;

    callService(service: Service, request: any, callback: (response: any) => void): void;
}