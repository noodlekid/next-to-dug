import { IRosClient } from "../interfaces/IRosClient";
import { IRosConnection } from '../interfaces/IRosConnection'
import { Message, Param, Ros, Service, Topic } from 'roslib'

export class RosClient implements IRosClient {
    private ros: Ros;

    constructor(rosConnection: IRosConnection) {
        if (!rosConnection.isConnected()) {
            throw new Error('Cannot create RosClient: Not c')
        }
        this.ros = rosConnection.getRosInstance();
    }

    public listTopics(callback: (topic: string[]) => void): void {
        this.ros.getTopics((result) => {
            callback(result.topics);
        })
    }

    public listServices(callback: (services: string[]) => void): void {
        this.ros.getServices((result) => {
            callback(result);
        })
    }

    public listParams(callback: (params: string[]) => void): void {
        this.ros.getParams((result) => {
            callback(result);
        })
    }

    public listNodes(callback: (nodes: string[]) => void): void {
        this.ros.getNodes((result) => {
            callback(result);
        })
    }

    public getTopic(name: string, messageType: string): Topic {
        return new Topic({
            ros: this.ros,
            name: name,
            messageType: messageType
        });
    }

    public getService(name: string, serviceType: string): Service {
        return new Service({
            ros: this.ros,
            name: name,
            serviceType: serviceType
        })
    }

    public getParam(name: string): Param {
        return new Param({
            ros: this.ros,
            name: name
        })
    }

    public subscribeTopic(topic: Topic, callback: (message: Message) => void): void {
        topic.subscribe(callback)
    }

    public unsubsribeTopic(topic: Topic): void {
        topic.unsubscribe();
    }

    public callService(service: Service, request: any, callback: (response: any) => void): void {
        service.callService(request, callback);
    }

    
}