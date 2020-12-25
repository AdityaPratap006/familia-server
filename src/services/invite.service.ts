import chalk from 'chalk';
import mongoose from 'mongoose';
import { Invite, InviteAttributes, InviteDoc } from '../models/invite.model';
import { Family, FamilyAttributes, FamilyDoc } from '../models/family.model';
import { UserDoc } from '../models/user.model';
import MembershipService from '../services/membership.service';

export default class InviteService {
    static async getAllInvites() {
        try {
            const invites = await Invite.find().populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw error;
        }
    }

    static async getInvite(id: string) {
        try {
            const invite = await Invite.findById(id).populate('family').populate('from').populate('to');
            return invite;
        } catch (error) {
            throw error;
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
            throw error;
        }
    }

    static async getInvitesToAUser(toUserId: string) {
        try {
            const invites = await Invite.find({ to: toUserId }).populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw error;
        }
    }

    static async getInvitesfromAUser(fromUserId: string) {
        try {
            const invites = await Invite.find({ from: fromUserId }).populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw error;
        }
    }

    static async getInvitesfromAUserForAFamily(fromUserId: string, familyId: string) {
        try {
            const invites = await Invite.find({ from: fromUserId, family: familyId }).populate('family').populate('from').populate('to');
            return invites;
        } catch (error) {
            throw error;
        }
    }

    static async deleteInvite(inviteId: string) {
        try {
            await Invite.findByIdAndDelete(inviteId);
        } catch (error) {
            throw error;
        }
    }
}