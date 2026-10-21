import jwt from 'jsonwebtoken';
import {ObjectId} from "mongodb";

const generateToken = (id: ObjectId | string): string =>
    jwt.sign({ user: { id } }, process.env.JWT_SECRET || 'superSecret', {
        expiresIn: '60d',
    });

export default generateToken;
