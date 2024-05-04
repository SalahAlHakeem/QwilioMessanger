"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MemberSchema = new mongoose_1.Schema({
    connectionId: { type: String, required: true, ref: 'Profile' },
    status: { type: String, required: true, enum: ['participant', 'owner', 'admin'], default: 'participant' },
    messages: { type: [String], default: [] }
});
const GroupSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    members: [MemberSchema],
    accessibility: { type: String, required: true, enum: ['private', 'public'] },
    avatar: {
        color: { type: String, default: 'green' },
        images: { type: [String], ref: 'ProfileImage', default: [] },
        mainImage: { type: String, ref: 'ProfileImage', default: "" }
    }
});
const GroupModel = (0, mongoose_1.model)('Group', GroupSchema);
exports.default = GroupModel;
