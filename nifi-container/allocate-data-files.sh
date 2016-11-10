#!/bin/sh

find /opt/nifi/data -type f -name '*.dat' |xargs rm -f

for protocol in raw http
do
  for queue in drain push
  do
#    for size in 1M 10M 100M
    for size in 1K
    do
      for i in `seq -f "%04g" 1 1000`
      do
        fallocate -l $size /opt/nifi/data/s2s/$protocol/$queue-queue/$(hostname)-$protocol-$queue-$size-$i.dat
      done
    done
  done
done
