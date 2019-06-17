import {Adapter} from '@secretary/aws-secrets-manager-adapter';
import {Manager} from '@secretary/core';
import SecretsManager from 'aws-sdk/clients/secretsmanager';


const manager = new Manager(
    new Adapter(
        new SecretsManager({
            region:      'us-east-1',
            credentials: {
                accessKeyId:     process.env.SM_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.SM_AWS_SECRET_ACCESS_KEY,
            },
        }),
    ),
);

export default async function useSecret<S = any, M = {}>(key: string): Promise<[S, M, string]> {
    const secret = await manager.getSecret(key);

    return [secret.value as unknown as S, secret.metadata, secret.key];
}
