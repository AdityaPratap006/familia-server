import { UserRecord } from '../helpers/auth';
import { UserDoc } from '../../models/user.model';
import UserService from '../../services/user.service';
import { UserErrors, getGraphqlError, FamilyErrors, InviteErrors } from '../../errors';
import FamilyService from '../../services/family.service';
import MembershipService from '../../services/membership.service';
import InviteService from '../../services/invite.service';


const checkIfUserCanSendInvite = async (userAuthRecord: UserRecord, familyId: string, toUserId: string) => {
    let fromUser: UserDoc;
    try {
        const user = await UserService.getOneUserByAuthId(userAuthRecord.uid);
        if (!user) {
            throw UserErrors.general.userNotFound;
        }
        fromUser = user;
    } catch (error) {
        throw getGraphqlError(error);
    }

    try {
        const family = await FamilyService.getFamilyById(familyId);

        if (!family) {
            throw FamilyErrors.general.familyNotFound;
        }

        const creator = family.creator as UserDoc;

        if (fromUser.id !== creator.id) {
            throw InviteErrors.forbidden.cannotInviteSomeone;
        }

        if (fromUser.id === toUserId) {
            throw InviteErrors.forbidden.cannotInviteYourself;
        }

        return fromUser;
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
            throw InviteErrors.forbidden.userAlreadyAMember;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }
}

const checkIfInviteAlreadySent = async (familyId: string, fromUserId: string, toUserId: string) => {
    try {
        const sentInvites = await InviteService.getInvitesfromAUserForAFamily(fromUserId, familyId);
        const sentInvitesRecevingUserIdList = sentInvites.map(invite => (invite.to as UserDoc).id);
        if (sentInvitesRecevingUserIdList.includes(toUserId)) {
            throw InviteErrors.forbidden.inviteAlreadySent;
        }
    } catch (error) {
        throw getGraphqlError(error);
    }
}

export const InviteValidators = {
    checkIfInviteAlreadySent,
    checkIfUserCanSendInvite,
    checkIfUserIsAlreadyAMember,
};