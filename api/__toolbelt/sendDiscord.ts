import fetch from 'node-fetch'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';
import buildBurstExplorerUrl from './buildBurstExplorerUrl';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';

interface DiscordArgs {
    accountId: string;
    balance: BurstValue;
    webhookId: string;
    origin: string;
}

const buildMessage = ({accountId, balance, origin}: DiscordArgs): string => {
    const accountAddress = convertNumericIdToAddress(accountId)

    return `
Balance: \`${balance.getBurst()} BURST\`
---
[Open in Burst Explorer](${buildBurstExplorerUrl(accountId)}) 
[Recharge Account with Phoenix Wallet](${buildPhoenixDeepLink({accountId, origin})})
`
}

export default async (args: DiscordArgs): Promise<void> => {
    const {webhookId, origin, accountId} = args;
    const body = JSON.stringify({
        embeds: [{
            title: 'Burst Account Alert',
            thumbnail: `${origin}/api/hashicon?text=${accountId}&size=l`,
            description: buildMessage(args)
        }]
    })

    const webhookUrl = `${process.env.DISCORD_WEBHOOK_API}/${webhookId}`

    await fetch(webhookUrl,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body,
        }
    )
}
