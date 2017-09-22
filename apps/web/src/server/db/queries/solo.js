const R = require('ramda')
const co = require('co')
const moment = require('moment')

// ---------------------------------------------------------------------------

const connection = require('../connection.js')

// ---------------------------------------------------------------------------

const addZone = ({ zone }) => doc => zone
  ? Object.assign({}, { 'kbdump.zone': zone }, doc)
  : doc

const addRange = ({ range: _range }) => doc => {
  const ranges = {
    day: 'd',
    week: 'w',
    month: 'M',
    year: 'y'
  }

  const range = ranges[_range]

  return _range && range
    ? Object.assign({}, { 'kbdump.unixSeconds': { $gt: moment().subtract(1, range).unix() } }, doc)
    : doc
}

const addAttackerCount = ({ count }) => doc => count
  ? Object.assign({}, { 'killmail.attackerCount': count }, doc)
  : doc

// ---------------------------------------------------------------------------

function * totalByRegion (params) {
  const buildMatch = R.compose(
    addAttackerCount({ count: 1 }),
    addRange(params),
    addZone(params)
  )

  const query = [
    {
      $match: buildMatch({})
    },
    {
      $group: {
        _id: {
          regionName: '$kbdump.regionName'
        },
        total: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]

  const db = yield connection

  return db.collection('killmails').aggregate(query).toArray()
}

// export
// ---------------------------------------------------------------------------

module.exports = {
  getTotalByRegion: params => co(totalByRegion, params)
}
