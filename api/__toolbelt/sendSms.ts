import aws from './awsInstance'
import {convertNumericIdToAddress} from '@burstjs/util';
import {SendArgs} from './sendArgs';

const snsInstance = new aws.SNS()

export default async ({accountId, alias = '', balance, address: phoneNumber}: SendArgs): Promise<void> => {
    const accountAddress = convertNumericIdToAddress(accountId)
    const message = `🚨Burst Balance Alert -
${accountAddress} ("${alias}") has a balance of ${balance.getBurst()} BURST
`
    await snsInstance.publish({
        Message: message,
        PhoneNumber: phoneNumber
    }).promise()
}
