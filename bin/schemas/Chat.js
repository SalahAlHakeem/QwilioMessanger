"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChatSchema = new mongoose_1.Schema({
    category: { type: String, required: true, enum: ['individual', 'channel', 'group'] },
    connectionId: { type: String, required: true, ref: 'Client' },
    messages: { type: [String], default: [] },
    latelyUsedAt: { type: Date, default: new Date() }
});
const ChatModel = (0, mongoose_1.model)('Chat', ChatSchema);
exports.default = ChatModel;
