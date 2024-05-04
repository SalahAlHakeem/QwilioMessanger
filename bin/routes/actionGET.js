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
Object.defineProperty(exports, "__esModule", { value: true });
const profileRouter_1 = require("./profileRouter");
const configs_1 = require("../configs");
const profileController_1 = require("../controllers/profileController");
profileRouter_1.profileRouter.get('/description/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
const flag = { include: "true" };
exports.default = flag;
