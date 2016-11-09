#!/bin/sh

find /opt/nifi/data -type f -name '*.dat' |xargs rm -f

tmp_file=/tmp/.generated-file
for protocol in raw http
do
  for queue in drain push
  do
    for size in 1M 10M 100M
    do
      fallocate -l $size $tmp_file
      mv $tmp_file /opt/nifi/data/s2s/$protocol/$queue-queue/$(hostname)-$protocol-$queue-$size.dat
    done
  done
done
