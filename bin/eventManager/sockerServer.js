"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const http_1 = __importDefault(require("http"));
const httpServer = http_1.default.createServer((request, response) => {
    response.writeHead(404);
    response.end();
});
httpServer.listen(8080, () => {
    console.log('http server for websocket is listening on port 8080');
});
const websocketServer = new websocket_1.server({
    httpServer: httpServer,
    autoAcceptConnections: true
});
websocketServer.on('request', (request) => {
    const connection = request.accept('echo-protocol', request.origin);
    console.log('new connection accepted');
    connection.on('message', message => {
        if (message.type === 'utf8') {
            console.log(message);
        }
    });
});
