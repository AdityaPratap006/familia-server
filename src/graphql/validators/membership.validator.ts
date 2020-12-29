import { getGraphqlError, MembershipErrors } from "../../errors";
import { FamilyDoc } from "../../models/family.model";
import MembershipService from "../../services/membership.service";

const checkIfSpaceLeftInFamily = async (family: FamilyDoc) => {
    try {
        const members = await MembershipService.getMembersOfAFamily(family.id);

        if (members.length < 12) {
            return;
        } else {
            throw MembershipErrors.forbidden.cannotAddMoreMembers;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const checkIfUserIsAlreadyAMember = async (familyId: string, toUserId: string) => {
    try {
        const members = await MembershipService.getMembersOfAFamily(familyId);
        const memberIdList = members.map(member => member.id);
        console.log(memberIdList);
        if (memberIdList.includes(toUserId)) {
            throw MembershipErrors.forbidden.userAlreadyAMember;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }
}


export const MembershipValidators = {
    checkIfSpaceLeftInFamily,
    checkIfUserIsAlreadyAMember,
};