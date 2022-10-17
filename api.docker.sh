#!/bin/bash

docker build -t meterio/passport-api:latest -f api.Dockerfile .
docker push meterio/passport-api:latest
