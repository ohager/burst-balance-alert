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

    return `🚨 *${accountAddress}* 🚨
![_id: ${accountId}_](${getHashIconUrl(origin, accountId, 'l')})

*${balance.getBurst()}* BURST

[Open in Burst Explorer](${buildBurstExplorerUrl(accountId)})        
[Recharge Account with Phoenix Wallet](${buildPhoenixDeepLink({accountId, origin})})`

}

export default async ({accountId, balance, recipientToken, origin}: TelegramArgs): Promise<void> => {

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
