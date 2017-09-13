# consumer

This feeds populates MongoDB with data from
[zkillboard](https://github.com/zKillboard/RedisQ). It adds a few additional
fields to the data, namespaced under `kbdump`:

- hour
- regionId
- regionName
- unixSeconds
- zone

# Run:

`$ ./bin/start`

*requires node 8*

# Static data

This relies on static data from [fuzzwork](https://www.fuzzwork.co.uk). If
this data needs to be updated, refer to https://www.fuzzwork.co.uk/dump.
