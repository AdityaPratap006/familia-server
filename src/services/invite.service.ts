import chalk from 'chalk';
import mongoose from 'mongoose';
import { Invite, InviteAttributes } from '../models/invite.model';
import { FamilyDoc } from '../models/family.model';
import { UserDoc } from '../models/user.model';
import MembershipService from '../services/membership.service';
import { internalServerError, InviteErrors } from '../errors';

export default class InviteService {
    static async getAllInvites() {
        try {
            const invites = await Invite.find().populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw internalServerError;
        }
    }

    static async getInvite(id: string) {
        try {
            const invite = await Invite.findById(id).populate('family').populate('from').populate('to');
            return invite;
        } catch (error) {
            throw internalServerError;
        }
    }

    static async createInvite(attrs: InviteAttributes) {
        try {
            const newInvite = Invite.build({ ...attrs });
            await newInvite.save();

            const newInviteData = await newInvite.populate('family').populate('from').populate('to').execPopulate();
            const family = newInviteData.family as FamilyDoc;
            const fromUser = newInviteData.from as UserDoc;
            const toUser = newInviteData.to as UserDoc;

            console.log(chalk.hex('#fc045c')(`Created new Invite`));
            console.table({
                family: family.id,
                from: fromUser.id,
                to: toUser.id,
            });

            return newInviteData;
        } catch (error) {
            throw internalServerError;
        }
    }

    static async getInvitesToAUser(toUserId: string) {
        try {
            const invites = await Invite.find({ to: toUserId }).populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw internalServerError;
        }
    }

    static async getInvitesfromAUser(fromUserId: string) {
        try {
            const invites = await Invite.find({ from: fromUserId }).populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw internalServerError;
        }
    }

    static async getInvitesfromAUserForAFamily(fromUserId: string, familyId: string) {
        try {
            const invites = await Invite.find({ from: fromUserId, family: familyId }).populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw internalServerError;
        }
    }

    static async deleteInvite(inviteId: string, session?: mongoose.ClientSession) {
        try {
            await Invite.findByIdAndDelete(inviteId, { session: session });
        } catch (error) {
            throw internalServerError;
        }
    }

    static async acceptInvite(inviteId: string) {
        const inviteToBeAccepted = await this.getInvite(inviteId);

        if (!inviteToBeAccepted) {
            throw InviteErrors.general.inviteNotFound;
        }

        const family = inviteToBeAccepted.family as FamilyDoc;
        const memberToBeAdded = inviteToBeAccepted.to as UserDoc;

        try {
            const session = await mongoose.startSession();
            session.startTransaction();

            await MembershipService.createNewMembership({
                family: family._id,
                user: memberToBeAdded._id,
            }, session);

            family.memberCount += 1;
            await family.save({ session: session });

            await this.deleteInvite(inviteId, session);

            await session.commitTransaction();
            return;
        } catch (error) {
            throw internalServerError;
        }
    }
}