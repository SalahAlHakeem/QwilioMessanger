"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileImageModel = exports.ProfileImageSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ProfileImageSchema = new mongoose_1.Schema({
    content: { type: String, required: true }
});
const NotificationSchema = new mongoose_1.Schema({
    chatId: { type: String, required: true },
    notificationAllowed: { type: Boolean, required: true }
});
const ProfileSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    nickName: { type: String, required: false },
    contacts: { type: [String], default: [] },
    chats: { type: [String], ref: 'Chat', default: [] },
    notifications: { type: [NotificationSchema], default: [] },
    avatar: {
        color: { type: String, default: 'green' },
        images: { type: [String], ref: 'ProfileImage', default: [] },
        mainImage: { type: String, ref: 'ProfileImage', default: "" }
    },
    activity: {
        latelyActiveAt: { type: Date, default: new Date() },
        isOnline: { type: String, default: false }
    }
});
exports.ProfileImageModel = (0, mongoose_1.model)('ProfileImage', exports.ProfileImageSchema);
const ProfileModel = (0, mongoose_1.model)('Profile', ProfileSchema);
exports.default = ProfileModel;
