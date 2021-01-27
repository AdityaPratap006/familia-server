import { PubSub } from 'apollo-server-express';
import { EventEmitter } from 'events';

const biggerEventEmitter = new EventEmitter();
biggerEventEmitter.setMaxListeners(300);

export const pubsub = new PubSub({ eventEmitter: biggerEventEmitter });