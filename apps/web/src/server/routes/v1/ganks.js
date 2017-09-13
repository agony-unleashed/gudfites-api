const Router = require('koa-router')

const router = new Router()
const BASE_URL = `/api/v1/ganks`

router.get(BASE_URL, async (ctx) => {
  ctx.body = 'nothing here\n'
})

module.exports = router
