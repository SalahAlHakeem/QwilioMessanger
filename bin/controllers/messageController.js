"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageForEveryone = exports.deleteMessage = exports.forwardMessage = exports.editMessage = exports.markMessageAsRead = exports.unpinMessage = exports.pinMessage = exports.getReplyMessages = exports.getMessagesOfChat = exports.sendMessage = void 0;
const Chat_1 = __importDefault(require("../schemas/Chat"));
const Group_1 = __importDefault(require("../schemas/Group"));
const Individual_1 = __importDefault(require("../schemas/Individual"));
const Message_1 = __importDefault(require("../schemas/Message"));
/**
 * Creates a new message document. Updates the activity status of chat.
 * Appends the `id` of created message to chat as well as to each member of group or individual converstation.
 * For reply messages, appends the `id` of created message to replies property of original message.
 *
 *
 * @mutates `Message`, `Individual`, `Group`
 * @returns `id` of created message document
 */
const sendMessage = ({ sender, receiver, content, messageType, replyMessageId }) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(receiver);
    if (chat) {
        const createdMessage = yield Message_1.default.create({
            sender: sender,
            receiver: receiver,
            content: content,
            messageType: messageType,
            sendingTime: new Date(),
            replies: [],
            received: []
        });
        yield Chat_1.default.updateOne({ _id: receiver }, { $set: { latelyUsedAt: new Date() }, $push: { messages: createdMessage.id } });
        if (chat.category === "individual") {
            yield Individual_1.default.updateOne({ _id: chat.connectionId }, { $push: { "members.$[].messages": createdMessage.id } });
        }
        else if (chat.category === "group") {
            yield Group_1.default.updateOne({ _id: chat.connectionId }, { $push: { "members.$[].messages": createdMessage.id } });
        }
        if (replyMessageId) {
            yield Message_1.default.updateOne({ _id: replyMessageId }, { $push: { replies: createdMessage.id } });
        }
        return createdMessage;
    }
    return null;
});
exports.sendMessage = sendMessage;
/**
 * Search the last 50 message with given offset for specifc member of chat.
 * Messages are returned by most recently sent messages.
 *
 * @queries `Chat`, `Individual`, `Message`
 * @returns for matching find result it gives the array of document where each document has similarity with `IMessage`
 */
const getMessagesOfChat = ({ chatId, connectionId, offset = 0 }) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(chatId);
    if (chat) {
        if (chat.category === "individual") {
            const individualChat = yield Individual_1.default.findById(chat.connectionId);
            if (individualChat) {
                const member = individualChat.members.find(eachMember => eachMember.connectionId === connectionId);
                if (member) {
                    return yield Message_1.default
                        .find({ _id: { $in: member.messages } })
                        .sort({ sendingTime: -1 })
                        .skip(offset)
                        .limit(50);
                }
            }
        }
        else if (chat.category === "group") {
            const groupChat = yield Group_1.default.findById(chat.connectionId);
            if (groupChat) {
                const member = groupChat.members.find(eachMember => eachMember.connectionId === connectionId);
                if (member) {
                    return yield Message_1.default
                        .find({ _id: { $in: member.messages } })
                        .sort({ sendingTime: -1 })
                        .skip(offset)
                        .limit(50);
                }
            }
        }
    }
    return null;
});
exports.getMessagesOfChat = getMessagesOfChat;
/**
 * Message can have replies which are another messages.
 * Extracts the all replies of original message by sorting with most lately sent
 *
 * @queries `MessageModel`
 * @param messageId the `id` of original message
 * @returns the array of document where each document has similarity with `IMessage` which are sent as replies
 */
const getReplyMessages = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield Message_1.default.findById(messageId);
    if (message) {
        return yield Message_1.default.find({ _id: { $in: message.replies } }).sort({ sendingTime: -1 });
    }
    return null;
});
exports.getReplyMessages = getReplyMessages;
/**
 * @param notify decides to send or not to send push notification to all members of pinned message
 */
