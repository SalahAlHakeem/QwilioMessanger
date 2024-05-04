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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const profileRouter_1 = __importDefault(require("./routes/profileRouter"));
const groupRouter_1 = __importDefault(require("./routes/groupRouter"));
const dotenv_1 = __importDefault(require("dotenv"));
const chatRouter_1 = __importDefault(require("./routes/chatRouter"));
const messageRouter_1 = __importDefault(require("./routes/messageRouter"));
const individualRouter_1 = __importDefault(require("./routes/individualRouter"));
const promises_1 = __importDefault(require("fs/promises"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv_1.default.config();
        if (process.env.MONGO_URI) {
            yield mongoose_1.default.connect(process.env.MONGO_URI);
        }
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(express_1.default.json({ limit: '50mb' }));
        app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
        app.use('/profile', profileRouter_1.default);
        app.use('/group', groupRouter_1.default);
        app.use('/chat', chatRouter_1.default);
        app.use('/message', messageRouter_1.default);
        app.use('/individual', individualRouter_1.default);
        app.use((err, req, res, next) => {
            promises_1.default.writeFile('./logger.txt', JSON.stringify(err));
            res.status(500).send('Something went wrong!');
        });
        if (process.env.PORT) {
            app.listen(process.env.PORT, () => { console.log(`server is running on port ${process.env.PORT}`); });
        }
    });
}
main();
