import {Router} from 'express';
import { statusResponses } from '../configs';
import { createIndividual, getIndividual } from '../controllers/individualController';

const individualRouter = Router();

individualRouter.get('/:id', async (req, res) => {
    const response = await getIndividual(req.params.id);
    res.json({status: statusResponses.EXECUTED, response});
})

individualRouter.post('/', async (req, res) => {
    if (req.body.members && Array.isArray(req.body.members) && req.body.members.length === 2){
        const response = await createIndividual(req.body.members);
        res.json({status: statusResponses.EXECUTED, id: response})
    } else {
        res.json({status: statusResponses.FAILED});
    }
})

export default individualRouter;
