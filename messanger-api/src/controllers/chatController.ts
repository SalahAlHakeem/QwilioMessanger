import ChatModel, { IChat } from "../schemas/Chat";
import ProfileModel from "../schemas/Profile";
import MessageModel from "../schemas/Message";
import IndividualModel from "../schemas/Individual";
import GroupModel from "../schemas/Group";

export const getProfileChats = async (profileId: string) => {
    const chatIDs = await ProfileModel.findById(profileId);

    if (chatIDs) {
        return await ChatModel.find({_id: {$in: chatIDs.chats}}).sort({latelyUsedAt: -1});
    } 

    return null;
}

export type ParameterCreateChat = Pick<IChat, 'category' | 'connectionId'>;

export const createChat = async ({category, connectionId}: ParameterCreateChat) => {
    const createdChat = await ChatModel.create({
        category: category,
        connectionId: connectionId
    })

    if (category === "individual") {
        const individualChat = await IndividualModel.findById(connectionId);

        if (individualChat) {
            for (const currentMember of individualChat.members) {
                await ProfileModel.updateOne({_id: currentMember.connectionId}, {$push: {chats: createdChat.id}})
            }
        }
 
    } else if (category === "group") {
        const group = await GroupModel.findById(connectionId);

        if (group) {
            for (const currentMember of group.members) {
                await ProfileModel.updateOne({_id: currentMember.connectionId}, {$push: {chats: createdChat.id}})
            }
        }
    }

    return createdChat;
}

export type ParameterDeleteIndividualChat = {
    type: 'single' | 'both';
    chatId: string;
    onlyForConnectionId?: string;
}

export const deleteIndividualChat = async ({type, chatId, onlyForConnectionId}: ParameterDeleteIndividualChat) => {
    const chat = await ChatModel.findById(chatId);

    if (chat) {
        if (type === "single") {
            const individual = await IndividualModel.findById(chat.connectionId);

            if (individual) {
                if (individual.members.length != 2) {
                    await IndividualModel.deleteOne({_id: chat.connectionId});
                    await ChatModel.deleteOne({_id: chatId});

                    await MessageModel.deleteMany({_id: {$in: chat.messages}});
                } else {
                    await IndividualModel.updateOne(
                        {_id: chat.connectionId},
                        {
                            $pull: {
                                "members": {
                                    connectionId: onlyForConnectionId
                                } 
                            }
                        }
                    );
                }
            }

            await ProfileModel.updateOne({_id: onlyForConnectionId}, {$pull: {chats: chatId}});
        } else if (type === "both") {
            const individual = await IndividualModel.findById(chat.connectionId);

            if (individual) {
                for (const member of individual.members) {
                    await ProfileModel.updateOne({_id: member.connectionId}, {$pull: {chats: chatId}});
                }
            }

            await IndividualModel.deleteOne({_id: chat.connectionId});
            await ChatModel.deleteOne({_id: chatId});   
            await MessageModel.deleteMany({_id: {$in: chat.messages}});
        }
    }
}


export const deleteGroupChat = async (chatId: string) => {
    const chat = await ChatModel.findById(chatId);

    if (chat) {
        const group = await GroupModel.findById({_id: chat.connectionId});

        if (group) {
            for (const member of group.members) {
                await ProfileModel.updateOne({_id: member.connectionId}, {$pull: {chats: chatId}});
            }

            await MessageModel.deleteMany({_id: {$in: chat.messages}});
            await GroupModel.deleteOne({_id: chat.connectionId});
            await ChatModel.deleteOne({_id: chatId})
        }
    }
}