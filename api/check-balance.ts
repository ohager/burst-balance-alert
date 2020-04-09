import {ApiSettings, composeApi} from '@burstjs/core';
import {NowRequest, NowResponse} from '@now/node';
import {ValidationError} from 'fastest-validator';
import {withBasicAuth} from './__toolbelt/withBasicAuth'
import {BurstValue} from '@burstjs/util';
import {withQueryValidation} from './__toolbelt/withQueryValidation';
import sendTelegram from './__toolbelt/sendTelegram';
import sendSms from './__toolbelt/sendSms';

const BurstApi = composeApi(new ApiSettings(process.env.BURST_PEER))

const QueryArgsSchema = {
    account: {type: 'string'},
    compare: {type: 'string', enum: ['lt', 'gt'], optional: true},
    targetBurst: {type: 'number', positive: true, optional: true},
    msgType: {type: 'string', enum: ['sms', 'telegram', 'mail'], optional: true},
    msgAddress: {type: 'string', optional: true}
}
type CompareType = 'lt' | 'gt'
type MessageType = 'mail' | 'sms' | 'telegram'

interface QueryArgs {
    account: string;
    compare?: CompareType;
    targetBurst?: string;
    msgType?: MessageType; // TODO: multiple types
    msgAddress?: string;

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
    notificationType?: MessageType;
    recipientAddress?: string;
}

const notify = async (queryArgs: QueryArgs, actualBalance: BurstValue): Promise<void> => {
    switch (queryArgs.msgType) {
        case 'mail':
            return Promise.resolve()
        case 'sms':
        return sendSms({
            balance: actualBalance,
            phoneNumber: queryArgs.msgAddress,
            accountId: queryArgs.account,
        })
        case 'telegram':
            return sendTelegram()
    }
    return Promise.resolve()
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
            shouldNotify = targetValue.greater(actualBalance)
            break
        case 'lt':
            shouldNotify = targetValue.less(actualBalance)
    }
    return {shouldNotify}
}

function ConditionalValidation(queryArgs: QueryArgs): true | ValidationError[] {
    const {msgAddress, msgType,account,compare,targetBurst} = queryArgs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notUndef = (v: any): boolean => v !== undefined
    if(!compare) return true

    if(compare && (
        notUndef(account) &&
        notUndef(msgAddress) &&
        notUndef(msgType) &&
        notUndef(targetBurst)
    )){
      return true;
    }

    return [
        {
            type: 'string',
            field: 'compare',
            message: 'Field [compare] requires [msgAddress, msgType, targetBurst]'
        }
    ]
}

export default withBasicAuth(
    withQueryValidation(QueryArgsSchema, ConditionalValidation)(
        async (req: NowRequest, res: NowResponse): Promise<void> => {
            try {
                const queryArgs = req.query as unknown as QueryArgs
                const {account, msgType, compare, targetBurst, msgAddress} = queryArgs;
                const balance = await BurstApi.account.getAccountBalance(account)
                const balanceValue = BurstValue.fromPlanck(balance.balanceNQT)
                const {shouldNotify} = checkBalance(balanceValue, queryArgs)
                if (shouldNotify) {
                    await notify(queryArgs, balanceValue)
                }
                const response: ResponseData = {
                    account: account,
                    balanceBurst: balanceValue.getBurst(),
                    targetBurst: targetBurst,
                    comparator: compare,
                    notified: shouldNotify,
                    notificationType: msgType,
                    recipientAddress: msgAddress
                }
                res.send(response)
            } catch (e) {
                res.status(500).send(e.message)
            }
        }
    )
)
