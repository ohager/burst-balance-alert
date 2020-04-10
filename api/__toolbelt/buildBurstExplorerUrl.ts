export default (accountId: string): string => `${process.env.BURST_EXPLORER}/?action=account&account=${accountId}`
