#!/bin/sh

if [ -n "${NIFI_HOSTNAME}" ]
then
  HOSTNAME_PROPERTY=${NIFI_HOSTNAME}
  NIFI_PROFILE=${NIFI_HOSTNAME}
else
  HOSTNAME_PROPERTY=$(hostname)
fi

echo "### Start cofiguring nifi.properties..."
echo "NIFI_HOSTNAME=${NIFI_HOSTNAME}"
echo "NIFI_PROFILE=${NIFI_PROFILE}"
echo "HOSTNAME_PROPERTY=${HOSTNAME_PROPERTY}"

cp -p conf/${NIFI_PROFILE}.properties conf/nifi.properties

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

echo "### Configured nifi.properties:"
cat conf/nifi.properties

if [ -n "${NIFI_LIB_VERSION}" ]
then
  rm -rf lib
  ln -s storage/nifi-${NIFI_LIB_VERSION}/lib
  sed -i -e \
    "s|^nifi.version=.*$|nifi.version=${NIFI_LIB_VERSION}|" \
    conf/nifi.properties
else
  rm -rf lib
  ln -s lib-org lib
fi

echo "### Configured ${NIFI_HOME}:"
ls -l

bin/nifi.sh run
