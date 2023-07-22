import contacts from '../models/contacts.js';
import { HttpError } from '../helpers/index.js';
import {ctrlWrapper} from '../decorators/index.js'

async function getAll(req, res) {
    const result = await contacts.listContacts();
    res.json(result);
};

async function getById(req, res){
    const { id } = req.params;
    const result = await contacts.getById(id);
    if (!result) {
        throw HttpError(404, "Not found");
    };
    res.json(result);
};

async function add(req, res) {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ message: "missing required name field" });
    }

    const result = await contacts.addContact(req.body);
    res.status(201).json(result);
};

async function deleteByid(req, res) {
    const { id } = req.params;
    const result = await contacts.removeContact(id);
    if (!result) {
        throw HttpError(404, "Not found");
    };
    res.json({ message: 'contact deleted' });
};

async function updateById(req, res) {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "missing fields" });
    }

    const result = await contacts.updateContact(id, req.body);

    if (!result) {
        throw HttpError(404, "Not found");
    };
    res.json(result);
};

export default {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    deleteByid: ctrlWrapper(deleteByid),
};