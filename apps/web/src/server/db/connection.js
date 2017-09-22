const MongoClient = require('mongodb').MongoClient

const DB_URL = process.env.KBDUMP_LOCAL
  ? 'mongodb://localhost:27017/zkill'
  : 'mongodb://database:27017/zkill'

module.exports = MongoClient.connect(DB_URL)
