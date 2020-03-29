import basicAuth from 'basic-auth'

const PublicRoutes = ['/health'];

function verify(name, pass) {

  // FIXME: This is just fake...
  return name==='john' && pass==='pass'
}

export function auth(req, res, next) {
  if (PublicRoutes.includes(req.url)) {
    next();
  }
  const credentials = basicAuth(req)
  if(credentials && verify(credentials.name, credentials.pass)){
    next()
  }
  res.statusCode = 401
  res.end('Unauthorized')
}

