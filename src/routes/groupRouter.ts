import { Router } from "express";
import { ParameterAddGroupMember, ParameterCreateGroup, ParameterDeleteGroupMember, addGroupMember, createGroup, deleteGroupMember } from "../controllers/groupController";
import { statusResponses } from "../configs";
import GroupModel from "../schemas/Group";

const groupRouter = Router();

groupRouter.get('/:id', async (req, res) => {
    const group = await GroupModel.findById(req.params.id);
    if (group) {
        return res.json({status: statusResponses.EXECUTED, response: group});
    } else {
        return res.json({status: statusResponses.FAILED});
    }
})

/**
 * group related
 * @action CREATE
 */
groupRouter.post('/', async (req, res) => {
    if (req.body.details) {
        const response = await createGroup({details: req.body.details, members: req.body.members});
        if (response) {
            return res.json({status: statusResponses.EXECUTED, id: response.id});
        }
    }

    res.json({status: statusResponses.FAILED});
})

const guardAddGroupMember = (data: any): data is ParameterAddGroupMember => {
    return data["chatId"] && data["member"] && data["member"]["connectionId"];
}

/**
 * group member related
 * @action UPDATE
 */
groupRouter.post('/add-member',  async(req, res) => {
    if (guardAddGroupMember(req.body)) {
        await addGroupMember(req.body);
        return res.json({status: statusResponses.EXECUTED});
    }
    res.json({status: statusResponses.FAILED});
})

const guardDeleteGroupMember = (data: any): data is ParameterDeleteGroupMember => {
    return data["chatId"] && data["memberConnectionId"];
}

/**
 * group member related
 * @action UPDATE   
 */
groupRouter.post('/delete-member', async (req, res) => {
    if (guardDeleteGroupMember(req.body)) {
        await deleteGroupMember(req.body);
        return res.json({status: statusResponses.EXECUTED});
    }
    res.json({status: statusResponses.FAILED});
})


export default groupRouter;