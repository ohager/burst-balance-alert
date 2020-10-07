import {NowRequest, NowResponse} from '@vercel/node';

export default (req: NowRequest, res: NowResponse): void => {
    res.statusCode = 308
    res.setHeader('Location', req.query.url)
    res.end()
}