const pinMessage = (messageId, notify = false) => __awaiter(void 0, void 0, void 0, function* () {
    yield Message_1.default.updateOne({ _id: messageId }, { $set: { isPinned: true } });
});
exports.pinMessage = pinMessage;
const unpinMessage = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    yield Message_1.default.updateOne({ _id: messageId }, { $set: { isPinned: false } });
});
exports.unpinMessage = unpinMessage;
/**
 * When message is received and read by user, then it synchronized who and when read the message
 */
const markMessageAsRead = ({ connectionId, receivedAt, messageId }) => __awaiter(void 0, void 0, void 0, function* () {
    yield Message_1.default.updateOne({ _id: messageId }, {
        $push: {
            received: {
                connectionId: connectionId,
                receivedAt: receivedAt
            }
        }
    });
});
exports.markMessageAsRead = markMessageAsRead;
/**
 * Changes the content of messsage and marks is as edited. Prevents editing the forwarded message, they cannot be edited
 */
const editMessage = (messageId, newContent) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield Message_1.default.findById(messageId);
    if (message) {
        if (!message.isForwarded) {
            yield Message_1.default.updateOne({ _id: messageId }, { $set: { content: newContent, isEdited: true } });
        }
    }
});
exports.editMessage = editMessage;
/**
 * Creates a new message as forwarded message based on the properties of original message
 *
 * @mutates `Message`, `Chat`, `Group`
 * @returns `id` of created message document
 */
const forwardMessage = ({ sender, chatId, messageId }) => __awaiter(void 0, void 0, void 0, function* () {
    const forwardingMessage = yield Message_1.default.findById(messageId);
    if (forwardingMessage) {
        const createdMessage = yield Message_1.default.create({
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
        yield Chat_1.default.updateOne({ _id: chatId }, { $set: { latelyUsedAt: new Date() }, $push: { messages: createdMessage.id } });
        const chat = yield Chat_1.default.findById(chatId);
        if (chat) {
            if (chat.category === "individual") {
                yield Individual_1.default.updateOne({ _id: chat.connectionId }, { $push: { "members.$[].messages": createdMessage.id } });
            }
            else if (chat.category === "group") {
                yield Group_1.default.updateOne({ _id: chat.connectionId }, { $push: { "members.$[].messages": createdMessage.id } });
            }
        }
        return createdMessage.id;
    }
    return null;
});
exports.forwardMessage = forwardMessage;
/**
 * Deletes the message only for specied profile
 * @mutates `Message`, `Group`, `Individual`
 */
const deleteMessage = (connectionId, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const msgDetails = yield Message_1.default.findById(messageId);
    if (msgDetails) {
        const chat = yield Chat_1.default.findById(msgDetails.receiver);
        if (chat && chat.category === "individual") {
            yield Individual_1.default.updateOne({ _id: chat.connectionId }, {
                $pull: { "members.$[element].messages": messageId }
            }, {
                arrayFilters: [
                    { "element.connectionId": connectionId }
                ]
            });
        }
        else if (chat && chat.category === "group") {
            yield Group_1.default.updateOne({ _id: chat.connectionId }, {
                $pull: { "members.$[element].messages": messageId }
            }, {
                arrayFilters: [
                    { "element.connectionId": connectionId }
                ]
            });
        }
    }
});
exports.deleteMessage = deleteMessage;
/**
 * Deletes the message for all receivers
 * @mutates `Message`, `Group`, `Individual`
 */
const deleteMessageForEveryone = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const msgDetails = yield Message_1.default.findById(messageId);
    if (msgDetails) {
        yield Message_1.default.deleteOne({ _id: messageId });
        yield Chat_1.default.updateOne({ _id: msgDetails.receiver }, { $pull: { messages: msgDetails.id } });
        const chat = yield Chat_1.default.findById(msgDetails.receiver);
        if (chat && chat.category === "individual") {
            yield Individual_1.default.updateOne({ _id: chat.connectionId }, {
                $pull: { "members.$[].messages": messageId }
            });
        }
        else if (chat && chat.category === "group") {
            yield Group_1.default.updateOne({ _id: chat.connectionId }, {
                $pull: { "members.$[].messages": messageId }
            });
        }
    }
});
exports.deleteMessageForEveryone = deleteMessageForEveryone;
