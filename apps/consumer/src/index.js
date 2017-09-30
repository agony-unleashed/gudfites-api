// imports
// ---------------------------------------------------------------------------

const R = require('ramda')
const axios = require('axios')
const csv = require('csv')
const fs = require('fs')
const moment = require('moment')
const mongoist = require('mongoist')
const path = require('path')
const util = require('util')

// ---------------------------------------------------------------------------

const DB_URL = process.env.KBDUMP_LOCAL
  ? 'mongodb://localhost:27017/zkill'
  : 'mongodb://db:27017/zkill'

const db = mongoist(DB_URL)
const loadCsv = path => util.promisify(fs.readFile)(path)
const parseCsv = doc => doc.then(_doc => util.promisify(csv.parse)(_doc))

// ---------------------------------------------------------------------------

const systems = parseCsv(loadCsv(path.resolve(__dirname, 'static/map-solar-systems.csv')))
const regions = parseCsv(loadCsv(path.resolve(__dirname, 'static/map-regions.csv')))
const items = parseCsv(loadCsv(path.resolve(__dirname, 'static/inv-types.csv')))

const systemsDict = systems.then(_systems => {
  return regions.then(_regions => {
    const regionLookup = _regions.reduce(function (acc, region) {
      const regionId = region[0]

      acc[regionId] = region[1]

      return acc
    }, {})

    return R.tail(_systems).reduce(function (acc, system) {
      const id = system[2]
      const regionId = system[0]

      acc[id] = {
        regionId,
        regionName: regionLookup[regionId]
      }

      return acc
    }, {})
  })
})

const inRange = (_min, _max, _test) => {
  const min = _min
  const max = _max
  const test = _test

  if (min < max) {
    return test >= min && test <= max
  } else {
    return test >= min || test <= max
  }
}

const getZone = hour => {
  const zones = [
    {
      zoneName: 'au',
      range: [6, 13]
    },
    {
      zoneName: 'eu',
      range: [17, 22]
    },
    {
      zoneName: 'us',
      range: [23, 8]
    }
  ]

  const zone = zones.reduce(
    (acc, zone) => inRange(zone.range[0], zone.range[1], hour) ? zone.zoneName : acc, 
    ''
  )

  return R.isEmpty(zone) ? null : zone
}

const isCapsule = ({ victim }) => victim.ship_type_id === 33328 || victim.ship_type_id === 670

// ---------------------------------------------------------------------------

const insertKillmail = db => async (payload) => {
  const result = await db.killmails.insert(payload)

  console.log(`inserted killmail: ${result.killID}`)

  return 'success!'
}

const getMail = get => () => {
  const config = {
    params: {
      queueID: 'gudfites' // @TODO: env
    }
  }

  return get('https://redisq.zkillboard.com/listen.php', config)
    .then(response => response.data.package)
}

const bail = payload => {
  // null response from zkill
  if (R.isNil(payload)) {
    throw new Error('null kill')
  }

  // npc kill
  if (payload.zkb.npc) {
    throw new Error('npc kill')
  }

  // podkill
  if (isCapsule(payload.killmail)) {
    throw new Error('pod kill')
  }

  return payload
}

const addRegionId = lookup => payload => {
  return lookup.then(systems => {
    const _systemId = payload.killmail.solar_system_id

    const addlData = {
      regionId: systems[_systemId].regionId,
      regionName: systems[_systemId].regionName
    }

    return Object.assign(
      {},
      payload,
      { kbdump: addlData }
    )
  })
}

const addHours = payload => {
  const date = moment(payload.killmail.killmail_time, 'YYYY.MM.DD HH:mm:ss')

  const hour = date.format('H')
  const unix = date.unix()

  const addlData = Object.assign(
    {},
    {
      hour: parseInt(hour, 10),
      unixSeconds: unix,
      zone: getZone(hour)
    },
    payload.kbdump
  )

  return Object.assign(
    {},
    payload,
    { kbdump: addlData }
  )
}

const addAttackerCount = payload => {
  const addlData = Object.assign(
    {},
    {
      attackerCount: payload.killmail.attackers.length
    },
    payload.kbdump
  )

  return Object.assign(
    {},
    payload,
    { kbdump: addlData }
  )
}

// export
// ---------------------------------------------------------------------------

function run () {
  getMail(axios.get)()
    .then(bail)
    .then(addRegionId(systemsDict))
    .then(addHours)
    .then(addAttackerCount)
    .then(insertKillmail(db))
    .then(() => { setTimeout(run, 100) }) // run loop
    .catch(function (err) {
      console.error(err.message)

      // @TODO: Add better managment of what to do under different faults

      setTimeout(run, 5000) // retry
    })
}

module.exports = {
  default: run,

  Test: {
    getMail,
    insertKillmail
  }
}
