// imports
// ---------------------------------------------------------------------------

// vendor
const Koa = require('koa')
const fs = require('fs')
const jwt = require('koa-jwt')
const morgan = require('koa-morgan')
const promisify = require('util').promisify
const serve = require('koa-static')

// lib
const ganksRoutes = require('./routes/v1/ganks')
const gudfitesRoutes = require('./routes/v1/gudfites')
const loginRoutes = require('./routes/auth')
const soloRoutes = require('./routes/v1/solo')

// setup
// ---------------------------------------------------------------------------

const read = promisify(fs.readFile)

const app = new Koa()
const PORT = process.env.VIRTUAL_PORT || 1337

app.use(morgan('dev'))

// jwt
// ---------------------------------------------------------------------------

const CERT_PATH = process.env.GUDFITES_JWT || '../../volumes/pw'
const publicKey = fs.readFileSync(`${CERT_PATH}/gudfites.rsa.pub`)

// public
// ---------------------------------------------------------------------------


app.use(serve(`${__dirname}/public`))
app.use(loginRoutes.routes())

// protected
// ---------------------------------------------------------------------------

app.use(jwt({ secret: publicKey, algorithm: 'RS256' }))

app.use(soloRoutes.routes())
app.use(ganksRoutes.routes())
app.use(gudfitesRoutes.routes())

// run!
// ---------------------------------------------------------------------------

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})

module.exports = server
