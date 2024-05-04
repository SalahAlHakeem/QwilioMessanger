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
const matchCreateProfile = (data) => {
    return data["firstName"] && data["lastName"] && data["phoneNumber"];
};
profileRouter_1.default.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (matchCreateProfile(req.body)) {
        const response = yield (0, profileController_1.createProfile)({ details: req.body.details });
        if (response) {
            return res.json({ status: configs_1.statusResponses.EXECUTED, id: response.id });
        }
    }
    res.json({ status: configs_1.statusResponses.FAILED });
}));
