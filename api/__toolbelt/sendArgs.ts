import {BurstValue} from '@burstjs/util';

export interface SendArgs {
    accountId: string;
    alias?: string;
    balance: BurstValue;
    address: string;
    origin: string;
}
