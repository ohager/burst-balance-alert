import aws from './awsInstance'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';

const snsInstance = new aws.SNS()

export interface SmsArgs {
    phoneNumber: string;
    accountId: string;
    balance: BurstValue;
    origin: string;
}

export default async ({accountId, balance, phoneNumber, origin}: SmsArgs): Promise<void> => {
    const accountAddress = convertNumericIdToAddress(accountId)
    const message = `🚨Burst Balance Alert -
${accountAddress} has a balance of ${balance.getBurst()} BURST

Open Phoenix: ${buildPhoenixDeepLink(accountId, origin)}
`
    await snsInstance.publish({
        Message: message,
        PhoneNumber: phoneNumber
    }).promise()
}
