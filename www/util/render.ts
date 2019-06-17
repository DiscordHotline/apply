import {renderFile} from 'twig';
import {resolve as path} from 'path';

export default (template: string, context: any): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        renderFile(path(__dirname, '..', 'templates', template), context, (err, html) => {
            if (err) {
                return reject(err);
            }

            resolve(html);
        })
    });
}
