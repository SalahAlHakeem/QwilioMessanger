"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReceivedDetailsSchema = new mongoose_1.Schema({
    connectionId: { type: String, required: true, ref: 'Profile' },
    receivedAt: { type: Date, required: true }
});
const MessageSchema = new mongoose_1.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true, ref: 'Chat' },
    received: [ReceivedDetailsSchema],
    replies: [String],
    sendingTime: { type: Date, required: true },
    content: { type: String, required: true },
    messageType: { type: String, required: true, enum: ['video-msg', 'audio-msg', 'text-msg', 'file-msg'] },
    isEdited: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isForwarded: { type: Boolean, default: false },
    forwardedFrom: { type: String, required: false }
});
const MessageModel = (0, mongoose_1.model)('Message', MessageSchema);
exports.default = MessageModel;
