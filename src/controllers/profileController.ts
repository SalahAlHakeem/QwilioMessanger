import ProfileModel, { IProfile, ProfileImageModel } from "../schemas/Profile"

export type ParameterCreateProfile = {
    details: Pick<IProfile, 'firstName' | 'lastName' | 'phoneNumber' >
}

export const createProfile = async ({details}: ParameterCreateProfile) => {
    const exisitingProfile = await ProfileModel.findOne({phoneNumber: details.phoneNumber});
    if (!exisitingProfile) {
        return await ProfileModel.create({
            firstName: details.firstName,
            lastName: details.lastName,
            phoneNumber: details.phoneNumber
        });
    }

    return null;
}

export type ParameterAddProfileImage = {
    profileId: string;
    imageContent: string;
}

export const addProfileImage = async ({profileId, imageContent}: ParameterAddProfileImage) => {
    const profile = await ProfileModel.findById(profileId);

    if (profile) {
        const createdImage = await ProfileImageModel.create({content: imageContent});

        await ProfileModel.updateOne({_id: profileId}, {
            $push: {
                "avatar.images": createdImage.id
            },
            $set: {
                "avatar.mainImage": createdImage.id
            }
        });
    }
}

type ParameterProfileImage = {
    imageId: string;
    profileId: string;
}

export const setMainProfileImage = async ({imageId, profileId}: ParameterProfileImage) => {
    await ProfileModel.updateOne({_id: profileId}, {$set: {"avatar.mainImage": imageId}});
}

export const deleteProfileImage = async ({imageId, profileId}: ParameterProfileImage) => {
    await ProfileImageModel.deleteOne({_id: imageId});
    await ProfileModel.updateOne( {_id: profileId}, { $pull: {"avatar.images": imageId}, $set: {"avatar.mainImage": ""} });

    const profile = await ProfileModel.findById(profileId);

    if (profile) {
        if (profile.avatar.images.length > 0) {
            await ProfileModel.updateOne(
                {_id: profileId}, 
                {
                    $set: {
                        "avatar.mainImage": profile.avatar.images[profile.avatar.images.length - 1]
                    }
                }
            );
        }
    }
}

export const setProfileNickname = async (profileId: string, nickName: string) => {
    const existingProfile = await ProfileModel.findOne({nickName});
    
    if (!existingProfile) {
        await ProfileModel.find({_id: profileId}, {$set: {nickName}})
    }

    return null;
}

export type ParameterChangeProfileActivity = {
    profileId: string;
    activity: IProfile["activity"];
}

export const changeProfileActivity = async ({profileId, activity} : ParameterChangeProfileActivity)=> {
    await ProfileModel.updateOne({_id: profileId}, {$set: {activity}});
}

export const getProfileContacts = async (profileId: string) => {
    return await ProfileModel.findById(profileId, {contacts: 1, _id: 0});
}

export const getProfileAvatar = async (profileId: string) => {
    return await ProfileModel.findById(profileId, {avatar: 1, _id: 0});
}

export const getProfileNotifications = async (profileId: string) => {
    return await ProfileModel.findById(profileId, {notifications: 1, _id: 0});
}

export const getProfileDecription = async (profileId: string) => {
    return await ProfileModel.findById(profileId);
}

export const getProfileActivityStatus = async (profileId: string) => {
    return await ProfileModel.findById(profileId, {activity: 1, _id: 0});
}


