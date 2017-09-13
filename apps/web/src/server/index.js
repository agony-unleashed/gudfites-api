// imports
// ---------------------------------------------------------------------------

// vendor
const Koa = require('koa')
const jwt = require('koa-jwt')
const morgan = require('koa-morgan')
const serve = require('koa-static')

// lib
const ganksRoutes = require('./routes/v1/ganks')
const gudfitesRoutes = require('./routes/v1/gudfites')
const loginRoutes = require('./routes/auth')
const soloRoutes = require('./routes/v1/solo')

// setup
// ---------------------------------------------------------------------------

const app = new Koa()
const PORT = process.env.VIRTUAL_PORT || 1337

app.use(morgan('dev'))

// jwt
// ---------------------------------------------------------------------------

// @TODO: Generate a keypair with Docker
// $ openssl genrsa -out demo.rsa 1024
// $ openssl rsa -in demo.rsa -pubout > demo.rsa.pub
// const publicKey = fs.readFileSync('demo.rsa.pub');
// const privateKey = fs.readFileSync('demo.rsa');
// const sekrit = jwt({ secret: publicKey, algorithm: 'RS256' })

// public
// ---------------------------------------------------------------------------

app.use(serve(`${__dirname}/public`))
app.use(loginRoutes.routes())

// protected
// ---------------------------------------------------------------------------

app.use(jwt({ secret: '_stopsucking_' }))

app.use(soloRoutes.routes())
app.use(ganksRoutes.routes())
app.use(gudfitesRoutes.routes())

// run!
// ---------------------------------------------------------------------------

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})

module.exports = server
