import express from 'express';
import { validateBody } from '../../decorators/index.js';
import schemas from '../../schemas/contacts.js';
import contactsController from '../../controllers/contacts.js';

const router = express.Router()

router.get('/', contactsController.getAll);

router.get('/:id', contactsController.getById);

router.post('/', validateBody(schemas.addSchema), contactsController.add);

router.put('/:id', validateBody(schemas.addSchema), contactsController.updateById);

router.delete('/:id', contactsController.deleteByid);

export default router;