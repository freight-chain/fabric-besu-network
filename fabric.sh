#!/bin/bash

CHANNEL_NAME="freighttrust-channel"

while getopts ":c:" opt; do
  case $opt in
    c)
      echo "-c channel name: $OPTARG" >&2
      CHANNEL_NAME=$OPTARG
    ;;
  esac
done

cd fabric/freighttrust-network
echo "generating fabric"
yes | ./fr8.sh -m generate -c "$CHANNEL_NAME"
echo "generating complete"
echo "starting fabric"
yes | ./fr8.sh -m up -s couchdb -c "$CHANNEL_NAME" -f docker-compose-cli.yaml -a -l node
echo "starting fabric complete"
cd ../..