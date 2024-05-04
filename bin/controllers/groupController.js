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
exports.deleteGroupMember = exports.addGroupMember = exports.createGroup = void 0;
const Chat_1 = __importDefault(require("../schemas/Chat"));
const Group_1 = __importDefault(require("../schemas/Group"));
const Profile_1 = __importDefault(require("../schemas/Profile"));
const createGroup = ({ details, members }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Group_1.default.create({
        name: details.name,
        description: details.description,
        members,
        accessibility: details.accessibility
    });
});
exports.createGroup = createGroup;
const addGroupMember = ({ chatId, member }) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(chatId);
    if (chat) {
        yield Group_1.default.updateOne({ _id: chat.connectionId }, { $push: { members: member } });
        yield Profile_1.default.updateOne({ _id: member.connectionId }, { $push: { chats: chat.id } });
    }
});
exports.addGroupMember = addGroupMember;
const deleteGroupMember = ({ chatId, connectionId }) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield Chat_1.default.findById(chatId);
    if (chat) {
        yield Group_1.default.updateOne({ _id: chat.connectionId }, { $pull: { members: { connectionId: connectionId } } });
        yield Profile_1.default.updateOne({ _id: connectionId }, { $pull: { chats: chat.id } });
    }
});
exports.deleteGroupMember = deleteGroupMember;
