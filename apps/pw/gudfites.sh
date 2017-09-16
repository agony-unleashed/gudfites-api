#!/bin/bash

openssl genrsa -out /etc/ssl/certs/gudfites.rsa 1024

openssl rsa -in /etc/ssl/certs/gudfites.rsa -pubout > /etc/ssl/certs/gudfites.rsa.pub
