const Router = require('koa-router')
const queries = require('../../db/queries/solo')

const router = new Router()
const BASE_URL = `/api/v1/solo`

router.get(BASE_URL, async (ctx, ...rest) => {
  try {
    const solos = await queries.getTotalByRegion(ctx.request.query)

    ctx.body = {
      status: 'success',
      data: solos
    }
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
