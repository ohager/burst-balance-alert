interface DeeplinkArgs {
    accountId: string;
    origin?: string | null;
}

export default ({accountId, origin = null}: DeeplinkArgs): string => {
    const deepLink = `burst://requestBurst?receiver=${accountId}`
    return origin ? `${origin}/api/redirect?url=${encodeURI(deepLink)}` : deepLink
}
