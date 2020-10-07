import fetch from 'node-fetch'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';
import buildBurstExplorerUrl from './buildBurstExplorerUrl';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';
import getHashIconUrl from './getHashIconUrl';
import {SendArgs} from './sendArgs';

const buildMessage = (accountId: string, alias: string, balance: BurstValue, origin: string): string => {
    const accountAddress = convertNumericIdToAddress(accountId)

    return `🚨 *Balance Alert* 🚨 
*${accountAddress}*
[id: ${accountId}](${buildBurstExplorerUrl(accountId)})        
${alias}

*${balance.getBurst()}* BURST![ ](${getHashIconUrl(origin, accountId, 'xxl')})

[Recharge Account with Phoenix Wallet](${buildPhoenixDeepLink({accountId, origin})})`
}

export default async ({accountId, alias = '', balance, address: recipientToken, origin}: SendArgs): Promise<void> => {

    const body = JSON.stringify({
        recipient_token: recipientToken,
        text: buildMessage(accountId, alias, balance, origin),
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
