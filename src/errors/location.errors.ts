import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    locationNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `location not found`),
}

const userInput = {

}

export const LocationErrors = {
    general,
    userInput,
}