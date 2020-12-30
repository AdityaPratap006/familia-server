import { Request } from 'express';
import { PubSubEngine } from 'apollo-server-express';

interface ContextExternalArgs {
    pubsub: PubSubEngine;
}

export interface ContextArgs {
    req: Request;
}

export type ContextAttributes = ContextArgs & ContextExternalArgs;

type ContextFunction = (args: ContextArgs) => ContextAttributes;
type ContextFunctionWrapper = (args: ContextExternalArgs) => ContextFunction;

export const getContextFunction: ContextFunctionWrapper = ({ pubsub }) => {
    return (args) => ({
        ...args,
        pubsub,
    });
};