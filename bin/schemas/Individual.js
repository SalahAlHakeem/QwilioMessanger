"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const IndividualMemberSchema = new mongoose_1.Schema({
    connectionId: { type: String, require: true },
    messages: { type: [String], default: [] }
});
const IndividualSchema = new mongoose_1.Schema({
    members: { type: [IndividualMemberSchema], required: false }
});
const IndividualModel = (0, mongoose_1.model)('Individual', IndividualSchema);
exports.default = IndividualModel;
