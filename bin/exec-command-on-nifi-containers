#!/bin/sh

for container_id in `docker ps |grep nifitestcontainers_nifi |awk '{print $1}'`
do
  docker exec -it $container_id $@
done

