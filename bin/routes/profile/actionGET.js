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
const profileRouter_1 = __importDefault(require("./profileRouter"));
const profileController_1 = require("../../controllers/profileController");
const configs_1 = require("../../configs");
const chatController_1 = require("../../controllers/chatController");
profileRouter_1.default.get('/description/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
profileRouter_1.default.get('/notifications/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileNotifications)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
profileRouter_1.default.get('/activity-status/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileActivityStatus)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
profileRouter_1.default.get('/contacts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileContacts)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
profileRouter_1.default.get('/avatar/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileAvatar)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
profileRouter_1.default.get('/full-description/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, profileController_1.getProfileDecription)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
profileRouter_1.default.get('/chats/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.params.id) {
        const response = yield (0, chatController_1.getProfileChats)(req.params.id);
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, response });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
