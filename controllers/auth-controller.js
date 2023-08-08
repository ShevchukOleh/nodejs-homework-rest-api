import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ctrlWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";
import dotenv from 'dotenv';
import gravatar from 'gravatar';
import path from "path";
import fs from 'fs'
import Jimp from "jimp";

dotenv.config();

const { JWT_SECRET } = process.env;

const avatarDir = path.resolve('public', 'avatars');

const signup = async(req, res)=> {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(user) {
        throw HttpError(409, "Email in use");
    }

    const userAvatar = gravatar.url(email);

    const hashPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({...req.body, password: hashPassword, avatarURL: userAvatar});

    res.status(201).json({
        email: newUser.email,
    })
}

const signin = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
        id: user._id,
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, {token});

    res.json({
        token,
    })
}

const getCurrent = (req, res)=> {
    const { email, subscription } = req.user;
    
    res.json({
        email,
        subscription
    });
}

const signout = async(req, res)=> {
    const {_id} = req.user;
    const result = await User.findByIdAndUpdate(_id, { token: "" });
    
    if (!result) {
        throw HttpError(401, "Not authorized");
    };

    res.status(204).json({
        message: "Signout success"
    });
}

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: oldPath, filename } = req.file;

    const avatar = await Jimp.read(oldPath);
    await avatar.resize(250, 250);
    
    const buffer = await avatar.getBufferAsync(Jimp.MIME_JPEG);
    const newPath = path.join(avatarDir, `resized_${filename}`);

    await fs.promises.writeFile(newPath, buffer);

    await fs.promises.unlink(oldPath);

    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL });
    
    res.json({
        avatarURL,
    });
};

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
    updateAvatar: ctrlWrapper(updateAvatar),
}