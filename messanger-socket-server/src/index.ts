import {server} from 'websocket';
import http from 'http';
import { notifyNewMessage, removeDeletedMessage, updateProfileActivity } from './notification.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config();

export interface IConnection {
    profileId: string, 
    socket: any
}

let activeConnections: IConnection[] = [];

const httpServer = http.createServer((request, response) => {
    response.writeHead(404);
    response.end();
})

httpServer.listen(process.env.PORT || 8080, async () => {
    if (process.env.MONGODB_URI) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log('http server for websocket is listening on port 8080');
})

const websocketServer = new server({
    httpServer: httpServer,
    autoAcceptConnections: true
});

interface ConnectionEstablishedArgs {
    type: 'connection-established',
    data: {
        profileId: string
    }
}

export interface NewMessageArgs {
    type: 'new-message',
    data: {
        profileId: string,
        chatId: string, 
        messageId: string
    }
}

export interface ConnectionActiveArgs {
    type: 'connection-active',
    data: {
        profileId: string
    }
};

export interface ConnectionInactiveArgs {
    type: 'connection-inactive',
    data: {
        profileId: string
    }
};

export interface MessageDeleted {
    type: 'message-deleted',
    data: {
        messageId: string,
        chatId: string
    }
}

type IClientMessage = ConnectionEstablishedArgs | NewMessageArgs | ConnectionActiveArgs | ConnectionInactiveArgs | MessageDeleted;

websocketServer.on('connect', connection => {
    connection.on('message', async message  => {
        if (message.type === "utf8") {
            const clientMessage: IClientMessage = JSON.parse(message.utf8Data);
            if (clientMessage.type === "connection-established") {
                activeConnections.push({profileId: clientMessage.data.profileId, socket: connection});
                updateProfileActivity(clientMessage.data.profileId, "active", activeConnections);
            } else if (clientMessage.type === "new-message") {
                notifyNewMessage(clientMessage.data, activeConnections);
            } else if (clientMessage.type === "connection-inactive") {
                updateProfileActivity(clientMessage.data.profileId, "inactive", activeConnections);
            } else if (clientMessage.type === "connection-active") {
                updateProfileActivity(clientMessage.data.profileId, "active", activeConnections);
            } else if (clientMessage.type === "message-deleted") {
                removeDeletedMessage(clientMessage.data.messageId, clientMessage.data.chatId, activeConnections)
            }
        }
    })
})

