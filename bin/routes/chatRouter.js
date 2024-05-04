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
const chatController_1 = require("../controllers/chatController");
const configs_1 = require("../configs");
const Chat_1 = __importDefault(require("../schemas/Chat"));
const Individual_1 = __importDefault(require("../schemas/Individual"));
const Profile_1 = __importDefault(require("../schemas/Profile"));
const Message_1 = __importDefault(require("../schemas/Message"));
const Group_1 = __importDefault(require("../schemas/Group"));
const chatRouter = (0, express_1.Router)();
chatRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(req.params.id);
    if (chat) {
        return res.json({ status: configs_1.statusResponses.EXECUTED, response: chat });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
chatRouter.post('/description', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.id && req.body.profileId) {
        const chat = yield Chat_1.default.findById(req.body.id);
        if (chat) {
            if (chat.category === "individual") {
                const individual = yield Individual_1.default.findById(chat.connectionId);
                if (individual) {
                    const member = individual.members.filter(eachMember => eachMember.connectionId !== req.body.profileId)[0];
                    if (member) {
                        const profile = yield Profile_1.default.findById(member.connectionId);
                        if (profile) {
                            return res.json({ status: configs_1.statusResponses.EXECUTED, response: {
                                    id: member.connectionId,
                                    firstName: profile.firstName,
                                    lastName: profile.lastName,
                                    avatar: profile.avatar,
                                    activity: profile.activity
                                } });
                        }
                    }
                }
            }
            else if (chat.category === "group") {
                const group = yield Group_1.default.findById(chat.connectionId);
                if (group) {
                    return res.json({ status: configs_1.statusResponses.EXECUTED, response: {
                            id: group.id,
                            name: group.name,
                            membersCount: group.members.length,
                            avatar: group.avatar
                        } });
                }
            }
        }
    }
    return res.json({ status: configs_1.statusResponses.FAILED });
}));
const guardCreateChat = (data) => {
    if (data["category"] && data["connectionId"]) {
        if (["individual", "channel", "group"].includes(data["category"])) {
            return true;
        }
    }
    return false;
};
/**
 * chat related
 * @action CREATE
 */
chatRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (guardCreateChat(req.body)) {
        const response = yield (0, chatController_1.createChat)(req.body);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, id: response.id });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * individual chat related
 * @action DELETE
 */
chatRouter.post('/delete-individual-chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.chatId) {
        if (req.body.forOneConnection) {
            yield (0, chatController_1.deleteIndividualChat)({ type: "single", chatId: req.body.chatId, onlyForConnectionId: req.body.forOneConnection });
        }
        else {
            yield (0, chatController_1.deleteIndividualChat)({ type: "both", chatId: req.body.chatId });
        }
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * group chat related
 * @action DELETE
 */
chatRouter.post('/delete-group-chat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.chatId) {
        yield (0, chatController_1.deleteGroupChat)(req.body.chatId);
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
chatRouter.post('/active-info', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.chatId && req.body.profileId) {
        const chat = yield Chat_1.default.findById(req.body.chatId);
        if (chat) {
            if (chat.category === "individual") {
                const individual = yield Individual_1.default.findById(chat.connectionId);
                if (individual) {
                    const receiverProfileId = individual.members.filter(eachMember => eachMember.connectionId !== req.body.profileId)[0];
                    const profile = yield Profile_1.default.findById(receiverProfileId.connectionId);
                    let member = individual.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];
                    const message = yield Message_1.default.findById(member.messages[member.messages.length - 1]);
                    if (profile && message) {
                        let messageContent = message.content;
                        if (message.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        }
                        else if (message.messageType === 'video-msg') {
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
                        };
                        return res.json({ status: configs_1.statusResponses.EXECUTED, response });
                    }
                }
            }
            else if (chat.category === "group") {
                const group = yield Group_1.default.findById(chat.connectionId);
                if (group) {
                    let member = group.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];
                    const message = yield Message_1.default.findById(member.messages[member.messages.length - 1]);
                    if (message) {
                        const profile = yield Profile_1.default.findById(message.sender);
                        let messageContent = message.content;
                        if (message.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        }
                        else if (message.messageType === 'video-msg') {
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
                            };
                            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
                        }
                    }
                }
            }
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
chatRouter.post('/lastMessage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.chatId && req.body.profileId) {
        const chat = yield Chat_1.default.findById(req.body.chatId);
        if (chat) {
            if (chat.category === "individual") {
                const individual = yield Individual_1.default.findById(chat.connectionId);
                if (individual) {
                    const currentMember = individual.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];
                    const lastMessage = yield Message_1.default.findById(currentMember.messages[currentMember.messages.length - 1]);
                    if (lastMessage) {
                        let messageContent = lastMessage.content;
                        if (lastMessage.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        }
                        else if (lastMessage.messageType === 'video-msg') {
                            messageContent = 'Video message';
                        }
                        res.json({
                            status: configs_1.statusResponses.EXECUTED,
                            response: {
                                content: messageContent,
                                sendingTime: lastMessage.sendingTime
                            }
                        });
                    }
                }
            }
            else if (chat.category === "group") {
                const group = yield Group_1.default.findById(chat.connectionId);
                if (group) {
                    const currentMember = group.members.filter(eachMember => eachMember.connectionId === req.body.profileId)[0];
                    const lastMessage = yield Message_1.default.findById(currentMember.messages[currentMember.messages.length - 1]);
                    if (lastMessage) {
                        let messageContent = lastMessage.content;
                        if (lastMessage.messageType === 'audio-msg') {
                            messageContent = 'Audio message';
                        }
                        else if (lastMessage.messageType === 'video-msg') {
                            messageContent = 'Video message';
                        }
                        const senderProfile = yield Profile_1.default.findById(lastMessage.sender);
                        res.json({
                            status: configs_1.statusResponses.EXECUTED,
                            response: {
                                content: messageContent,
                                sendingTime: lastMessage.sendingTime,
                                sender: {
                                    firstName: senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.firstName,
                                    lastName: senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.lastName
                                }
                            }
                        });
                    }
                }
            }
        }
    }
}));
exports.default = chatRouter;
