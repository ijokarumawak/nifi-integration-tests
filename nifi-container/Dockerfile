# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements. See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership. The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License. You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied. See the License for the
# specific language governing permissions and limitations
# under the License.
#

FROM openjdk:8
MAINTAINER Koji Kawamura <ijokarumawak@apache.org>

ARG UID=1000
ARG GID=50
ARG NIFI_VERSION=1.2.0

ENV NIFI_BASE_DIR /opt/nifi
ENV NIFI_HOME $NIFI_BASE_DIR/nifi-$NIFI_VERSION
ENV NIFI_BINARY_URL https://archive.apache.org/dist/nifi/$NIFI_VERSION/nifi-$NIFI_VERSION-bin.tar.gz

# Setup NiFi user
RUN groupadd -g $GID nifi || groupmod -n nifi `getent group $GID | cut -d: -f1`
RUN useradd --shell /bin/bash -u $UID -g $GID -m nifi
RUN mkdir -p $NIFI_HOME

# Download, validate, and expand Apache NiFi binary.
RUN curl -fSL $NIFI_BINARY_URL -o $NIFI_BASE_DIR/nifi-$NIFI_VERSION-bin.tar.gz \
	&& echo "$(curl $NIFI_BINARY_URL.sha256) *$NIFI_BASE_DIR/nifi-$NIFI_VERSION-bin.tar.gz" | sha256sum -c - \
	&& tar -xvzf $NIFI_BASE_DIR/nifi-$NIFI_VERSION-bin.tar.gz -C $NIFI_BASE_DIR \
	&& rm $NIFI_BASE_DIR/nifi-$NIFI_VERSION-bin.tar.gz

ADD ./start-nifi.sh $NIFI_HOME
ADD ./conf/* ./toolkit/nifi-*-keystore ./toolkit/nifi-*-truststore $NIFI_HOME/conf/
ADD ./tests $NIFI_HOME/tests
RUN mv $NIFI_HOME/lib $NIFI_HOME/lib-org
RUN chown -R nifi:nifi $NIFI_HOME

USER nifi

EXPOSE 8080 8081 8082 9001

# Startup NiFi
CMD $NIFI_HOME/start-nifi.sh

