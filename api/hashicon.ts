import hashicon from 'hashicon'
import {createCanvas} from 'canvas'
import {withQueryValidation} from './__toolbelt/withQueryValidation';

const ImageFormat = 'image/png'

const QueryArgsSchema = {
    text: {type: 'string'},
    size: {type: 'string', enum: ['s', 'm', 'l', 'xl', 'xxl'], optional: true}
}

const SizeMap = {
    s: 32,
    m: 64,
    l: 128,
    xl: 256,
    xxl: 512
}

export default withQueryValidation(QueryArgsSchema)(
    (req, res): void => {
        const {text, size = 'l'} = req.query
        res.setHeader('Content-Type', ImageFormat)
        res.setHeader('Content-Disposition', 'inline')
        const icon = hashicon(text, {createCanvas, size: SizeMap[size]})
        res.send(icon.toBuffer(ImageFormat))
    })
