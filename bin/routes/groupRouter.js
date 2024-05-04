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
const express_1 = require("express");
const groupController_1 = require("../controllers/groupController");
const configs_1 = require("../configs");
const Group_1 = __importDefault(require("../schemas/Group"));
const groupRouter = (0, express_1.Router)();
groupRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield Group_1.default.findById(req.params.id);
    if (group) {
        return res.json({ status: configs_1.statusResponses.EXECUTED, response: group });
    }
    else {
        return res.json({ status: configs_1.statusResponses.FAILED });
    }
}));
/**
 * group related
 * @action CREATE
 */
groupRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.details) {
        const response = yield (0, groupController_1.createGroup)({ details: req.body.details, members: req.body.members });
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, id: response.id });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
const guardAddGroupMember = (data) => {
    return data["chatId"] && data["member"] && data["member"]["connectionId"];
};
/**
 * group member related
 * @action UPDATE
 */
groupRouter.post('/add-member', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (guardAddGroupMember(req.body)) {
        yield (0, groupController_1.addGroupMember)(req.body);
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
const guardDeleteGroupMember = (data) => {
    return data["chatId"] && data["memberConnectionId"];
};
/**
 * group member related
 * @action UPDATE
 */
groupRouter.post('/delete-member', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (guardDeleteGroupMember(req.body)) {
        yield (0, groupController_1.deleteGroupMember)(req.body);
        return res.json({ status: configs_1.statusResponses.EXECUTED });
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
exports.default = groupRouter;
