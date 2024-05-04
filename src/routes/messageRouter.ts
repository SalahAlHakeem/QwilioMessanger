import { Router } from "express";
import { ParameterSendMessage, deleteMessage, deleteMessageForEveryone, sendMessage } from "../controllers/messageController";
import { statusResponses } from "../configs";
import MessageModel from "../schemas/Message";
import ChatModel from "../schemas/Chat";
import GroupModel from "../schemas/Group";
import ProfileModel, { IProfile } from "../schemas/Profile";
import IndividualModel from "../schemas/Individual";

const messageRouter = Router();

const guardSendMessage = (data: any): data is ParameterSendMessage => {
    return data["sender"] && data["receiver"] && data["content"] && data["messageType"];
}

messageRouter.post('/send', async (req, res) => {
    if (guardSendMessage(req.body)) {
        const response = await sendMessage(req.body);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, id: response.id})
        }
    }

    res.json({status: statusResponses.FAILED});
})

messageRouter.post('/chat-message', async (req, res) => {
    if (req.body.chatId && req.body.messageId) {
        const chat = await ChatModel.findById(req.body.chatId);
        const message = await MessageModel.findById(req.body.messageId)

        let forwardedProfile: IProfile | null = null;

        if (message) {
            if (message.forwardedFrom) {
                forwardedProfile = await ProfileModel.findById(forwardedProfile);
            }
        }

        if (chat && message) {
            if (chat.category === "individual") {
                const response = {
                    category: chat.category,
                    id: message.id,
                    sender: {
                        connectionId: message.sender
                    },
                    received: message.received,
                    replies: message.replies,
                    sendingTime: message.sendingTime,
                    content: message.content,
                    messageType: message.messageType,
                    isEdited: message.isEdited,
                    isPinned: message.isPinned,
                    isForwarded: message.isForwarded,
                    forwardedFrom: forwardedProfile ? {
                        name: forwardedProfile.firstName,
                        connectionId: message.forwardedFrom
                    } : null
                }
                return res.json({status: statusResponses.EXECUTED, response})
            } else if (chat.category === "group") {
                const profile = await ProfileModel.findById(message.sender);

                if (profile) {
                    const response = {
                        category: chat.category,
                        id: message.id,
                        sender: {
                            name: profile.firstName,
                            avatar: {
                                color: profile.avatar.color,
                                mainImage: profile.avatar.mainImage
                            },
                            connectionId: message.sender
                        },
                        received: message.received,
                        replies: message.replies,
                        sendingTime: message.sendingTime,
                        content: message.content,
                        messageType: message.messageType,
                        isEdited: message.isEdited,
                        isPinned: message.isPinned,
                        isForwarded: message.isForwarded,
                        forwardedFrom: forwardedProfile ? {
                            name: forwardedProfile.firstName,
                            connectionId: message.forwardedFrom
                        } : null
                    }

                    return res.json({status: statusResponses.EXECUTED, response});
                }
            }
        }
    } 

    res.json({status: statusResponses.FAILED})
})

