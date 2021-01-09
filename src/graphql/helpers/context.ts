import { Request } from 'express';

export interface ContextArgs {
    req: Request;
}

export interface SubscriptionContext {
    connection: {
        context: {
            authorization: string;
        };
    };
}

export interface ContextAttributes extends ContextArgs {

}

type ContextFunction = (args: ContextArgs) => ContextAttributes;

export const contextFunction: ContextFunction = (args) => ({
    ...args,
});