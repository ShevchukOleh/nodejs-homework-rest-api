import express from 'express';
import { validateBody } from '../../decorators/index.js';
import schemas from '../../schemas/contacts.js';
import contactsController from '../../controllers/contacts.js';
import {authenticate, isValidId} from "../../middlewars/index.js";

const router = express.Router()

router.use(authenticate);

router.get('/', contactsController.getAll);

router.get('/:id', contactsController.getById);

router.post('/', validateBody(schemas.addSchema), contactsController.add);

router.put('/:id', isValidId, validateBody(schemas.addSchema), contactsController.updateById);

router.patch("/:id/favorite", isValidId, validateBody(schemas.contactUpdateFavoriteSchema), contactsController.updateStatusContact);

router.delete('/:id', isValidId, contactsController.deleteByid);

export default router;