import {Hook} from 'hookcord';
import useSecret from './useSecret';

const hook = new Hook();
let configured = false;

export default async function useHook() {
    if (!configured) {
        const [secret] = await useSecret<{webhook_url: string}>('hotline/apply/discord');
        hook.setOptions({link: secret.webhook_url + '?wait=true'});
    }

    return hook;
}
