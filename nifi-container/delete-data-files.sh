#!/bin/sh

find /opt/nifi/data -type f -name '*.dat' |xargs rm -f
