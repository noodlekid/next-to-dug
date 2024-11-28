import { INodeManager, NodeState, NodeRequest } from '../interfaces/INodeManager';
import axios from 'axios';

export class NodeManager implements INodeManager {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  public async getNodeState(nodeName: string): Promise<NodeState> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/${nodeName}/status`);
      return {
        name: response.data.name,
        status: response.data.status,
      };
    } catch (error) {
      throw new Error(`Failed to get status of node '${nodeName}': ${this.extractErrorMessage(error)}`);
    }
  }

  public async getAllNodeStates(): Promise<NodeState[]> {
    try {
      const nodeNames = await this.listNodes();
      const promises = nodeNames.map((name) => this.getNodeState(name));
      return Promise.all(promises);
    } catch (error) {
      throw new Error(`Failed to get node states: ${this.extractErrorMessage(error)}`);
    }
  }

  public async launchNode(nodeRequest: NodeRequest): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/launch`, nodeRequest);
    } catch (error) {
      throw new Error(`Failed to launch node '${nodeRequest.name}': ${this.extractErrorMessage(error)}`);
    }
  }

  public async terminateNode(nodeName: string): Promise<void> {
    try {
      await axios.post(`${this.apiBaseUrl}/terminate`, null, { params: { name: nodeName } });
    } catch (error) {
      throw new Error(`Failed to terminate node '${nodeName}': ${this.extractErrorMessage(error)}`);
    }
  }

  public async listNodes(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}`);
      return response.data.nodes;
    } catch (error) {
      throw new Error(`Failed to list nodes: ${this.extractErrorMessage(error)}`);
    }
  }

  private extractErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.detail || error.message;
    }
    return error.message;
  }
}