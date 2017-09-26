const mongoist = require('mongoist')

const DB_URL = process.env.KBDUMP_LOCAL
  ? 'mongodb://localhost:27017/zkill'
  : 'mongodb://database:27017/zkill'

module.exports = mongoist(DB_URL)
