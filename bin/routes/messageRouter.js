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
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const configs_1 = require("../configs");
const Message_1 = __importDefault(require("../schemas/Message"));
const Chat_1 = __importDefault(require("../schemas/Chat"));
const Group_1 = __importDefault(require("../schemas/Group"));
const Profile_1 = __importDefault(require("../schemas/Profile"));
const Individual_1 = __importDefault(require("../schemas/Individual"));
const messageRouter = (0, express_1.Router)();
const guardSendMessage = (data) => {
    return data["sender"] && data["receiver"] && data["content"] && data["messageType"];
};
messageRouter.post('/send', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (guardSendMessage(req.body)) {
        const response = yield (0, messageController_1.sendMessage)(req.body);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, id: response.id });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
messageRouter.post('/chat-message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.chatId && req.body.messageId) {
        const chat = yield Chat_1.default.findById(req.body.chatId);
        const message = yield Message_1.default.findById(req.body.messageId);
        let forwardedProfile = null;
        if (message) {
            if (message.forwardedFrom) {
                forwardedProfile = yield Profile_1.default.findById(forwardedProfile);
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
                };
                return res.json({ status: configs_1.statusResponses.EXECUTED, response });
            }
            else if (chat.category === "group") {
                const profile = yield Profile_1.default.findById(message.sender);
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
                    };
                    return res.json({ status: configs_1.statusResponses.EXECUTED, response });
                }
            }
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
messageRouter.post('/chat-messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.chatId && req.body.connectionId) {
        const chat = yield Chat_1.default.findById(req.body.chatId);
        if (chat) {
            if (chat.category === "group") {
                const group = yield Group_1.default.findById(chat.connectionId);
                if (group) {
                    const currentMember = group.members.find(eachMember => eachMember.connectionId === req.body.connectionId);
                    if (currentMember) {
                        const messages = yield Message_1.default
                            .find({ _id: { $in: currentMember.messages } })
                            .sort({ sendingTime: 1 });
                        //.skip (req.body.offset ? req.body.offset: 0)
                        //.limit(50);
                        let response = [];
                        for (const currentMessage of messages) {
                            const currentProfile = yield Profile_1.default.findById(currentMessage.sender);
                            let forwardedProfile = null;
                            if (currentMessage.forwardedFrom) {
                                forwardedProfile = yield Profile_1.default.findById(forwardedProfile);
                            }
                            let responseElement = {
                                category: chat.category,
                                id: currentMessage.id,
                                sender: {
                                    name: currentProfile === null || currentProfile === void 0 ? void 0 : currentProfile.firstName,
                                    avatar: {
                                        color: currentProfile === null || currentProfile === void 0 ? void 0 : currentProfile.avatar.color,
                                        mainImage: currentProfile === null || currentProfile === void 0 ? void 0 : currentProfile.avatar.mainImage
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
                            };
                            response.push(responseElement);
                        }
                        return res.json({ status: configs_1.statusResponses.EXECUTED, response });
                    }
                }
            }
            else if (chat.category === "individual") {
                const individual = yield Individual_1.default.findById(chat.connectionId);
                if (individual) {
                    const currentMember = individual.members.filter(eachMember => eachMember.connectionId === req.body.connectionId)[0];
                    const messages = yield Message_1.default
                        .find({ _id: { $in: currentMember.messages } })
                        .sort({ sendingTime: 1 });
                    //.skip (req.body.offset ? req.body.offset: 0)
                    //.limit(50);
                    let response = [];
                    for (const currentMessage of messages) {
                        let forwardedProfile = null;
                        if (currentMessage.forwardedFrom) {
                            forwardedProfile = yield Profile_1.default.findById(forwardedProfile);
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
                        };
                        response.push(responseElement);
                    }
                    return res.json({ status: configs_1.statusResponses.EXECUTED, response });
                }
            }
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
messageRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield Message_1.default.findById(req.params.id);
        res.json({ status: configs_1.statusResponses.EXECUTED, response });
    }
    else {
        res.json({ status: configs_1.statusResponses.FAILED });
    }
}));
messageRouter.post('/delete-everyone', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.messageId) {
        yield (0, messageController_1.deleteMessageForEveryone)(req.body.messageId);
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
messageRouter.post('/delete-single', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.connectionId && req.body.messageId) {
        const message = yield Message_1.default.findById(req.body.messageId);
        if (message) {
            const chat = yield Chat_1.default.findById(message.receiver);
            if (chat) {
                if (chat.category === "individual") {
                    yield Individual_1.default.updateOne({ _id: chat.connectionId }, {
                        $pull: {
                            "members.$[element].messages": message.id
                        }
                    }, {
                        arrayFilters: [
                            { "element.connectionId": req.body.connectionId }
                        ]
                    });
                    const individualChat = yield Individual_1.default.findById(chat.connectionId);
                    if (individualChat) {
                        let messageExistingCount = 0;
                        for (const currentMember of individualChat.members) {
                            const membersWithMessage = currentMember.messages.filter(eachMessage => eachMessage === message.id);
                            if (membersWithMessage.length > 0) {
                                messageExistingCount++;
                            }
                        }
                        if (messageExistingCount === 0) {
                            yield Chat_1.default.updateOne({ _id: chat.id }, { $pull: { messages: message.id } });
                        }
                    }
                    return res.json({ status: configs_1.statusResponses.EXECUTED });
                }
                else if (chat.category === "group") {
                    yield Group_1.default.updateOne({ _id: chat.connectionId }, {
                        $pull: {
                            "members.$[element].messages": message.id
                        }
                    }, {
                        arrayFilters: [
                            { "element.connectionId": req.body.connectionId }
                        ]
                    });
                    const groupChat = yield Group_1.default.findById(chat.connectionId);
                    if (groupChat) {
                        let messageExistingCount = 0;
                        for (const currentMember of groupChat.members) {
                            const membersWithMessage = currentMember.messages.filter(eachMessage => eachMessage === message.id);
                            if (membersWithMessage.length > 0) {
                                messageExistingCount++;
                            }
                        }
                        if (messageExistingCount === 0) {
                            yield Chat_1.default.updateOne({ _id: chat.id }, { $pull: { messages: message.id } });
                        }
                    }
                    return res.json({ status: configs_1.statusResponses.EXECUTED });
                }
            }
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
exports.default = messageRouter;
