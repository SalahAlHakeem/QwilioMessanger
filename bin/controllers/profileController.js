"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileActivityStatus = exports.getProfileDecription = exports.getProfileNotifications = exports.getProfileAvatar = exports.getProfileContacts = exports.changeProfileActivity = exports.setProfileNickname = exports.deleteProfileImage = exports.setMainProfileImage = exports.addProfileImage = exports.createProfile = void 0;
const Profile_1 = __importStar(require("../schemas/Profile"));
const createProfile = ({ details }) => __awaiter(void 0, void 0, void 0, function* () {
    const exisitingProfile = yield Profile_1.default.findOne({ phoneNumber: details.phoneNumber });
    if (!exisitingProfile) {
        return yield Profile_1.default.create({
            firstName: details.firstName,
            lastName: details.lastName,
            phoneNumber: details.phoneNumber
        });
    }
    return null;
});
exports.createProfile = createProfile;
const addProfileImage = ({ profileId, imageContent }) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield Profile_1.default.findById(profileId);
    if (profile) {
        const createdImage = yield Profile_1.ProfileImageModel.create({ content: imageContent });
        yield Profile_1.default.updateOne({ _id: profileId }, {
            $push: {
                "avatar.images": createdImage.id
            },
            $set: {
                "avatar.mainImage": createdImage.id
            }
        });
    }
});
exports.addProfileImage = addProfileImage;
const setMainProfileImage = ({ imageId, profileId }) => __awaiter(void 0, void 0, void 0, function* () {
    yield Profile_1.default.updateOne({ _id: profileId }, { $set: { "avatar.mainImage": imageId } });
});
exports.setMainProfileImage = setMainProfileImage;
const deleteProfileImage = ({ imageId, profileId }) => __awaiter(void 0, void 0, void 0, function* () {
    yield Profile_1.ProfileImageModel.deleteOne({ _id: imageId });
    yield Profile_1.default.updateOne({ _id: profileId }, { $pull: { "avatar.images": imageId }, $set: { "avatar.mainImage": "" } });
    const profile = yield Profile_1.default.findById(profileId);
    if (profile) {
        if (profile.avatar.images.length > 0) {
            yield Profile_1.default.updateOne({ _id: profileId }, {
                $set: {
                    "avatar.mainImage": profile.avatar.images[profile.avatar.images.length - 1]
                }
            });
        }
    }
});
exports.deleteProfileImage = deleteProfileImage;
const setProfileNickname = (profileId, nickName) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProfile = yield Profile_1.default.findOne({ nickName });
    if (!existingProfile) {
        yield Profile_1.default.find({ _id: profileId }, { $set: { nickName } });
    }
    return null;
});
exports.setProfileNickname = setProfileNickname;
const changeProfileActivity = ({ profileId, activity }) => __awaiter(void 0, void 0, void 0, function* () {
    yield Profile_1.default.updateOne({ _id: profileId }, { $set: { activity } });
});
exports.changeProfileActivity = changeProfileActivity;
const getProfileContacts = (profileId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Profile_1.default.findById(profileId, { contacts: 1, _id: 0 });
});
exports.getProfileContacts = getProfileContacts;
const getProfileAvatar = (profileId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Profile_1.default.findById(profileId, { avatar: 1, _id: 0 });
});
exports.getProfileAvatar = getProfileAvatar;
const getProfileNotifications = (profileId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Profile_1.default.findById(profileId, { notifications: 1, _id: 0 });
});
exports.getProfileNotifications = getProfileNotifications;
const getProfileDecription = (profileId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Profile_1.default.findById(profileId);
});
exports.getProfileDecription = getProfileDecription;
const getProfileActivityStatus = (profileId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Profile_1.default.findById(profileId, { activity: 1, _id: 0 });
});
exports.getProfileActivityStatus = getProfileActivityStatus;
