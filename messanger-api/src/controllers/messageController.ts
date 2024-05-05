import { send } from "process";
import ChatModel from "../schemas/Chat";
import GroupModel from "../schemas/Group";
import IndividualModel from "../schemas/Individual";
import MessageModel, { IMessage } from "../schemas/Message";

export type ParameterSendMessage = 
    Pick<IMessage, 'sender' | 'receiver' | 'content' > & 
    {replyMessageId?: string, messageType: 'text-msg' | 'audio-msg' | 'video-msg'};

/**
 * Creates a new message document. Updates the activity status of chat. 
 * Appends the `id` of created message to chat as well as to each member of group or individual converstation.
 * For reply messages, appends the `id` of created message to replies property of original message.
 * 
 * 
 * @mutates `Message`, `Individual`, `Group`
 * @returns `id` of created message document
 */
export const sendMessage = async ({sender, receiver, content, messageType, replyMessageId}: ParameterSendMessage) => {
    const chat = await ChatModel.findById(receiver);

    if (chat) {
        const createdMessage = await MessageModel.create({
            sender: sender,
            receiver: receiver,
            content: content,
            messageType: messageType,
            sendingTime: new Date(),
            replies: [],
            received: []
        });

        await ChatModel.updateOne({_id: receiver}, {$set: {latelyUsedAt: new Date()}, $push: {messages: createdMessage.id}});

        if (chat.category === "individual") {
            await IndividualModel.updateOne(
                {_id: chat.connectionId}, 
                {$push: {"members.$[].messages": createdMessage.id}}
            );
        } else if (chat.category === "group") {
            await GroupModel.updateOne(
                {_id: chat.connectionId},
                {$push: {"members.$[].messages": createdMessage.id}}
            )
        }

        if (replyMessageId) {
            await MessageModel.updateOne({_id: replyMessageId}, {$push: {replies: createdMessage.id}})
        }

        return createdMessage;
    }

    return null;
}

type ParameterGetMessagesOfChat = {
    connectionId: string;
    chatId: string;
    offset: number;
}


/**
 * Search the last 50 message with given offset for specifc member of chat. 
 * Messages are returned by most recently sent messages.
 * 
 * @queries `Chat`, `Individual`, `Message`
 * @returns for matching find result it gives the array of document where each document has similarity with `IMessage`
 */
export const getMessagesOfChat = async ({chatId, connectionId, offset = 0}: ParameterGetMessagesOfChat) => {
    const chat = await ChatModel.findById(chatId);

    if (chat) {
        if (chat.category === "individual") {
            const individualChat = await IndividualModel.findById(chat.connectionId);
            
            if (individualChat) {
                const member = individualChat.members.find(eachMember => eachMember.connectionId === connectionId);

                if (member) {
                    return await MessageModel
                        .find({_id: {$in: member.messages}})
                        .sort({sendingTime: -1})
                        .skip (offset)
                        .limit(50)
                    ;
                }
            }
        } else if (chat.category === "group") {
            const groupChat = await GroupModel.findById(chat.connectionId);

            if (groupChat) {
                const member = groupChat.members.find(eachMember => eachMember.connectionId === connectionId);

                if (member) {
                    return await MessageModel
                        .find({_id: {$in: member.messages}})
                        .sort({sendingTime: -1})
                        .skip (offset)
                        .limit(50)
                    ;
                }
            }
        }
    }

    return null;
}

/**
 * Message can have replies which are another messages. 
 * Extracts the all replies of original message by sorting with most lately sent 
 * 
 * @queries `MessageModel`
 * @param messageId the `id` of original message
 * @returns the array of document where each document has similarity with `IMessage` which are sent as replies
 */
export const getReplyMessages = async (messageId: string) => {
    const message = await MessageModel.findById(messageId);

    if (message) {
        return await MessageModel.find({_id: {$in: message.replies}}).sort({sendingTime: -1});
    }

    return null;
}

/**
 * @param notify decides to send or not to send push notification to all members of pinned message 
 */
export const pinMessage = async (messageId: string, notify = false): Promise<void> => {
    await MessageModel.updateOne({_id: messageId}, {$set: {isPinned: true}})
}

export const unpinMessage = async (messageId: string): Promise<void> => {
    await MessageModel.updateOne({_id: messageId}, {$set: {isPinned: false}})
}

