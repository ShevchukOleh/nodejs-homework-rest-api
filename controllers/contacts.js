import Contact from '../models/contact.js';
import { HttpError } from '../helpers/index.js';
import {ctrlWrapper} from '../decorators/index.js'

async function getAll(req, res) {
    const { _id: owner } = req.user;
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
    const result = await Contact.find({owner}, "-cratedAt -updatedAt", {skip, limit}).populate("owner", "email subscription");
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

    const { _id: owner } = req.user;

    const result = await Contact.create({ name, email, phone, owner });
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