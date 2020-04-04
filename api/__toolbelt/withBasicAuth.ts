import basicAuth from 'basic-auth'

const verify = (name, pass): boolean => name === process.env.ApiUser
    && pass === process.env.ApiPass;

export const withBasicAuth = fn => (req, res): void => {
  const credentials = basicAuth(req)
  if(credentials && verify(credentials.name, credentials.pass)){
    fn(req, res)
  }
  res.statusCode = 401
  res.end('Unauthorized')
}

