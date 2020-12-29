import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    familiesNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `families not found`),
    familyNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `family not found`),
}

const userInput = {
    nameRequired: new CustomError(CustomErrorCodes.STATUS_400_BAD_INPUT, `family name is required`),
};

export const FamilyErrors = {
    general,
    userInput,
};