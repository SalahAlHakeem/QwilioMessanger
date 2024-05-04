import { Schema, model } from "mongoose";

interface IReceivedDetails {
    connectionId: string;
    receivedAt: Date
}

export interface IMessage {
    sender: string;
    receiver: string
    received: Array<IReceivedDetails>,
    replies: Array<string>,
    sendingTime: Date,
    content: string,
    messageType: 'video-msg' | 'audio-msg' | 'text-msg' | 'file-msg',
    isEdited: boolean,
    isPinned: boolean,
    isForwarded: boolean,
    forwardedFrom?: string
}

const ReceivedDetailsSchema = new Schema<IReceivedDetails>({
    connectionId: {type: String, required: true, ref: 'Profile'},
    receivedAt: {type: Date, required: true}
})

const MessageSchema = new Schema<IMessage>({
    sender: {type: String, required: true},
    receiver: {type: String, required: true, ref: 'Chat'},
    received: [ReceivedDetailsSchema],
    replies: [String],
    sendingTime: {type: Date, required: true},
    content: {type: String, required: true},
    messageType: {type: String, required: true, enum:['video-msg' , 'audio-msg' , 'text-msg' , 'file-msg']},
    isEdited: {type: Boolean, default: false},
    isPinned: {type: Boolean, default: false},
    isForwarded: {type: Boolean, default: false},
    forwardedFrom: {type: String, required: false}
});

const MessageModel = model('Message', MessageSchema);
export default MessageModel;




