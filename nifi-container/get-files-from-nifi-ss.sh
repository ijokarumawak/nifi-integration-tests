#!/bin/sh

for f in flow.xml.gz authorizers.xml authorizations.xml users.xml
do
  docker cp nifitestcontainers_nifi-ss_1:/opt/nifi/conf/$f .
  # Add permissions so that nifi user can r/w these files.
  chmod 666 $f
done
