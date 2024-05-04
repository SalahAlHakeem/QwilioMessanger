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
exports.updateProfileActivity = exports.removeDeletedMessage = exports.notifyNewMessage = void 0;
const Chat_1 = __importDefault(require("../schemas/Chat"));
const Group_1 = __importDefault(require("../schemas/Group"));
const Individual_1 = __importDefault(require("../schemas/Individual"));
const Profile_1 = __importDefault(require("../schemas/Profile"));
const notifyNewMessage = (messageInfo, connections) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(messageInfo.chatId);
    if (chat) {
        if (chat.category === "individual") {
            const individual = yield Individual_1.default.findById(chat.connectionId);
            if (individual) {
                for (const eachConnection of connections) {
                    for (const eachMember of individual.members) {
                        if (eachConnection.profileId === eachMember.connectionId) {
                            eachConnection.socket.send(JSON.stringify({ type: 'new-message', data: {
                                    chatId: chat.id,
                                    messageId: messageInfo.messageId,
                                    profileId: messageInfo.profileId
                                } }));
                        }
                    }
                }
            }
        }
        else if (chat.category === "group") {
            const group = yield Group_1.default.findById(chat.connectionId);
            if (group) {
                for (const eachMember of group.members) {
                    for (const eachConnection of connections) {
                        if (eachMember.connectionId === eachConnection.profileId) {
                            eachConnection.socket.send(JSON.stringify({ type: 'new-message', data: {
                                    chatId: chat.id,
                                    messageId: messageInfo.messageId,
                                    profileId: messageInfo.profileId
                                } }));
                        }
                    }
                }
            }
        }
    }
});
exports.notifyNewMessage = notifyNewMessage;
const removeDeletedMessage = (messageId, chatId, connections) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(chatId);
    if (chat) {
        if (chat.category === "individual") {
            const individual = yield Individual_1.default.findById(chat.connectionId);
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
                            }));
                        }
                    }
                }
            }
        }
        else if (chat.category === "group") {
            const group = yield Group_1.default.findById(chat.connectionId);
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
                            }));
                        }
                    }
                }
            }
        }
    }
});
exports.removeDeletedMessage = removeDeletedMessage;
const updateProfileActivity = (profileId, status, connections) => __awaiter(void 0, void 0, void 0, function* () {
    if (status === "active") {
        yield Profile_1.default.updateOne({ _id: profileId }, { $set: {
                "activity.latelyActiveAt": new Date(),
                "activity.isOnline": true
            } });
    }
    else {
        yield Profile_1.default.updateOne({ _id: profileId }, { $set: {
                "activity.isOnline": false
            } });
    }
    const profile = yield Profile_1.default.findById(profileId);
    if (profile) {
        for (const eachChatId of profile.chats) {
            const chat = yield Chat_1.default.findById(eachChatId);
            if (chat) {
                if (chat.category === "individual") {
                    const individual = yield Individual_1.default.findById(chat.connectionId);
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
                                }));
                            }
                        }
                    }
                }
                else if (chat.category === "group") {
                    const group = yield Group_1.default.findById(chat.connectionId);
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
                                    }));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});
exports.updateProfileActivity = updateProfileActivity;
