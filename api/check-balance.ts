import {ApiSettings, composeApi} from '@burstjs/core';
import {NowRequest, NowResponse} from '@now/node';
import {withBasicAuth} from './__toolbelt/withBasicAuth'
import {BurstValue} from '@burstjs/util';
import {withQueryValidation} from './__toolbelt/withQueryValidation';

const BurstApi = composeApi(new ApiSettings(process.env.BURST_PEER))

const QueryArgsSchema = {
    account: {type: 'string'}
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
}

const notify = (): Promise<void> => {
    return Promise.resolve()
}

const checkBalance = (actualBalance: BurstValue, queryArgs: QueryArgs): CheckResult => {
    const {compare, targetBurst} = queryArgs;
    let shouldNotify = false
    if (!compare) {
        return {shouldNotify}
    }
    const targetValue = BurstValue.fromBurst(targetBurst);
    switch(compare){
        case 'gt':
            shouldNotify = targetValue.greater(actualBalance)
            break
        case 'lt':
            shouldNotify = targetValue.less(actualBalance)
    }
    return {shouldNotify}
}

export default withBasicAuth(
    withQueryValidation(QueryArgsSchema)(
        async (req: NowRequest, res: NowResponse): Promise<void> => {
            try {
                const queryArgs = req.query as unknown as QueryArgs
                const balance = await BurstApi.account.getAccountBalance(queryArgs.account)
                const balanceValue = BurstValue.fromPlanck(balance.balanceNQT)
                const {shouldNotify} = checkBalance(balanceValue, queryArgs)
                if (shouldNotify) {
                    await notify()
                }
                const response: ResponseData = {
                    account: queryArgs.account,
                    balanceBurst: balanceValue.getBurst(),
                    targetBurst: queryArgs.targetBurst,
                    comparator: queryArgs.compare,
                    notified: shouldNotify,
                }
                res.send(response)
            } catch (e) {
                res.status(400)
            }
        }
    )
)
