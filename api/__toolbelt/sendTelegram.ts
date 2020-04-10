import fetch from 'node-fetch'
import {BurstValue, convertNumericIdToAddress} from '@burstjs/util';

interface TelegramArgs {
    accountId: string;
    balance: BurstValue;
    recipientToken: string;
}

const buildBurstExplorerUrl = (accountId: string): string => `${process.env.BURST_EXPLORER}/?action=account&account=${accountId}`

const buildMessage = (accountId: string, balance: BurstValue): string => {
    const accountAddress = convertNumericIdToAddress(accountId)

    return `🚨*${accountAddress}*🚨 

Balance: \`${balance.getBurst()} BURST\`
---
[Open in Burst Explorer](${buildBurstExplorerUrl(accountId)}) 
`
}

export default async ({accountId, balance, recipientToken}: TelegramArgs): Promise<void> => {

    const body = JSON.stringify({
        // eslint-disable-next-line @typescript-eslint/camelcase
        recipient_token: recipientToken,
        text: buildMessage(accountId, balance),
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
