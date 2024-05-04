import {Schema, model} from 'mongoose';

export interface IIndividualMember {
    connectionId: string;
    messages: Array<string>
}

export interface Individual {
    members: [IIndividualMember, IIndividualMember];
}

const IndividualMemberSchema = new Schema<IIndividualMember>({
    connectionId: {type: String, require: true},
    messages: {type: [String], default: []}
})

const IndividualSchema = new Schema<Individual>({
    members: {type: [IndividualMemberSchema], required: false}
});

const IndividualModel = model('Individual', IndividualSchema);
export default IndividualModel;

