// lib
const Test = require('../index').Test
const Fixture = require('./_fixture')

describe('getMail', () => {
  it('Returns data', () => {
    expect.assertions(1)

    const getMail = Test.getMail(() => {
      return new Promise(function (resolve) {
        resolve(Fixture.zkillResponse)
      })
    })

    return getMail().then(function (response) {
      expect(response.killID).toEqual(64375347)
    })
  })

  it('Handles null payloads', () => {
    expect.assertions(1)

    const getMail = Test.getMail(() => {
      return new Promise(function (resolve) {
        resolve({ data: { package: null } })
      })
    })

    return getMail().then(function (response) {
      expect(response).toBeNull()
    })
  })
})

describe('insertDocs', () => {
  it('inserts a document', () => {
    expect.assertions(1)

    const close = jest.fn()

    const database = {
      collection: function () {
        return this
      },

      close: close,

      insertMany: function (_, cb) {
        return cb(null, { result: 'ok', insertedIds: [1234] })
      }
    }

    return Test.insertDocs(database, [{ howdy: true }])
      .then(function () {
        expect(close.mock.calls.length).toEqual(1)
      })
  })

  it('closes the database on error', () => {
    expect.assertions(1)

    const close = jest.fn()

    const database = {
      collection: function () {
        return this
      },

      close: close,

      insertMany: function (_, cb) {
        return cb(new Error('hrmm'), { result: 'nope' })
      }
    }

    return Test.insertDocs(database, [{ howdy: true }])
      .catch(function () {
        expect(close.mock.calls.length).toEqual(1)
      })
  })
})

describe('insertKillmail', () => {
  it('inserts a killmail, and responds "ok"', () => {
    expect.assertions(1)

    const connect = () => new Promise(function (resolve, reject) {
      const database = {
        collection: function () {
          return this
        },

        close: () => null,

        insertMany: function (_, cb) {
          return cb(null, { result: 'ok', insertedIds: [1234] })
        }
      }

      resolve(database)
    })

    return Test.insertKillmail(connect)(Fixture.zkillResponse.data.package)
      .then(function (status) {
        expect(status).toEqual('ok')
      })
  })
})
