# Fabric-Besu Interchange

> Note: Composer has been depreciated, so don't expect this to work should
> Fabric decide to do some breaking changes, which they probably will.

Generate freighttrust-channel

1. ./fr8.sh -m generate -c freighttrust-channel

Starting with channel 'freighttrust-channel' and CLI timeout of '10000' seconds
and CLI delay of '3' seconds and using database 'couchdb' and using Fabric CAs,
node chaincode, and yaml specified

2. ./fr8.sh -m up -s couchdb -c freighttrust-channel -f docker-compose-cli.yaml
   -a -l node

**_ COPYING CERTS _**

A. ca/orderer
CRYPTO_CONFIG/peerOrganizations/arrayofblocks.freighttrust.cloud/peers/peer0.arrayofblocks.freighttrust.cloud/tls/ca.crt
awk 'NF {sub(/\r/, ""); printf "%s\\n",\$0;}'
fabric-samples/first-network/crypto-config/peerOrganizations/arrayofblocks.freighttrust.cloud/peers/peer0.arrayofblocks.freighttrust.cloud/tls/ca.crt >
composer/org1/ca.freighttrust.cloud.txt

CRYPTO_CONFIG/peerOrganizations/speedydelivery.freighttrust.cloud/peers/peer0.speedydelivery.freighttrust.cloud/tls/ca.crt
awk 'NF {sub(/\r/, ""); printf "%s\\n",\$0;}'
fabric-samples/first-network/crypto-config/peerOrganizations/speedydelivery.freighttrust.cloud/peers/peer0.speedydelivery.freighttrust.cloud/tls/ca.crt >
composer/org2/ca-speedydelivery.freighttrust.cloud.txt

CRYPTO_CONFIG/ordererOrganizations/freighttrust.cloud/orderers/orderer.freighttrust.cloud/tls/ca.crt
awk 'NF {sub(/\r/, ""); printf "%s\\n",\$0;}'
fabric-samples/first-network/crypto-config/ordererOrganizations/freighttrust.cloud/orderers/orderer.freighttrust.cloud/tls/ca.crt >
composer/ca-orderer.txt

B. org admins cp -p
fabric-samples/first-network/crypto-config/peerOrganizations/arrayofblocks.freighttrust.cloud/users/Admin@arrayofblocks.freighttrust.cloud/msp/signcerts/A*.pem
composer/org1 cp -p
fabric-samples/first-network/crypto-config/peerOrganizations/arrayofblocks.freighttrust.cloud/users/Admin@arrayofblocks.freighttrust.cloud/msp/keystore/*\_sk
composer/org1

cp -p
fabric-samples/first-network/crypto-config/peerOrganizations/speedydelivery.freighttrust.cloud/users/Admin@speedydelivery.freighttrust.cloud/msp/signcerts/A*.pem
composer/org2 cp -p
fabric-samples/first-network/crypto-config/peerOrganizations/speedydelivery.freighttrust.cloud/users/Admin@speedydelivery.freighttrust.cloud/msp/keystore/*\_sk
composer/org2

**_ END COPYING CERTS _**

export PEER_ORGS=CRYPTO_CONFIG/peerOrganizations

composer card create -p composer/org1/fr8-network-org1.json -u PeerAdmin -c
$PEER_ORGS/arrayofblocks.freighttrust.cloud/users/Admin@arrayofblocks.freighttrust.cloud/msp/signcerts/A*.pem -k $PEER_ORGS/arrayofblocks.freighttrust.cloud/users/Admin@arrayofblocks.freighttrust.cloud/msp/keystore/\*\_sk
-r PeerAdmin -r ChannelAdmin -f composer/org1/PeerAdmin@fr8-network-org1.card

composer card create -p composer/org2/fr8-network-org2.json -u PeerAdmin -c
$PEER_ORGS/speedydelivery.freighttrust.cloud/users/Admin@speedydelivery.freighttrust.cloud/msp/signcerts/A*.pem -k $PEER_ORGS/speedydelivery.freighttrust.cloud/users/Admin@speedydelivery.freighttrust.cloud/msp/keystore/\*\_sk
-r PeerAdmin -r ChannelAdmin -f composer/org2/PeerAdmin@fr8-network-org2.card

composer card import -f composer/org1/PeerAdmin@fr8-network-org1.card --card
PeerAdmin@fr8-network-org1 composer card import -f
composer/org2/PeerAdmin@fr8-network-org2.card --card PeerAdmin@fr8-network-org2

composer network install --card PeerAdmin@fr8-network-org1 --archiveFile
~/Projects/freighttrust-network/freighttrust-network@0.3.7.bna composer network
install --card PeerAdmin@fr8-network-org2 --archiveFile
~/Projects/freighttrust-network/freighttrust-network@0.3.7.bna

composer identity request -c PeerAdmin@fr8-network-org1 -u admin -s adminpw -d
composer/org1/alice composer identity request -c PeerAdmin@fr8-network-org2 -u
admin -s adminpw -d composer/org2/bob

composer network start -c PeerAdmin@fr8-network-org1 -n freighttrust-network -V
0.3.7 -o composer/endorsementPolicyFile=endorsement-policy.json -A alice -C
composer/org1/alice/admin-pub.pem -A bob -C composer/org2/bob/admin-pub.pem

composer card create -p composer/org1/fr8-network-org1.json -u alice -n
freighttrust-network -c composer/org1/alice/admin-pub.pem -k
composer/org1/alice/admin-priv.pem -f
composer/org1/alice@freighttrust-network.card composer card create -p
composer/org2/fr8-network-org2.json -u bob -n freighttrust-network -c
composer/org2/bob/admin-pub.pem -k composer/org2/bob/admin-priv.pem -f
composer/org2/bob@freighttrust-network.card

composer card import -f composer/org1/alice@freighttrust-network.card composer
card import -f composer/org2/bob@freighttrust-network.card

composer network ping -c alice@freighttrust-network

composer-rest-server -c alice@freighttrust-network -n never -w true

./fr8.sh -m down -c freighttrust-channel

**_ using new scripts _**

./fabric.sh -c freighttrust-channel ./composer.sh -s small -n
~/Projects/freighttrust-network/freighttrust-network@0.3.7.bna -v 0.3.7 -c
freighttrust-channel ./destroy.sh -c freighttrust-channel
