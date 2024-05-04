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
const express_1 = require("express");
const configs_1 = require("../configs");
const individualController_1 = require("../controllers/individualController");
const individualRouter = (0, express_1.Router)();
individualRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, individualController_1.getIndividual)(req.params.id);
    res.json({ status: configs_1.statusResponses.EXECUTED, response });
}));
individualRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.members && Array.isArray(req.body.members) && req.body.members.length === 2) {
        const response = yield (0, individualController_1.createIndividual)(req.body.members);
        res.json({ status: configs_1.statusResponses.EXECUTED, id: response });
    }
    else {
        res.json({ status: configs_1.statusResponses.FAILED });
    }
}));
exports.default = individualRouter;
