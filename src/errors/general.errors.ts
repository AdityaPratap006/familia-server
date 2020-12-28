import { ApolloError, UserInputError, ForbiddenError, AuthenticationError } from 'apollo-server-express';

export enum CustomErrorCodes {
    STATUS_400_BAD_INPUT = 400,
    STATUS_401_UNAUTHORIZED = 401,
    STATUS_403_FORBIDDEN = 403,
    STATUS_404_NOT_FOUND = 404,
    STATUS_500_SERVER_ERROR = 500,
}

export class CustomError extends Error {
    code: CustomErrorCodes;
    message: string;

    constructor(code: CustomErrorCodes, message: string) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

export const getGraphqlError = (error: CustomError) => {
    const { code, message } = error;

    switch (code) {
        case CustomErrorCodes.STATUS_400_BAD_INPUT:
            return new UserInputError(message);
        case CustomErrorCodes.STATUS_401_UNAUTHORIZED:
            return new AuthenticationError(message);
        case CustomErrorCodes.STATUS_403_FORBIDDEN:
            return new ForbiddenError(message);
        case CustomErrorCodes.STATUS_404_NOT_FOUND:
            return new ApolloError(message);
        case CustomErrorCodes.STATUS_500_SERVER_ERROR:
        default:
            return new Error(message);
    }
}

export const internalServerError = new CustomError(CustomErrorCodes.STATUS_500_SERVER_ERROR, `something went wrong`);