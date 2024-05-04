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
const websocket_1 = require("websocket");
const http_1 = __importDefault(require("http"));
const notification_1 = require("./notification");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
let activeConnections = [];
const httpServer = http_1.default.createServer((request, response) => {
    response.writeHead(404);
    response.end();
});
httpServer.listen(8080, () => __awaiter(void 0, void 0, void 0, function* () {
    dotenv_1.default.config();
    if (process.env.MONGO_URI) {
        yield mongoose_1.default.connect(process.env.MONGO_URI);
    }
    console.log('http server for websocket is listening on port 8080');
}));
const websocketServer = new websocket_1.server({
    httpServer: httpServer,
    autoAcceptConnections: true
});
;
;
websocketServer.on('connect', connection => {
    connection.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        if (message.type === "utf8") {
            const clientMessage = JSON.parse(message.utf8Data);
            if (clientMessage.type === "connection-established") {
                activeConnections.push({ profileId: clientMessage.data.profileId, socket: connection });
                (0, notification_1.updateProfileActivity)(clientMessage.data.profileId, "active", activeConnections);
            }
            else if (clientMessage.type === "new-message") {
                (0, notification_1.notifyNewMessage)(clientMessage.data, activeConnections);
            }
            else if (clientMessage.type === "connection-inactive") {
                (0, notification_1.updateProfileActivity)(clientMessage.data.profileId, "inactive", activeConnections);
            }
            else if (clientMessage.type === "connection-active") {
                (0, notification_1.updateProfileActivity)(clientMessage.data.profileId, "active", activeConnections);
            }
            else if (clientMessage.type === "message-deleted") {
                (0, notification_1.removeDeletedMessage)(clientMessage.data.messageId, clientMessage.data.chatId, activeConnections);
            }
        }
    }));
});
