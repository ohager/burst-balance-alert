import {NowRequest} from '@now/node/dist';

export default (req: NowRequest): string => {
    const host = req.headers.host;
    return `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`
}
