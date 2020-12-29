import { CustomError, CustomErrorCodes } from "./general.errors";

const general = {
    inviteNotFound: new CustomError(CustomErrorCodes.STATUS_404_NOT_FOUND, `invite not found`),
}

const forbidden = {
    cannotInviteSomeone: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `you cannot invite someone to this family`),
    cannotInviteYourself: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `you cannot invite yourself`),
    inviteAlreadySent: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `invite already sent`),
    cannotDeleteInvite: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `you cannot delete this invite`),
}

export const InviteErrors = {
    general,
    forbidden,
}