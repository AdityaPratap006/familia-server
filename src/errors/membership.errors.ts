import { CustomError, CustomErrorCodes } from "./general.errors";

const forbidden = {
    userAlreadyAMember: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `user is already a member`),
    cannotAddMoreMembers: new CustomError(CustomErrorCodes.STATUS_403_FORBIDDEN, `cannot add more than 12 members`),
};

export const MembershipErrors = {
    forbidden,
};