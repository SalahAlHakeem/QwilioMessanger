import ChatModel from "../schemas/Chat"
import GroupModel from "../schemas/Group";
import IndividualModel from "../schemas/Individual";
import ProfileModel from "../schemas/Profile";
import { IConnection, NewMessageArgs } from "./socketServer"

export const notifyNewMessage = async (messageInfo: NewMessageArgs["data"], connections: Array<IConnection>) => {
    const chat = await ChatModel.findById(messageInfo.chatId);

    if (chat) {
        if (chat.category === "individual") {
            const individual = await IndividualModel.findById(chat.connectionId);

            if (individual) {                
                for (const eachConnection of connections) {
                    for (const eachMember of individual.members) {
                        if (eachConnection.profileId === eachMember.connectionId) {
                            eachConnection.socket.send(JSON.stringify({type: 'new-message', data: {
                                chatId: chat.id,
                                messageId: messageInfo.messageId,
                                profileId: messageInfo.profileId
                            }}));
                        }
                    }
                }
            }
        } else if (chat.category === "group") {
            const group = await GroupModel.findById(chat.connectionId);

            if (group) {
                for (const eachMember of group.members) {
                    for (const eachConnection of connections) {
                        if (eachMember.connectionId === eachConnection.profileId) {
                            eachConnection.socket.send(JSON.stringify({type: 'new-message', data: {
                                chatId: chat.id,
                                messageId: messageInfo.messageId,
                                profileId: messageInfo.profileId
                            }}))
                        }
                    }
                }
            }
        }   
    }
}

export const removeDeletedMessage = async (messageId: string, chatId: string, connections: Array<IConnection>) => {
    const chat = await ChatModel.findById(chatId);

    if (chat) {
        if (chat.category === "individual"){
            const individual = await IndividualModel.findById(chat.connectionId);

            if (individual) {
                for (const eachMember of individual.members) {
                    for (const eachConnection of connections) {
                        if (eachMember.connectionId === eachConnection.profileId) {
                            eachConnection.socket.send(JSON.stringify({
                                type: 'message-deleted',
                                data: {
                                    messageId,
                                    chatId: chat.id
                                }
                            }))
                        }
                    }
                }
            }
        } else if (chat.category === "group") {
            const group = await GroupModel.findById(chat.connectionId);

            if (group) {
                for (const eachMember of group.members) {
                    for (const eachConnection of connections) {
                        if (eachMember.connectionId === eachConnection.profileId) {
                            eachConnection.socket.send(JSON.stringify({
                                type: 'message-deleted',
                                data: {
                                    messageId,
                                    chatId: chat.id
                                }
                            }))
                        }
                    }
                }
            }
        }
    }
}


export const updateProfileActivity = async (profileId: string, status: "active" | "inactive", connections: Array<IConnection>) => {
    if (status === "active") {
        await ProfileModel.updateOne({_id: profileId}, {$set: {
            "activity.latelyActiveAt": new Date(),
            "activity.isOnline": true
        }});
    } else {
        await ProfileModel.updateOne({_id: profileId}, {$set: {
            "activity.isOnline": false
        }});
    }

    const profile = await ProfileModel.findById(profileId);
    if (profile) {
        for (const eachChatId of profile.chats) {
            const chat = await ChatModel.findById(eachChatId);

            if (chat) {
                if (chat.category === "individual") {
                    const individual = await IndividualModel.findById(chat.connectionId);

                    if (individual) {
                        const member = individual.members.filter(eachMember => eachMember.connectionId !== profileId)[0];

                        for (const eachConnection of connections) {
                            if (eachConnection.profileId === member.connectionId) {
                                eachConnection.socket.send(JSON.stringify({
                                    type: 'update-activity-status',
                                    data: {
                                        latelyActiveAt: profile.activity.latelyActiveAt,
                                        isOnline: profile.activity.isOnline,
                                        profileId: profile.id
                                    }
                                }))
                            }
                        }
                    }
                } else if (chat.category === "group") {
                    const group = await GroupModel.findById(chat.connectionId);

                    if (group) {
                        for (const eachMember of group.members) {
                            for (const eachConnection of connections) {
                                if (eachConnection.profileId !== profileId && eachMember.connectionId === eachConnection.profileId) {
                                    eachConnection.socket.send(JSON.stringify({
                                        type: 'update-activity-status',
                                        data: {
                                            latelyActiveAt: profile.activity.latelyActiveAt,
                                            isOnline: profile.activity.isOnline,
                                            profileId: profile.id
                                        }
                                    }))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}

