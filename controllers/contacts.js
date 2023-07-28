import Contact from '../models/contact.js';
import { HttpError } from '../helpers/index.js';
import {ctrlWrapper} from '../decorators/index.js'

async function getAll(req, res) {
    const result = await Contact.find({}, "-cratedAt -updatedAt");
    res.json(result);
};

async function getById(req, res){
    const { id } = req.params;
    const result = await Contact.findById(id);
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

    const result = await Contact.create(req.body);
    res.status(201).json(result);
};

async function deleteByid(req, res) {
    const { id } = req.params;
    const result = await Contact.findByIdAndDelete(id);
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

    const result = await Contact.findByIdAndUpdate(id, req.body, {new: true});

    if (!result) {
        throw HttpError(404, "Not found");
    };
    res.json(result);
};

async function updateStatusContact(req, res) {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "missing field favorite" });
    }

    const result = await Contact.findByIdAndUpdate(id, req.body, {new: true});

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
    updateStatusContact: ctrlWrapper(updateStatusContact),
    deleteByid: ctrlWrapper(deleteByid),
};