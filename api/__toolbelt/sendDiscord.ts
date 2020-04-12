import fetch from 'node-fetch'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';
import buildBurstExplorerUrl from './buildBurstExplorerUrl';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';
import getHashIconUrl from './getHashIconUrl';
import {SendArgs} from './sendArgs';

const buildEmbedMessage = ({accountId, balance, origin}: SendArgs): object => {
    const accountAddress = convertNumericIdToAddress(accountId)

    const title = '🚨 Balance Alert 🚨'
    const description = `**${accountAddress}**
*id: ${accountId}*

**${balance.getBurst()}** BURST

[Open in Burst Explorer](${buildBurstExplorerUrl(accountId)})        
[Recharge Account with Phoenix Wallet](${buildPhoenixDeepLink({accountId, origin})})`

    const thumbnail = {
        url: getHashIconUrl(origin, accountId, 'l'),
    }

    const timestamp = new Date().toISOString();

    return {
        title,
        description,
        thumbnail,
        timestamp
    }
}

export default async (args: SendArgs): Promise<void> => {

    const webhookUrl = `${process.env.DISCORD_WEBHOOK_API}/${args.address}`
    const body = JSON.stringify({
        embeds: [buildEmbedMessage(args)]
    })
    await fetch(webhookUrl,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body,
        }
    )
}