messageRouter.post('/chat-messages', async (req, res) => {
    if (req.body.chatId && req.body.connectionId) {
        const chat = await ChatModel.findById(req.body.chatId);

        if (chat) {
            if (chat.category === "group") {
                const group = await GroupModel.findById(chat.connectionId);
                
                if (group) {
                    const currentMember = group.members.find(eachMember => eachMember.connectionId === req.body.connectionId);
                    if (currentMember) {
                        const messages = await MessageModel
                            .find({ _id: {$in: currentMember.messages}})
                            .sort({sendingTime: 1})
                            //.skip (req.body.offset ? req.body.offset: 0)
                            //.limit(50);

                        let response: any = [];

                        for (const currentMessage of messages) {
                            const currentProfile = await ProfileModel.findById(currentMessage.sender);
                            let forwardedProfile: IProfile | null = null;

                            if (currentMessage.forwardedFrom) {
                                forwardedProfile = await ProfileModel.findById(forwardedProfile);
                            }

                            let responseElement = {
                                category: chat.category,
                                id: currentMessage.id,
                                sender: {
                                    name: currentProfile?.firstName,
                                    avatar: {
                                        color: currentProfile?.avatar.color,
                                        mainImage: currentProfile?.avatar.mainImage
                                    },
                                    connectionId: currentMessage.sender
                                },
                                received: currentMessage.received,
                                replies: currentMessage.replies,
                                sendingTime: currentMessage.sendingTime,
                                content: currentMessage.content,
                                messageType: currentMessage.messageType,
                                isEdited: currentMessage.isEdited,
                                isPinned: currentMessage.isPinned,
                                isForwarded: currentMessage.isForwarded,
                                forwardedFrom: forwardedProfile ? {
                                    name: forwardedProfile.firstName,
                                    connectionId: currentMessage.forwardedFrom
                                } : null
                            }

                            response.push(responseElement);
                        }

                        return res.json({status: statusResponses.EXECUTED, response})
                    }
                }
            } else if (chat.category === "individual") {
                const individual  = await IndividualModel.findById(chat.connectionId);

                if (individual) {
                    const currentMember = individual.members.filter(eachMember => eachMember.connectionId === req.body.connectionId)[0];

                    const messages = await MessageModel
                        .find({ _id: {$in: currentMember.messages}})
                        .sort({sendingTime: 1})
                        //.skip (req.body.offset ? req.body.offset: 0)
                        //.limit(50);

                    let response: any = [];

                    for (const currentMessage of messages) {
                        let forwardedProfile: IProfile | null = null;

                        if (currentMessage.forwardedFrom) {
                            forwardedProfile = await ProfileModel.findById(forwardedProfile);
                        }

                        let responseElement = {
                            category: chat.category,
                            id: currentMessage.id,
                            sender: {
                                connectionId: currentMessage.sender
                            },
                            received: currentMessage.received,
                            replies: currentMessage.replies,
                            sendingTime: currentMessage.sendingTime,
                            content: currentMessage.content,
                            messageType: currentMessage.messageType,
                            isEdited: currentMessage.isEdited,
                            isPinned: currentMessage.isPinned,
                            isForwarded: currentMessage.isForwarded,
                            forwardedFrom: forwardedProfile ? {
                                name: forwardedProfile.firstName,
                                connectionId: currentMessage.forwardedFrom
                            } : null
                        }
                        response.push(responseElement);
                    }

                    return res.json({status: statusResponses.EXECUTED, response})
                }
            }
        }
    }

    res.json({status: statusResponses.FAILED})
})

messageRouter.get('/:id', async (req, res) => {
    if (req.params.id) {
        const response = await MessageModel.findById(req.params.id);
        res.json({status: statusResponses.EXECUTED, response });
    } else {
        res.json({status: statusResponses.FAILED});
    }
})

messageRouter.post('/delete-everyone', async (req, res) => {
    if (req.body.messageId) {
        await deleteMessageForEveryone(req.body.messageId);
        return res.json({status: statusResponses.EXECUTED});
    }

    res.json({status: statusResponses.FAILED})
})

messageRouter.post('/delete-single', async (req, res) => {
    if (req.body.connectionId && req.body.messageId) {
        const message = await MessageModel.findById(req.body.messageId);

        if (message) {
            const chat = await ChatModel.findById(message.receiver);

            if (chat) {
                if (chat.category === "individual") {
                    await IndividualModel.updateOne(
                        {_id: chat.connectionId},
                        {
                            $pull: {
                                "members.$[element].messages": message.id
                            }
                        },
                        {
                            arrayFilters: [
                                {"element.connectionId": req.body.connectionId }
                            ]
                        }
                    );

                    const individualChat = await IndividualModel.findById(chat.connectionId);

                    if (individualChat) {
                        let messageExistingCount = 0;

                        for (const currentMember of individualChat.members) {
                            const membersWithMessage = currentMember.messages.filter(eachMessage => eachMessage === message.id);

                            if (membersWithMessage.length > 0) {
                               messageExistingCount++;
                            }
                        }

                        if (messageExistingCount === 0) {
                            await ChatModel.updateOne( {_id: chat.id},
                                {$pull: { messages: message.id }}
                            )
                        }
                    }

                    return res.json({status: statusResponses.EXECUTED});
                } else if (chat.category === "group") {

                    await GroupModel.updateOne(
                        {_id: chat.connectionId},
                        {
                            $pull: {
                                "members.$[element].messages": message.id
                            }
                        },
                        {
                            arrayFilters: [
                                {"element.connectionId": req.body.connectionId }
                            ]
                        }
                    );

                    const groupChat = await GroupModel.findById(chat.connectionId);

                    if (groupChat) {
                        let messageExistingCount = 0;

                        for (const currentMember of groupChat.members) {
                            const membersWithMessage = currentMember.messages.filter(eachMessage => eachMessage === message.id);

                            if (membersWithMessage.length > 0) {
                               messageExistingCount++;
                            }
                        }

                        if (messageExistingCount === 0) {
                            await ChatModel.updateOne( {_id: chat.id},
                                {$pull: { messages: message.id }}
                            )
                        }
                    }

                    return res.json({status: statusResponses.EXECUTED});
                }
            }
        }

    }

    res.json({status: statusResponses.FAILED})
})


export default messageRouter;

