import basicAuth from 'basic-auth'

const verify = (name, pass): boolean => name === process.env.API_USER
    && pass === process.env.API_PASS;

export const withBasicAuth = next => (req, res): void => {
  const credentials = basicAuth(req)
  if(credentials && verify(credentials.name, credentials.pass)){
    return next(req, res)
  }
  res.statusCode = 401
  res.end('Unauthorized')
}