type ParameterMarkMessageAsRead = {
    messageId: string;
    connectionId: string;
    receivedAt: Date;
}

/**
 * When message is received and read by user, then it synchronized who and when read the message
 */
export const markMessageAsRead = async ({connectionId, receivedAt, messageId}: ParameterMarkMessageAsRead ): Promise<void> => {
    await MessageModel.updateOne({_id: messageId}, {
        $push: {
            received: {
                connectionId: connectionId,
                receivedAt: receivedAt
            }
        }
    })
}

/**
 * Changes the content of messsage and marks is as edited. Prevents editing the forwarded message, they cannot be edited
 */
export const editMessage = async (messageId: string, newContent: string): Promise<void> => {
    const message = await MessageModel.findById(messageId);

    if (message) {
        if (!message.isForwarded) {
            await MessageModel.updateOne({_id : messageId}, {$set: {content: newContent, isEdited: true}});
        }
    }
}

type ParameterForwardMessage = {
    sender: string;
    chatId: string;
    messageId: string;
}

/**
 * Creates a new message as forwarded message based on the properties of original message
 * 
 * @mutates `Message`, `Chat`, `Group`
 * @returns `id` of created message document
 */
export const forwardMessage = async ({sender, chatId, messageId}: ParameterForwardMessage): Promise<string | null> => {
    const forwardingMessage = await MessageModel.findById(messageId);

    if (forwardingMessage) {
        const createdMessage = await MessageModel.create({
            sender,
            messageType: forwardingMessage.messageType,
            content: forwardingMessage.content,
            receiver: chatId,
            sendingTime: new Date(),
            received: [],
            replies: [],
            isForwarded: true,
            forwardedFrom: forwardingMessage.sender
        });

        await ChatModel.updateOne({_id: chatId}, {$set: {latelyUsedAt: new Date()}, $push: {messages: createdMessage.id}});
        const chat = await ChatModel.findById(chatId);

        if (chat) {
            if (chat.category === "individual") {
                await IndividualModel.updateOne(
                    {_id: chat.connectionId}, 
                    {$push: {"members.$[].messages": createdMessage.id}}
                );
            } else if (chat.category === "group") {
                await GroupModel.updateOne(
                    {_id: chat.connectionId},
                    {$push: {"members.$[].messages": createdMessage.id}}
                )
            }
        }

        return createdMessage.id;
    }

    return null;
}

/**
 * Deletes the message only for specied profile
 * @mutates `Message`, `Group`, `Individual`
 */
export const deleteMessage = async (connectionId: string, messageId: string): Promise<void> => {
    const msgDetails = await MessageModel.findById(messageId);

    if (msgDetails) {
        const chat = await ChatModel.findById(msgDetails.receiver);

        if (chat && chat.category === "individual") {
            await IndividualModel.updateOne(
                {_id: chat.connectionId},
                {
                    $pull: {"members.$[element].messages": messageId}
                },
                {
                    arrayFilters: [
                        {"element.connectionId": connectionId  }
                    ]
                }
            )
        } else if (chat && chat.category === "group") {
            await GroupModel.updateOne(
                {_id: chat.connectionId}, 
                {
                    $pull: { "members.$[element].messages": messageId}
                },
                {
                    arrayFilters: [
                        {"element.connectionId": connectionId  }
                    ]
                }
            );
        }

    }
}

/**
 * Deletes the message for all receivers
 * @mutates `Message`, `Group`, `Individual`
 */
export const deleteMessageForEveryone = async (messageId: string): Promise<void> => {
    const msgDetails = await MessageModel.findById(messageId);

    if (msgDetails) {
        await MessageModel.deleteOne({_id: messageId});
        await ChatModel.updateOne({_id: msgDetails.receiver}, {$pull: {messages: msgDetails.id}});

        const chat = await ChatModel.findById(msgDetails.receiver);

        if (chat && chat.category === "individual") {
            await IndividualModel.updateOne(
                {_id: chat.connectionId},
                {
                    $pull: {"members.$[].messages": messageId}
                }
            )
        } else if (chat && chat.category === "group") {
            await GroupModel.updateOne(
                {_id: chat.connectionId}, 
                {
                    $pull: { "members.$[].messages": messageId}
                }
            );
        }
    }

}