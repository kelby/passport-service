#!/bin/bash

docker build -t meterio/passport-api:latest .
docker push meterio/passport-api:latest