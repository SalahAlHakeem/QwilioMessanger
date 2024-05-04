import ChatModel from "../schemas/Chat";
import GroupModel, { IGroup, IMember } from "../schemas/Group";
import ProfileModel from "../schemas/Profile";

type GroupDetails = Pick<IGroup, 'name' | 'description' | 'accessibility'>;
type LooseMember = {
    connectionId: string;
    status?: IMember["status"];
};

export type ParameterCreateGroup = {
    details: GroupDetails,
    members?: Array<LooseMember>;
}

export const createGroup = async ({details, members}: ParameterCreateGroup) => {
    return await GroupModel.create({
        name: details.name,
        description: details.description,
        members,
        accessibility: details.accessibility
    });
}

export type ParameterAddGroupMember = {
    chatId: string;
    member: LooseMember
}

export const addGroupMember = async ({chatId, member}: ParameterAddGroupMember): Promise<void> => {
    const chat = await ChatModel.findById(chatId);

    if (chat) {
        await GroupModel.updateOne({_id: chat.connectionId}, {$push: {members: member}});
        await ProfileModel.updateOne({_id: member.connectionId}, {$push: {chats: chat.id}});
    }
}

export type ParameterDeleteGroupMember = {
    chatId: string;
    connectionId: string;
}

export const deleteGroupMember = async ({chatId, connectionId}: ParameterDeleteGroupMember) => {
    const chat = await ChatModel.findById(chatId);

    if (chat) {
        await GroupModel.updateOne({_id: chat.connectionId}, {$pull: {members: {connectionId: connectionId}}});
        await ProfileModel.updateOne({_id: connectionId}, {$pull: {chats: chat.id}});
    }
}



