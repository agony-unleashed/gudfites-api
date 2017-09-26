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

const systems = parseCsv(loadCsv(path.resolve(__dirname, 'fixture/mapSolarSystems.csv')))
const regions = parseCsv(loadCsv(path.resolve(__dirname, 'fixture/mapRegions.csv')))

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

const isCapsule = ({ victim }) => /capsule/i.test(victim.shipType.name)

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

const insertKillmail = db => async (killmail) => {
  const result = await db.killmails.insert(killmail)

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

const bail = killmail => {
  // null response from zkill
  if (R.isNil(killmail)) {
    throw new Error('null kill')
  }

  // npc kill
  if (killmail.zkb.npc) {
    throw new Error('npc kill')
  }

  // podkill
  if (isCapsule(killmail.killmail)) {
    throw new Error('pod kill')
  }

  return killmail
}

const addRegionId = lookup => killmail => {
  return lookup.then(systems => {
    const _systemId = killmail.killmail.solarSystem.id_str

    const addlData = {
      regionId: systems[_systemId].regionId,
      regionName: systems[_systemId].regionName
    }

    return Object.assign(
      {},
      killmail,
      { kbdump: addlData }
    )
  })
}

const addHours = killmail => {
  const date = moment(killmail.killmail.killTime, 'YYYY.MM.DD HH:mm:ss')

  const hour = date.format('H')
  const unix = date.unix()

  const addlData = Object.assign(
    {},
    {
      hour: parseInt(hour, 10),
      unixSeconds: unix,
      zone: getZone(hour)
    },
    killmail.kbdump
  )

  return Object.assign(
    {},
    killmail,
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
    .then(insertKillmail(db))
    .then(() => {
      setTimeout(run, 100) // loop
    }) // run loop
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
    insertDocs,
    insertKillmail
  }
}
