#!/bin/sh

cp -p conf/${NIFI_PROFILE}.properties conf/nifi.properties

if [ -n "${NIFI_HOSTNAME}" ]
then
  HOSTNAME_PROPERTY=${NIFI_HOSTNAME}
else
  HOSTNAME_PROPERTY=$(hostname)
fi

if [ -n "${NIFI_CLUSTERNAME}" ]
then
  CLUSTERNAME_PROPERTY=${NIFI_CLUSTERNAME}
else
  CLUSTERNAME_PROPERTY=${NIFI_PROFILE}
fi

sed -i -e \
  "s|^nifi.web.http.host=.*$|nifi.web.http.host=${HOSTNAME_PROPERTY}|" \
  conf/nifi.properties
sed -i -e \
  "s|^nifi.web.https.host=.*$|nifi.web.https.host=${HOSTNAME_PROPERTY}|" \
  conf/nifi.properties
sed -i -e \
  "s|^nifi.cluster.node.address=.*$|nifi.cluster.node.address=${HOSTNAME_PROPERTY}|" \
  conf/nifi.properties
sed -i -e \
  "s|^nifi.remote.input.host=.*$|nifi.remote.input.host=${HOSTNAME_PROPERTY}|" \
  conf/nifi.properties
sed -i -e \
  "s|^nifi.zookeeper.root.node=.*$|nifi.zookeeper.root.node=/${CLUSTERNAME_PROPERTY}|" \
  conf/nifi.properties

bin/nifi.sh run
