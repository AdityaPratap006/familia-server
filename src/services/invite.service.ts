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

    static async createInvite(attrs: InviteAttributes) {
        try {
            const newInvite = Invite.build({ ...attrs });
            await newInvite.save();

            const newInviteData = await newInvite.populate('family').populate('from').populate('to').execPopulate();
            const family = newInviteData.family as FamilyDoc;
            const fromUser = newInviteData.from as UserDoc;
            const toUser = newInviteData.to as UserDoc;

            console.log(chalk.hex('#fc045c')(`Created new Invite`));
            console.table(chalk.hex('#fc045c')({
                family: family._id,
                from: fromUser._id,
                to: toUser._id,
            }));

            return newInviteData;
        } catch (error) {
            throw error;
        }
    }
}