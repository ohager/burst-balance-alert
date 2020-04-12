import fetch from 'node-fetch'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';
import buildBurstExplorerUrl from './buildBurstExplorerUrl';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';
import getHashIconUrl from './getHashIconUrl';

interface TelegramArgs {
    accountId: string;
    balance: BurstValue;
    origin: string;
    recipientToken: string;
}

const buildMessage = (accountId: string, balance: BurstValue, origin: string): string => {
    const accountAddress = convertNumericIdToAddress(accountId)

    return `🚨 *Balance Alert* 🚨 
*${accountAddress}*
[id: ${accountId}](${buildBurstExplorerUrl(accountId)})        

*${balance.getBurst()}* BURST![ ](${getHashIconUrl(origin, accountId, 'xxl')})

[Recharge Account with Phoenix Wallet](${buildPhoenixDeepLink({accountId, origin})})`

}

export default async ({accountId, balance, recipientToken, origin}: TelegramArgs): Promise<void> => {

    console.log('sending telegram', accountId, balance.toString())

    const body = JSON.stringify({
        // eslint-disable-next-line @typescript-eslint/camelcase
        recipient_token: recipientToken,
        text: buildMessage(accountId, balance, origin),
        origin: "Burst Balance Alert"
    })

    await fetch('https://apps.muetsch.io/middleman/api/messages',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body,
        }
    )
}
