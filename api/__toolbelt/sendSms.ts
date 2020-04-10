import aws from './awsInstance'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';

const snsInstance = new aws.SNS()

export interface SmsArgs {
    phoneNumber: string;
    accountId: string;
    balance: BurstValue;
}

export default async ({accountId, balance, phoneNumber}: SmsArgs): Promise<void> => {
    const accountAddress = convertNumericIdToAddress(accountId)
    const message = `Burstcoin Balance Alert - ${accountAddress} has a balance of ${balance.getBurst()} BURST`
    await snsInstance.publish({
        Message: message,
        PhoneNumber: phoneNumber
    }).promise()
}
