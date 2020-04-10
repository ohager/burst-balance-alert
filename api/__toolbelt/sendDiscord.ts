import fetch from 'node-fetch'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';
import buildBurstExplorerUrl from './buildBurstExplorerUrl';
import buildPhoenixDeepLink from './buildPhoenixDeepLink';

interface DiscordArgs {
    accountId: string;
    balance: BurstValue;
    origin: string;
}

const buildMessage = ({accountId, balance, origin}: DiscordArgs): string => {
    const accountAddress = convertNumericIdToAddress(accountId)

    return `🚨*${accountAddress}*🚨 

Balance: \`${balance.getBurst()} BURST\`
---
[Open in Burst Explorer](${buildBurstExplorerUrl(accountId)}) 
[Recharge Account with Phoenix Wallet](${buildPhoenixDeepLink({accountId, origin})})
`
}

export default async (args: DiscordArgs): Promise<void> => {

    const body = JSON.stringify({
        content: buildMessage(args),
    })

    await fetch(process.env.DISCORD_WEBHOOK,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body,
        }
    )
}
