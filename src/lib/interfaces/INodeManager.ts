export interface NodeState {
    name: string;
    status: string[];
  }
  
  export interface INodeManager {
    getNodeState(nodeName: string): Promise<NodeState>;
    getAllNodeStates(): Promise<NodeState[]>;
    launchNode(nodeRequest: NodeRequest): Promise<void>;
    terminateNode(nodeName: string): Promise<void>;
    listNodes(): Promise<string[]>;
  }
  
  export interface NodeRequest {
    name: string;
    package: string;
    executable?: string;
    launch_file?: string;
    parameters?: Record<string, string>;
  }