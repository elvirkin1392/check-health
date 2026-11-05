import { expressjwt as jwt } from 'express-jwt';
import type { Request } from 'express';

// The client sends the token in its own header: Yandex Cloud Serverless Containers
// treat Authorization as an IAM token for invoking the container and answer 403
// before the request ever reaches Express. Authorization stays for local runs.
export const ACCESS_TOKEN_HEADER = 'x-access-token';

const getTokenFromHeaders = (req: Request): string | null => {
    const ownHeader = req.headers[ACCESS_TOKEN_HEADER];
    if (typeof ownHeader === 'string' && ownHeader) {
        return ownHeader;
    }
    if (
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
        (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

const auth = {
    required: jwt({
        secret: process.env.JWT_SECRET || 'superSecret',
        getToken: getTokenFromHeaders,
        algorithms: ['HS256'],
    }),
    optional: jwt({
        secret: process.env.JWT_SECRET || 'superSecret',
        credentialsRequired: false,
        getToken: getTokenFromHeaders,
        algorithms: ['HS256'],
    }),
};

export default auth;
