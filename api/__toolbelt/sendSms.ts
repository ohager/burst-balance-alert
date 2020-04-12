import aws from './awsInstance'
import {convertNumericIdToAddress} from '@burstjs/util';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';
import {SendArgs} from './sendArgs';

const snsInstance = new aws.SNS()

export default async ({accountId, balance, address: phoneNumber, origin}: SendArgs): Promise<void> => {
    const accountAddress = convertNumericIdToAddress(accountId)
    const message = `🚨Burst Balance Alert -
${accountAddress} has a balance of ${balance.getBurst()} BURST

Open Phoenix: ${buildPhoenixDeepLink({accountId, origin})}
`
    await snsInstance.publish({
        Message: message,
        PhoneNumber: phoneNumber
    }).promise()
}
