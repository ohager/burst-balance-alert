import polka from 'polka';
import middlewares from './middlewares'

export function start() {
  polka()
    .use(...middlewares)
    .get('/health', (req, res) => {
      res.end('Service is up')
    })
    .get('/private', (req, res) => {
      res.end('Private')
    })
    .listen(3000, err => {
      if (err) throw err
      console.log(`> Running on localhost:3000`)
    });
}
