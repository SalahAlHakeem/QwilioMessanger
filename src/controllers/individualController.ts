import IndividualModel, {Individual} from "../schemas/Individual"
import ProfileModel from "../schemas/Profile";

export const createIndividual = async (individualChat: [string, string]) => {
    const createdIndividual = await IndividualModel.create({
        members: [
            {
                connectionId: individualChat[0],
            },
            {
                connectionId: individualChat[1]
            }
        ]
    });

    return createdIndividual.id;
}

export const getIndividual = async (individualId: string) => {
    return await IndividualModel.findById(individualId);
}