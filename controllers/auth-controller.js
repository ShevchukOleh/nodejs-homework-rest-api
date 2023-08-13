import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ctrlWrapper } from "../decorators/index.js";
import { HttpError, createVerifyEmail, sendEmail } from "../helpers/index.js";
import dotenv from 'dotenv';
import gravatar from 'gravatar';
import path from "path";
import fs from 'fs'
import Jimp from "jimp";
import { nanoid } from "nanoid";

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

    const verificationToken = nanoid();
    
    const newUser = await User.create({...req.body, password: hashPassword, avatarURL: userAvatar, verificationToken});

    const verifyEmail = createVerifyEmail({ email, verificationToken });

    await sendEmail(verifyEmail);
    
    res.status(201).json({
        email: newUser.email,
    })
}

const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });

    res.json({
        message: "Verify success"
    })

    res.status(200).json({
        message: "Verification successful",
    });
}

const resendVerifyEmail = async(req, res)=> {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(404, "Email not found");
    }

    if(user.verify) {
        throw HttpError(400, "Verification has already been passed")
    }

    const verifyEmail = createVerifyEmail({email, verificationToken: user.verificationToken});

    await sendEmail(verifyEmail);

    res.json({
        message: "Resend email success"
    })
}

const signin = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
        throw HttpError(401, "Email not verify");
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
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail)
}