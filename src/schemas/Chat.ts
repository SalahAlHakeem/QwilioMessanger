import { Schema, model } from "mongoose";

export interface IChat {
    category: 'individual' | 'channel' | 'group';
    connectionId: string;
    messages: Array<string>,
    latelyUsedAt: Date
}

const ChatSchema = new Schema<IChat>({
    category: {type: String, required: true, enum: ['individual' , 'channel' , 'group']},
    connectionId: {type: String, required: true, ref: 'Client'},
    messages: {type: [String],default: []},
    latelyUsedAt: {type: Date, default: new Date()}
})

const ChatModel = model('Chat', ChatSchema);

export default ChatModel;