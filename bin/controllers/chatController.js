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
exports.deleteGroupChat = exports.deleteIndividualChat = exports.createChat = exports.getProfileChats = void 0;
const Chat_1 = __importDefault(require("../schemas/Chat"));
const Profile_1 = __importDefault(require("../schemas/Profile"));
const Message_1 = __importDefault(require("../schemas/Message"));
const Individual_1 = __importDefault(require("../schemas/Individual"));
const Group_1 = __importDefault(require("../schemas/Group"));
const getProfileChats = (profileId) => __awaiter(void 0, void 0, void 0, function* () {
    const chatIDs = yield Profile_1.default.findById(profileId);
    if (chatIDs) {
        return yield Chat_1.default.find({ _id: { $in: chatIDs.chats } }).sort({ latelyUsedAt: -1 });
    }
    return null;
});
exports.getProfileChats = getProfileChats;
const createChat = ({ category, connectionId }) => __awaiter(void 0, void 0, void 0, function* () {
    const createdChat = yield Chat_1.default.create({
        category: category,
        connectionId: connectionId
    });
    if (category === "individual") {
        const individualChat = yield Individual_1.default.findById(connectionId);
        if (individualChat) {
            for (const currentMember of individualChat.members) {
                yield Profile_1.default.updateOne({ _id: currentMember.connectionId }, { $push: { chats: createdChat.id } });
            }
        }
    }
    else if (category === "group") {
        const group = yield Group_1.default.findById(connectionId);
        if (group) {
            for (const currentMember of group.members) {
                yield Profile_1.default.updateOne({ _id: currentMember.connectionId }, { $push: { chats: createdChat.id } });
            }
        }
    }
    return createdChat;
});
exports.createChat = createChat;
const deleteIndividualChat = ({ type, chatId, onlyForConnectionId }) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(chatId);
    if (chat) {
        if (type === "single") {
            const individual = yield Individual_1.default.findById(chat.connectionId);
            if (individual) {
                if (individual.members.length != 2) {
                    yield Individual_1.default.deleteOne({ _id: chat.connectionId });
                    yield Chat_1.default.deleteOne({ _id: chatId });
                    yield Message_1.default.deleteMany({ _id: { $in: chat.messages } });
                }
                else {
                    yield Individual_1.default.updateOne({ _id: chat.connectionId }, {
                        $pull: {
                            "members": {
                                connectionId: onlyForConnectionId
                            }
                        }
                    });
                }
            }
            yield Profile_1.default.updateOne({ _id: onlyForConnectionId }, { $pull: { chats: chatId } });
        }
        else if (type === "both") {
            const individual = yield Individual_1.default.findById(chat.connectionId);
            if (individual) {
                for (const member of individual.members) {
                    yield Profile_1.default.updateOne({ _id: member.connectionId }, { $pull: { chats: chatId } });
                }
            }
            yield Individual_1.default.deleteOne({ _id: chat.connectionId });
            yield Chat_1.default.deleteOne({ _id: chatId });
            yield Message_1.default.deleteMany({ _id: { $in: chat.messages } });
        }
    }
});
exports.deleteIndividualChat = deleteIndividualChat;
const deleteGroupChat = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(chatId);
    if (chat) {
        const group = yield Group_1.default.findById({ _id: chat.connectionId });
        if (group) {
            for (const member of group.members) {
                yield Profile_1.default.updateOne({ _id: member.connectionId }, { $pull: { chats: chatId } });
            }
            yield Message_1.default.deleteMany({ _id: { $in: chat.messages } });
            yield Group_1.default.deleteOne({ _id: chat.connectionId });
            yield Chat_1.default.deleteOne({ _id: chatId });
        }
    }
});
exports.deleteGroupChat = deleteGroupChat;
