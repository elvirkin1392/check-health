import jwt from 'jsonwebtoken';

const generateToken = (id) =>
    jwt.sign({ user: { id } }, process.env.JWT_SECRET || 'superSecret', {
        expiresIn: '60d',
    });

export default generateToken;