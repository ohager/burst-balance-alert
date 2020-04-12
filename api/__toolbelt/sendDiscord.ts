import fetch from 'node-fetch'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';
import buildBurstExplorerUrl from './buildBurstExplorerUrl';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';
import getHashIconUrl from './getHashIconUrl';

interface DiscordArgs {
    accountId: string;
    balance: BurstValue;
    webhookId: string;
    origin: string;
}

const buildEmbedMessage = ({accountId, balance, origin}: DiscordArgs): object => {
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

export default async (args: DiscordArgs): Promise<void> => {

    const webhookUrl = `${process.env.DISCORD_WEBHOOK_API}/${args.webhookId}`
    console.log('sending discord', webhookUrl)
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
