import {IncomingMessage} from 'http';

export default function getUrl(req?: IncomingMessage) {
    if (!req) {
        return window.origin;
    }

    return `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}` || 'http://localhost:3000';
}
