#!/bin/sh

echo "Start NiFi S2S Test!" \
  && node s2s-client-process-groups.js stop \
  && ./exec-command-on-nifi-containers.sh /opt/nifi/delete-data-files.sh \
  && node empty-all-queues.js \
  && ./exec-command-on-nifi-containers.sh /opt/nifi/allocate-data-files.sh \
  && ./exec-command-on-nifi-containers.sh /opt/nifi/count-data-files.sh \
  && node s2s-client-process-groups.js start \
  && node wait-all-files-transferred.js \
  && ./exec-command-on-nifi-containers.sh /opt/nifi/count-data-files.sh
