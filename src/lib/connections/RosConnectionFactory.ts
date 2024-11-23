import { RosOptions, IRosConnection } from '../interfaces/IRosConnection';
import { RosConnection } from './RosConnection';

// TODO: Dependecy injecy some options maybe? Right now it is less easy to modify the options.
export function createRosConnection(options: RosOptions): IRosConnection {
    return new RosConnection(options);
}