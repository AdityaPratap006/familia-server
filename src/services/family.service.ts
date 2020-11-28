import chalk from 'chalk';
import { Family, FamilyAttributes, FamilyDoc } from '../models/family.model';
import { UserDoc } from '../models/user.model';

export default class FamilyService {
    static async getAllFamilies() {
        const families = await Family.find().populate('creator');
        return families;
    }

    static async createNewFamily(attrs: FamilyAttributes): Promise<FamilyDoc> {
        const newFamily = Family.build({
            ...attrs,
        });

        await newFamily.save();
        const result = await newFamily.populate('creator').execPopulate();

        const creator = result.creator as UserDoc;

        console.log(chalk.blueBright(`${creator.name} created family '${newFamily.name}'`));

        return result;
    }
}
