import basicAuth from 'basic-auth'

function verify(name, pass) {
  // FIXME: This is just fake...
  return name==='john' && pass==='pass'
}

export const withBasicAuth = fn => (req, res) => {
  const credentials = basicAuth(req)
  if(credentials && verify(credentials.name, credentials.pass)){
    fn(req, res)
  }
  res.statusCode = 401
  res.end('Unauthorized')
}

