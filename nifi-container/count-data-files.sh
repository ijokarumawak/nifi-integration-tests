#!/bin/sh

find /opt/nifi/data -type f |awk -F '/' '{print $6,$7}' |uniq -c |sed "s/^/$(hostname)/"
