import { Client, Account} from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68507baf00358d901443'); // Replace with your project ID

export const account = new Account(client);
export { ID } from 'appwrite';
