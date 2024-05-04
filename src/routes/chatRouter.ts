import { Router } from "express";
import { ParameterCreateChat, createChat, deleteGroupChat, deleteIndividualChat } from "../controllers/chatController";
import { statusResponses } from "../configs";
import ChatModel from "../schemas/Chat";
import IndividualModel from "../schemas/Individual";
import ProfileModel from "../schemas/Profile";
import MessageModel from "../schemas/Message";
import GroupModel from "../schemas/Group";

const chatRouter = Router();

chatRouter.get('/:id', async (req, res) => {
    const chat = await ChatModel.findById(req.params.id);
    if (chat) {
        return res.json({status: statusResponses.EXECUTED, response: chat})
    }
    res.json({status: statusResponses.FAILED})
})

chatRouter.post('/description', async (req, res) => {
    if (req.body.id && req.body.profileId) {
        const chat = await ChatModel.findById(req.body.id);

        if (chat) {
            if (chat.category === "individual") {
                const individual = await IndividualModel.findById(chat.connectionId);
                if (individual) {
                    const member = individual.members.filter(eachMember => eachMember.connectionId !== req.body.profileId)[0];
                    if (member) {
                        const profile = await ProfileModel.findById(member.connectionId);
                        if (profile) {
                            return res.json({status: statusResponses.EXECUTED, response: {
                                id: member.connectionId,
                                firstName: profile.firstName,
                                lastName: profile.lastName,
                                avatar: profile.avatar,
                                activity: profile.activity
                            }});
                        }
                    }

                }
            } else if (chat.category === "group") {
                const group = await GroupModel.findById(chat.connectionId);

                if (group) {
                    return res.json({status: statusResponses.EXECUTED, response: {
                        id : group.id,
                        name: group.name,
                        membersCount: group.members.length,
                        avatar: group.avatar
                    }});
                }
            }
        }
    }

    return res.json({status: statusResponses.FAILED});
})

const guardCreateChat = (data: any): data is ParameterCreateChat => {
    if (data["category"] && data["connectionId"]) {
        if (["individual", "channel", "group"].includes(data["category"])) {
            return true;
        } 
    }

    return false;
}

/**
 * chat related 
 * @action CREATE
 */
chatRouter.post('/', async (req, res) => {
    if (guardCreateChat(req.body)) {
        const response = await createChat(req.body);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, id: response.id});
        }
    }
    res.json({status: statusResponses.FAILED});
})  


/**
 * individual chat related
 * @action DELETE
 */
chatRouter.post('/delete-individual-chat', async (req, res) => {
    if (req.body.chatId) {
        if (req.body.forOneConnection) {
            await deleteIndividualChat({type: "single", chatId: req.body.chatId, onlyForConnectionId: req.body.forOneConnection});
        } else {
            await deleteIndividualChat({type: "both", chatId: req.body.chatId});
        }

        return res.json({status: statusResponses.EXECUTED});
    }    
    res.json({status: statusResponses.FAILED});
})

/**
 * group chat related
 * @action DELETE
 */
chatRouter.post('/delete-group-chat', async (req, res) => {
    if (req.body.chatId) {
        await deleteGroupChat(req.body.chatId);
        return res.json({status: statusResponses.EXECUTED});
    }
    res.json({status: statusResponses.FAILED});
})

chatRouter.post('/active-info', async (req, res)  =>{ 
    if (req.body.chatId && req.body.profileId) {
        const chat = await ChatModel.findById(req.body.chatId);
        if (chat) {
            if (chat.category === "individual") {

                const individual = await IndividualModel.findById(chat.connectionId);

                if (individual) {
                    const receiverProfileId = individual.members.filter(eachMember => eachMember.connectionId !== req.body.profileId)[0];
                    const profile = await ProfileModel.findById(receiverProfileId.connectionId);

                    let member = individual.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];
                    const message = await MessageModel.findById(member.messages[member.messages.length - 1]);

                    if (profile && message) {

                        let messageContent = message.content;

                        if (message.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        } else if (message.messageType === 'video-msg') {
                            messageContent = 'Video message';
                        }

                        const response = {
                            profileId: profile.id,
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            avatar: {
                                color: profile.avatar.color,
                                mainImage: profile.avatar.mainImage
                            },
                            lastMessage: {
                                content: messageContent,
                                time: message.sendingTime
                            },
                            activity: profile.activity
                        }

                        return res.json({status: statusResponses.EXECUTED, response});
                    }
                }

            } else if (chat.category === "group") {
                const group = await GroupModel.findById(chat.connectionId);


                if (group) {
                    let member = group.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];
                    const message = await MessageModel.findById(member.messages[member.messages.length - 1]);
                    
                    if (message) {
                        const profile = await ProfileModel.findById(message.sender);

                        let messageContent = message.content;

                        if (message.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        } else if (message.messageType === 'video-msg') {
                            messageContent = 'Video message';
                        }

                        if (profile) {
                            const response = {
                                name: group.name,
                                avatar: {
                                    color: group.avatar.color,
                                    mainImage: group.avatar.mainImage
                                },
                                lastMessage: {
                                    sender: profile.firstName,
                                    content: messageContent,
                                    time: message.sendingTime
                                }
                            }

                            return res.json({status: statusResponses.EXECUTED, response});
                        }
                    }
                }

            }
        }
    }

    res.json({status: statusResponses.FAILED});
})


chatRouter.post('/lastMessage',  async (req, res) => {
    if (req.body.chatId && req.body.profileId) {
        const chat= await ChatModel.findById(req.body.chatId);

        if (chat) {
            if (chat.category === "individual") {
                const individual = await IndividualModel.findById(chat.connectionId);

                if (individual) {
                    const currentMember = individual.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];

                    const lastMessage = await MessageModel.findById(currentMember.messages[currentMember.messages.length - 1]);

                    if (lastMessage) {
                        let messageContent = lastMessage.content;

                        if (lastMessage.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        } else if (lastMessage.messageType === 'video-msg') {
                            messageContent = 'Video message';
                        }

                        res.json({
                            status: statusResponses.EXECUTED,
                            response: {
                                content: messageContent,
                                sendingTime: lastMessage.sendingTime
                            }
                        })
                    }
                }
            } else if (chat.category === "group") {
                const group = await GroupModel.findById(chat.connectionId);

                if (group) {
                    const currentMember = group.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];

                    const lastMessage = await MessageModel.findById(currentMember.messages[currentMember.messages.length - 1]);

                    if (lastMessage) {
                        let messageContent = lastMessage.content;

                        if (lastMessage.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        } else if (lastMessage.messageType === 'video-msg') {
                            messageContent = 'Video message';
                        }

                        const senderProfile = await ProfileModel.findById(lastMessage.sender);

                        res.json({
                            status: statusResponses.EXECUTED,
                            response: {
                                content: messageContent,
                                sendingTime: lastMessage.sendingTime,
                                sender: {
                                    firstName: senderProfile?.firstName,
                                    lastName: senderProfile?.lastName
                                }
                            }
                        })
                    }
                }
            }
        }
    }
})
export default chatRouter;



