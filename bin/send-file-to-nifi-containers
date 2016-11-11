#!/bin/sh

file=$1
to_dir=$2

if [ -z "$file" ] || [ -z "$to_dir" ]
then
  echo "send-file-to-nifi-containers.sh file-to-send dest-dir-on-container"
  exit 1
fi

for container_id in `docker ps |grep nifitestcontainers_nifi |awk '{print $1}'`
do
  docker cp $file $container_id:$to_dir
done

