const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const body = require('koa-body')

const router = new Router()
const BASE_URL = '/auth'

function success (ctx) {
  ctx.status = 200

  ctx.body = {
    token: jwt.sign({ role: 'agony' }, '_stopsucking_', { expiresIn: '1 day' }),
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
  ctx.request.body.fields.password === 'stopsucking'
    ? success(ctx)
    : fail(ctx)

  return ctx
}

router.post(BASE_URL, body({ multipart: true }), async (ctx) => {
  auth(ctx)
})

module.exports = router
