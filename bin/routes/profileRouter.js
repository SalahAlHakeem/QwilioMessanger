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
exports.profileRouter = void 0;
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const configs_1 = require("../configs");
const chatController_1 = require("../controllers/chatController");
const profileController_2 = require("../controllers/profileController");
const Profile_1 = __importDefault(require("../schemas/Profile"));
exports.profileRouter = (0, express_1.Router)();
exports.profileRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield Profile_1.default.findById(req.params.id);
    res.json({ status: configs_1.statusResponses.EXECUTED, response });
}));
const guardCreateProfile = (data) => {
    return data["firstName"] && data["lastName"] && data["phoneNumber"];
};
/**
 * profile related
 * @action CREATE
 */
exports.profileRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (guardCreateProfile(req.body)) {
        const response = yield (0, profileController_2.createProfile)({ details: req.body });
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, id: response.id });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
const guardUploadProfileImage = (data) => {
    return data["profileId"] && data["imageContent"];
};
/**
 * profile image related
 * @action CREATE
 */
exports.profileRouter.post('/upload-profile-image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (guardUploadProfileImage(req.body)) {
        yield (0, profileController_1.addProfileImage)(req.body);
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile image related
 * @action UPDATE
 */
exports.profileRouter.post('/change-main-image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.profileId && req.body.imageId) {
        yield (0, profileController_1.setMainProfileImage)({ imageId: req.body.imageId, profileId: req.body.profileId });
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
const guardChangeProfileActivity = (data) => {
    return data["profileId"] && data["activity"] && data["activity"]["latelyActiveAt"] && data["activity"]["isOnline"] !== null;
};
/**
 * profile image related
 * @action UPDATE
 */
exports.profileRouter.post('/change-activity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (guardChangeProfileActivity(req.body)) {
        yield (0, profileController_1.changeProfileActivity)(req.body);
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    return res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile related
 * @action READ
 */
exports.profileRouter.get('/description/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileDecription)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response: {
                    firstName: response.firstName,
                    lastName: response.lastName,
                    phoneNumber: response.phoneNumber,
                    nickName: response.nickName
                } });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile notifications related
 * @action READ
 */
exports.profileRouter.get('/notifications/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileNotifications)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile activity related
 * @action READ
 */
exports.profileRouter.get('/activity-status/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileActivityStatus)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile contacts related
 * @action READ
 */
exports.profileRouter.get('/contacts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileContacts)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile image related
 * @action READ
 */
exports.profileRouter.get('/avatar/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileAvatar)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile related
 * @action READ
 */
exports.profileRouter.get('/full-description/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileDecription)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile chats related
 * @action READ
 */
exports.profileRouter.get('/chats/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, chatController_1.getProfileChats)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
/**
 * profile image related
 * @action DELETE
 */
exports.profileRouter.post('/image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.profileId && req.body.imageId) {
        yield (0, profileController_1.deleteProfileImage)(req.body);
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
exports.default = exports.profileRouter;
