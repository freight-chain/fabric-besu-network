#!/bin/bash

function replacePaths() {
  echo "copying network/org json config"
  # sed on MacOSX does not support -i flag with a null extension. We will use
  # 't' for our back-up's extension and depete it at the end of the function
  ARCH=`uname -s | grep Darwin`
  if [ "$ARCH" == "Darwin" ]; then
    OPTS="-it"
  else
    OPTS="-i"
  fi

  mkdir composer/org1
  mkdir composer/org2

  cp "$SIZE"/network-org1.json composer/org1/"$ORG1_DOMAIN".json
  cp "$SIZE"/network-org2.json composer/org2/"$ORG2_DOMAIN".json
  cp "$SIZE"/network.json composer/network.json

  #sed $OPTS "s@PROJECT_PATH@${PWD}@g" composer/org1/$ORG1_DOMAIN.json composer/org2/$ORG2_DOMAIN.json composer/network.json
  sed "$OPTS" "s@CRYPTO_CONFIG@$CRYPTO_CONFIG@g" composer/org1/"$ORG1_DOMAIN".json composer/org2/"$ORG2_DOMAIN".json composer/network.json
  sed "$OPTS" "s@CHANNEL_NAME@$CHANNEL_NAME@g" composer/org1/"$ORG1_DOMAIN".json composer/org2/"$ORG2_DOMAIN".json composer/network.json
  sed "$OPTS" "s@ORG0_ADDRESS@$ORG0_ADDRESS@g" composer/org1/"$ORG1_DOMAIN".json composer/org2/"$ORG2_DOMAIN".json composer/network.json
  sed "$OPTS" "s@ORG1_ADDRESS@$ORG1_ADDRESS@g" composer/org1/"$ORG1_DOMAIN".json composer/org2/"$ORG2_DOMAIN".json composer/network.json
  sed "$OPTS" "s@ORG2_ADDRESS@$ORG2_ADDRESS@g" composer/org1/"$ORG1_DOMAIN".json composer/org2/"$ORG2_DOMAIN".json composer/network.json
  if [ "$ARCH" == "Darwin" ]; then
    rm composer/org1/"$ORG1_DOMAIN".jsont composer/org2/"$ORG2_DOMAIN".jsont composer/network.jsont
  fi
  echo "copying network/org json config complete"
}

ENVIRONMENT="local"

CRYPTO_CONFIG=$PWD/fabric-samples/first-network/crypto-config
#CRYPTO_CONFIG=/home/ocean/fabric-samples/first-network/crypto-config

CHANNEL_NAME="freighttrust-channel"
NETWORK_NAME="freighttrust-network"
SIZE="small"

#ORG0_ADDRESS="206.189.179.0"
ORG0_ADDRESS="localhost"

ORG1_DOMAIN="interchange.freighttrust.net"
ORG1_ADMIN="admin"@$ORG1_DOMAIN
#ORG1_ADDRESS="192.81.217.73"
ORG1_ADDRESS="localhost"

ORG2_DOMAIN="speedydelivery.freighttrust.net"
ORG2_ADMIN="admin"@$ORG2_DOMAIN
#ORG2_ADDRESS="198.199.72.230"
ORG2_ADDRESS="localhost"

while getopts ":c:s:e:" opt; do
  case $opt in
    c)
      echo "-c channel name: $OPTARG" >&2
      CHANNEL_NAME=$OPTARG
    ;;
    s)
      echo "-s size: $OPTARG" >&2
      SIZE=$OPTARG
    ;;
    e)
      echo "-e environment: $OPTARG" >&2
      ENVIRONMENT=$OPTARG
      if [ "$ENVIRONMENT" == "net" ]
      then
        ORG1_ADDRESS="192.81.217.73"
        ORG2_ADDRESS="198.199.72.230"
        # Crypto Config dir should match your install
        CRYPTO_CONFIG=/home/freight-trust-fabric/crypto-config 
      else
        echo "environment: local"
      fi
    ;;
  esac
done

echo "*********** STARTING ***********"
echo "removing old generated files"
rm -rf composer/org1
rm -rf composer/org2
rm "$ORG1_ADMIN@$NETWORK_NAME".card
rm "$ORG2_ADMIN@$NETWORK_NAME".card
rm composer/network.json
echo "removing old generated files complete"
echo "generating new files"
replacePaths
echo "generating new files complete"
echo "*********** ALL FINISHED ***********"
