import { Router } from "express";
import { ParameterAddProfileImage, ParameterChangeProfileActivity, addProfileImage, changeProfileActivity, deleteProfileImage, getProfileActivityStatus, getProfileAvatar, getProfileContacts, getProfileDecription, getProfileNotifications, setMainProfileImage} from '../controllers/profileController';
import { statusResponses } from "../configs";
import { getProfileChats } from "../controllers/chatController";
import {ParameterCreateProfile, createProfile} from '../controllers/profileController';
import ProfileModel from "../schemas/Profile";

export const profileRouter = Router();

profileRouter.get('/:id', async (req, res) => {
    const response = await ProfileModel.findById(req.params.id);
    res.json({status: statusResponses.EXECUTED, response});
})

const guardCreateProfile = (data: any): data is ParameterCreateProfile["details"] => {
    return data["firstName"] && data["lastName"] && data["phoneNumber"];
}

/**
 * profile related
 * @action CREATE
 */
profileRouter.post('/', async (req, res) => {
    if (guardCreateProfile(req.body)) {
        const response = await createProfile({details: req.body});
        if (response) {
            return res.json({status: statusResponses.EXECUTED, id: response.id});
        } 
    }

    res.json({status: statusResponses.FAILED});
});


const guardUploadProfileImage = (data: any): data is ParameterAddProfileImage => {
    return data["profileId"] && data["imageContent"];
}

/**
 * profile image related
 * @action CREATE
 */
profileRouter.post('/upload-profile-image', async (req, res) => {
    if (guardUploadProfileImage(req.body)) {
        await addProfileImage(req.body);    
        return res.json({status: statusResponses.EXECUTED});
    }
    res.json({status: statusResponses.FAILED});
})


/**
 * profile image related
 * @action UPDATE
 */
profileRouter.post('/change-main-image', async (req, res) => {
    if (req.body.profileId && req.body.imageId) {
        await setMainProfileImage({imageId: req.body.imageId, profileId: req.body.profileId});
        return res.json({status: statusResponses.EXECUTED});
    }
    res.json({status: statusResponses.FAILED});
})


const guardChangeProfileActivity = (data: any): data is ParameterChangeProfileActivity => {
    return data["profileId"] && data["activity"] && data["activity"]["latelyActiveAt"] && data["activity"]["isOnline"] !== null;
}

/**
 * profile image related
 * @action UPDATE
 */
profileRouter.post('/change-activity', async (req, res) => {
    if (guardChangeProfileActivity(req.body)) {
        await changeProfileActivity(req.body);
        return res.json({status: statusResponses.EXECUTED});
    }
    return res.json({status: statusResponses.FAILED});
})


/**
 * profile related
 * @action READ
 */
profileRouter.get('/description/:id', async (req, res) => {
    if (req.params.id) {
        const response = await getProfileDecription(req.params.id);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, response: {
                firstName: response.firstName,
                lastName: response.lastName,
                phoneNumber: response.phoneNumber,
                nickName: response.nickName
            }});
        }
    }

    res.json({status: statusResponses.FAILED});
})


/**
 * profile notifications related
 * @action READ
 */
profileRouter.get('/notifications/:id', async (req, res) => {
    if (req.params.id) {
        const response = await getProfileNotifications(req.params.id);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, response});
        } 
    }

    res.json({status: statusResponses.FAILED});
})


/**
 * profile activity related
 * @action READ
 */
profileRouter.get('/activity-status/:id', async (req, res) => {
    if (req.params.id) {
        const response = await getProfileActivityStatus(req.params.id);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, response});
        } 
    }

    res.json({status: statusResponses.FAILED});
})


/**
 * profile contacts related
 * @action READ
 */
profileRouter.get('/contacts/:id', async (req, res) => {
    if (req.params.id) {
        const response = await getProfileContacts(req.params.id);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, response});
        } 
    }

    res.json({status: statusResponses.FAILED});
})


/**
 * profile image related
 * @action READ
 */
profileRouter.get('/avatar/:id', async (req, res) => {
    if (req.params.id) {
        const response = await getProfileAvatar(req.params.id);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, response});
        } 
    }

    res.json({status: statusResponses.FAILED});
})


/**
 * profile related
 * @action READ
 */
profileRouter.get('/full-description/:id', async (req, res) => {
    if (req.params.id) {
        const response = await getProfileDecription(req.params.id);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, response});
        }
    }

    res.json({status: statusResponses.FAILED});
})


/**
 * profile chats related
 * @action READ
 */
profileRouter.get('/chats/:id', async (req, res) => {
    if (req.params.id) {
        const response = await getProfileChats(req.params.id);
        if (response) {
            return res.json({status: statusResponses.EXECUTED, response});
        }
    }

    res.json({status: statusResponses.FAILED});
})


/**
 * profile image related
 * @action DELETE  
 */
profileRouter.post('/image', async (req, res) => {
    if (req.body.profileId && req.body.imageId) {
        await deleteProfileImage(req.body);
        return res.json({status: statusResponses.EXECUTED});
    }

    res.json({status: statusResponses.FAILED});
})


export default profileRouter;