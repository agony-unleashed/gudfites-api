// imports
// ---------------------------------------------------------------------------

// vendor
const Router = require('koa-router')
const body = require('koa-body')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const promisify = require('util').promisify
const serve = require('koa-static')

// ---------------------------------------------------------------------------

const PW = process.env.GUDFITES_PW || 'stopsucking'

const read = promisify(fs.readFile)
const router = new Router()
const BASE_URL = '/auth'

const CERT_PATH = process.env.GUDFITES_JWT || '../../volumes/pw'
const privateKey = fs.readFileSync(`${CERT_PATH}/gudfites.rsa`)

function success (ctx) {
  ctx.status = 200

  ctx.body = {
    token: jwt.sign({ role: 'agony' }, privateKey, { expiresIn: '1 day', algorithm: 'RS256' }),
    message: 'Successfully logged in!'
  }
}

function fail (ctx) {
  ctx.status = ctx.status = 401

  ctx.body = {
    message: 'Authentication failed'
  }
}

function auth (ctx) {
  ctx.request.body.fields.password === PW
    ? success(ctx)
    : fail(ctx)

  return ctx
}

router.post(BASE_URL, body({ multipart: true }), async (ctx) => {
  auth(ctx)
})

module.exports = router
