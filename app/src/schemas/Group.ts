import { Schema, model } from "mongoose";

export interface IMember {
    connectionId: string;
    status: 'participant' | 'owner' | 'admin',
    messages: Array<String>
}

export interface IGroup {
    name: string;
    description: string;
    members: Array<IMember>;
    accessibility: 'private' | 'public';
    avatar: {
        color: 'string',
        images: Array<String>,
        mainImage: string | null;
    }
}

const MemberSchema = new Schema<IMember>({
    connectionId: {type: String, required: true, ref: 'Profile'},
    status: {type: String, required: true, enum: ['participant' , 'owner' , 'admin'], default: 'participant'},
    messages: {type: [String], default: []}
});

const GroupSchema = new Schema<IGroup>({
    name: {type: String, required: true},
    description: {type: String},
    members: [MemberSchema],
    accessibility: {type: String, required: true, enum: ['private', 'public']},
    avatar: {
        color: {type: String, default: 'green'},
        images: {type: [String], ref: 'ProfileImage', default: []},
        mainImage: {type: String, ref: 'ProfileImage', default: ""}
    }
})

const GroupModel = model('Group', GroupSchema);
export default GroupModel;
