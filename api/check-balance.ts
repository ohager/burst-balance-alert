import {ApiSettings, composeApi} from '@burstjs/core';
import {NowRequest, NowResponse} from '@vercel/node';
import {ValidationError} from 'fastest-validator';
import {withBasicAuth} from './__toolbelt/withBasicAuth'
import {BurstValue} from '@burstjs/util';
import {withQueryValidation} from './__toolbelt/withQueryValidation';
import sendTelegram from './__toolbelt/sendTelegram';
import sendSms from './__toolbelt/sendSms';
import sendDiscord from './__toolbelt/sendDiscord';
import getOrigin from './__toolbelt/getOrigin';

const BurstApi = composeApi(new ApiSettings(process.env.BURST_PEER))

type CompareType = 'lt' | 'gt'
type MessageType = 'mail' | 'sms' | 'telegram' | 'discord'

interface QueryArgs {
    account: string;
    alias?: string;
    compare?: CompareType;
    targetBurst?: string;
    msgRecipient?: string[] | string;
}

interface CheckResult {
    shouldNotify: boolean;
}

interface ResponseData {
    account: string;
    balanceBurst: string;
    targetBurst: string;
    comparator: CompareType;
    notified: boolean;
    hasNotificationError: boolean;
}

interface MessageRecipient {
    type: MessageType;
    address: string;
}

const parseMessageRecipient = (msgRecipient: string): MessageRecipient => {
    const split = msgRecipient.split(':');
    return {
        type: split[0].trim() as MessageType,
        address: split[1].trim()
    }
};

interface SendArgs extends MessageRecipient {
    accountId: string;
    alias?: string;
    balance: BurstValue;
    origin: string;
}

const sendByType = (args: SendArgs): Promise<void> => {

    const SendFunctions = {
        mail: (): Promise<void> => Promise.reject('Mail not supported yet'),
        sms: sendSms,
        telegram: sendTelegram,
        discord: sendDiscord
    }

    const {type} = args;
    const send = SendFunctions[type]
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return send ? send(args) : Promise.reject(`Unknown message type: ${type}`);
}

const notify = async (queryArgs: QueryArgs, actualBalance: BurstValue, origin: string): Promise<boolean> => {
    const {account, alias, msgRecipient} = queryArgs;
    const messageRecipientList = Array.isArray(msgRecipient) ? msgRecipient : [msgRecipient]
    const promises = messageRecipientList.map(msgRecipient => {
        const {address, type} = parseMessageRecipient(msgRecipient);
        return sendByType({
            accountId: account,
            alias,
            address,
            balance: actualBalance,
            origin,
            type
        })
    });
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const results = await Promise.allSettled(promises)
        return results.some(({status}) => status !== 'fulfilled')
    } catch (e) {
        console.error("Notification failed:", e.message)
        return false
    }
}

const checkBalance = (actualBalance: BurstValue, queryArgs: QueryArgs): CheckResult => {
    const {compare, targetBurst} = queryArgs;
    let shouldNotify = false
    if (!compare) {
        return {shouldNotify}
    }
    const targetValue = BurstValue.fromBurst(targetBurst);
    switch (compare) {
        case 'gt':
            shouldNotify = actualBalance.greater(targetValue)
            break
        case 'lt':
            shouldNotify = actualBalance.less(targetValue)
    }
    return {shouldNotify}
}


const QueryArgsSchema = {
    account: {type: 'string'},
    alias: {type: 'string', optional: true, max: 20},
    compare: {type: 'string', enum: ['lt', 'gt'], optional: true},
    targetBurst: {type: 'number', positive: true, optional: true},
    msgType: {type: 'string', enum: ['sms', 'telegram', 'discord', 'mail'], optional: true},
    msgAddress: {type: 'string', optional: true},
    msgRecipient: {
        type: "array", items: {
            type: "string",
            pattern: /^sms|mail|discord|telegram:.*/
        }
    }
}

const ConditionalValidation = (queryArgs: QueryArgs): true | ValidationError[] => {
    const {compare, targetBurst, msgRecipient} = queryArgs

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notUndef = (v: any): boolean => v !== undefined
    if (!compare) return true

    if (compare && (
        notUndef(msgRecipient) &&
        notUndef(targetBurst)
    )) {
        return true;
    }

    return [
        {
            type: 'string',
            field: 'compare',
            message: 'Field [compare] requires [msgRecipient, targetBurst]'
        }
    ]
};

export default
withBasicAuth(
    withQueryValidation(QueryArgsSchema, ConditionalValidation)(
        async (req: NowRequest, res: NowResponse): Promise<void> => {
            try {
                const queryArgs = req.query as unknown as QueryArgs
                const {account, compare, targetBurst} = queryArgs;
                const balance = await BurstApi.account.getAccountBalance(account)
                // const balanceValue = BurstValue.fromPlanck(balance.balanceNQT)
                // const {shouldNotify} = checkBalance(balanceValue, queryArgs)
                // let hasNotificationError = false
                // if (shouldNotify) {
                //     hasNotificationError = await notify(queryArgs, balanceValue, getOrigin(req));
                // }
                // const response: ResponseData = {
                //     account,
                //     balanceBurst: balanceValue.getBurst(),
                //     targetBurst,
                //     comparator: compare,
                //     notified: shouldNotify,
                //     hasNotificationError
                // }
                res.status(200).send('test')
                // res.send(response)
            } catch (e) {
                await res.status(500).send(e.message)
            }
        }
    )
)
