import { DateSchemaDefinition, Schema, model } from "mongoose";

interface INotification {
    chatId: string;
    notificationAllowed: boolean;
}

export interface IProfileImage {
    content: string;
}

export interface IProfile {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    nickName: string;
    contacts: Array<String>,
    chats: Array<String>,
    notifications: Array<INotification>,
    avatar: {
        color: 'string',
        images: Array<String>,
        mainImage: string | null;
    },
    activity: {
        latelyActiveAt: Date, 
        isOnline: boolean
    }
}

export const ProfileImageSchema = new Schema<IProfileImage>({
    content: {type: String, required: true}
});

const NotificationSchema = new Schema<INotification>({
    chatId: {type: String, required: true},
    notificationAllowed: {type: Boolean, required: true}
})

const ProfileSchema = new Schema<IProfile>({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    phoneNumber: {type: String, required: true},
    nickName: {type: String, required: false},
    contacts: {type: [String], default: []},
    chats: {type: [String], ref: 'Chat', default: []},
    notifications: {type: [NotificationSchema], default: []},
    avatar: {
        color: {type: String, default: 'green'},
        images: {type: [String], ref: 'ProfileImage', default: []},
        mainImage: {type: String, ref: 'ProfileImage', default: ""}
    },
    activity: {
        latelyActiveAt: {type: Date, default: new Date()},
        isOnline: {type: String, default: false}
    }
});

export const ProfileImageModel = model('ProfileImage', ProfileImageSchema);
const ProfileModel = model('Profile', ProfileSchema);

export default ProfileModel;
