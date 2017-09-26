# gudfites api

This is an API application composed of a few containers. The quickest method
to deploy is to clone this repo into an environment that has docker-ce, and
then modify `docker-compose.yml` so that a legit domain is used for SSL certs.

If you want to nuke the existing database, make sure to take down the docker
containers with `$ docker-compose down -v`, and then `$ rm -rf volumes/mongo`.

# Run:

`$ docker-compose up`

# Additional documentation

- [front-end](https://github.com/agony-unleashed/gudfites)
- [consumer](apps/web/README.md)
- [web](apps/web/README.md)

# TODO:

- [ ] expiry for zkill data
- [x] Use a legit cert for jwt signing - will also need to do some Docker env stuff
- [ ] discord chatbot for quick queries
- [ ] many more endpoints
- [x] uh... can't run compose with `-d`...
- [ ] mongo keeps going into lunatic state
