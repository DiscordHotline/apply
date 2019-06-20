import {IncomingMessage} from 'http';

export default function getApiUrl(req?: IncomingMessage) {
    if (!req) {
        return window.origin;
    }

    return req.headers['x-now-deployment-url'] || 'http://localhost:3000';
}
