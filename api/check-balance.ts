import {ApiSettings, composeApi} from '@burstjs/core';
import {NowRequest, NowResponse} from '@now/node';
import {withBasicAuth} from './__toolbelt/withBasicAuth'
import {BurstValue} from '@burstjs/util';
import {withQueryValidation} from './__toolbelt/withQueryValidation';

const BurstApi = composeApi(new ApiSettings(process.env.BURST_PEER))

const QueryArgsSchema = {
    account: {type: 'string'}
}

interface QueryArgs {
    account: string;
}

export default withBasicAuth(
    withQueryValidation(QueryArgsSchema)(
        async (req: NowRequest, res: NowResponse) => {
            try {
                const {account} = req.query as unknown as QueryArgs;
                const balance = await BurstApi.account.getAccountBalance(account)
                const balanceBurst = BurstValue.fromPlanck(balance.balanceNQT)
                res.send(balanceBurst.getBurst())
            } catch (e) {
                res.status(400)
            }
        }
    )
)
