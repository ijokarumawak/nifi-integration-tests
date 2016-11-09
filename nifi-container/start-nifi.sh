#!/bin/sh

cp -p conf/${NIFI_PROFILE}.properties conf/nifi.properties
sed -i -e \
  "s|^nifi.web.http.host=.*$|nifi.web.http.host=$(hostname)|" \
  conf/nifi.properties
sed -i -e \
  "s|^nifi.cluster.node.address=.*$|nifi.cluster.node.address=$(hostname)|" \
  conf/nifi.properties
sed -i -e \
  "s|^nifi.remote.input.host=.*$|nifi.remote.input.host=$(hostname)|" \
  conf/nifi.properties
sed -i -e \
  "s|^nifi.zookeeper.root.node=.*$|nifi.zookeeper.root.node=/${NIFI_PROFILE}|" \
  conf/nifi.properties

bin/nifi.sh run
