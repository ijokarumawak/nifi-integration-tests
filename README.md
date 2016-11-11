# Automated NiFi Integration Tests

Apache NiFi has lots of Unit Test code and its mock module is very convenient, however it is not that easy to conduct a series of automated Integration Tests with running NiFi processes and its active data flow.
That's mainly because NiFi doesn't provide an 'Easy to Use' programmable interface to control flow, such as to start or stop Processors, deploy templates or verify queued flow file count ... etc.
Also, due to the characteristic of the product, we need to integrate with a variety of data sources. It is difficult to keep maintaining those environments manually.

This project is aimed to solve above concerns. Designed to provide a framework for NiFi Integration Test.

## Key Components

- [NiFi Javascript API Client](https://github.com/ijokarumawak/nifi-api-client-js): This Javascript library provides programmable interfaces to NiFi Web API. This IT project wraps the client to provide more high level functionalities like emptying all queues. See [lib](https://github.com/ijokarumawak/nifi-integration-tests/tree/master/lib) dir for those js files.

- [NiFi Docker Container](https://github.com/ijokarumawak/nifi-integration-tests/tree/master/nifi-container): This container provides following features to support integration tests:

  - **Different NiFi setups**, Standalone Plain (nifi-sp), Standalone Secure (nifi-ss), Clusterd Plain (nifi-cp) and Clustered Secure (nifi-cs) are configured in the main [docker-compose](https://github.com/ijokarumawak/nifi-integration-tests/blob/master/docker-compose.yml) file. Each of those extends [nifi docker compose service](https://github.com/ijokarumawak/nifi-integration-tests/blob/master/nifi-container/docker-compose.yml).
  - [**Test cases**](https://github.com/ijokarumawak/nifi-integration-tests/tree/master/nifi-container/tests): To add new integration test, create a sub directory, and put a script file named `build-test`, like [nifi-container/tests/s2s/build-test](https://github.com/ijokarumawak/nifi-integration-tests/blob/master/nifi-container/tests/s2s/build-test) which builds and configures the NiFi docker container image.
The script is called when `docker-compose build` command is executed.
Files in the test directory will be added to the container, and accessible by the main test scripts, e.g. [tests/s2s/run-test](https://github.com/ijokarumawak/nifi-integration-tests/blob/master/tests/s2s/run-test).
  - **SNAPSHOT deployment**: it's crucial to support updating NiFi programs frequently without building the container image. To do this, this project takes advantage of Docker volume. A shared volume is used by all NiFi containers to load NiFi libraries from there. By updating the shared volume content and restart containers by `docker-compose restart`, all containers will run with the updated NiFi modules.
  - TODO: It's planned to add support for adding other containers such as databases dedicated to specific test case. It's important to keep the environment small enough so that all containers can run on a single Docker host. Maybe NiFi containers will keep running while other containers will be started/stopped from test scripts.

## How to install

- docker-machine spec recommendation:
  - Memory: 8GB
  - CPU: 4 cores

Clone this project and execute following commands:

```
# Install dependencies
git submodule init
git submodule update
npm install

# This creates a named volume on a docker machine
docker volume create --name nifi

# Build docker images
docker-compose build
```

## How to start containers

It's recommended to test with a single docker compose service to see if it works:

```
# This starts a single NiFi Standalone Plain service
docker-compose up -d nifi-sp
```

If the NiFi started, you can access its Web UI by `http://<docker-machine-ip>:8010/nifi/`.

To start whole docker compose, execute:
```
docker-compose up -d
```

It takes 5 - 10 mins for the entire environment gets ready.

## How to run test

```
./tests/s2s/run-test run
```

## Environment Values

- `NIFI_PROFILE`: Switchs to use `nifi-NIFI_PROFILE.properties`
- `NIFI_HOSTNAME`: Overrides `NIFI_PROFILE`

## How to update NiFi lib files

```
# login to docker machine
docker-machine ssh

# find the mount point for nifi storage volume
docker volume inspect nifi

# then sync the lib dir, don't forget to add permission so that it can be accessed by nifi containers.
sudo su - 
rsync -av <src-nifi>/lib <mount-point>/nifi-<version>/lib
chmod -R 777 <mount-point>nifi-<version>/lib
```

## Useful commands

```
docker-compose restart
docker-compose exec nifi-sp tail -f logs/nifi-app.log
```

## Memo

```
tls-toolkit.sh server -F -f config-ca.json
tls-toolkit.sh client -F -f config-nifi-sp.json
tls-toolkit.sh client -F -f config-nifi-ss.json
tls-toolkit.sh client -F -f config-nifi-cp.json
tls-toolkit.sh client -F -f config-nifi-cs1.json
tls-toolkit.sh client -F -f config-nifi-cs2.json
tls-toolkit.sh client -F -f config-nifi-cs3.json
tls-toolkit.sh client -F -f config-user1.json
keytool -importkeystore -srckeystore user1KeyStore -destkeystore user1.p12 -srcstoretype JKS \
 -deststoretype PKCS12 -srcalias nifi-key -destalias nifi-key \
 -srcstorepass $(cat config-user1.json |jq -r .keyStorePassword) \
 -deststorepass password -destkeypass password
openssl pkcs12 -in user1.p12 -clcerts -nokeys -out user1-cert.pem
openssl pkcs12 -in user1.p12 -nocerts -out user1-key.pem
# If you need to remove password protection
openssl rsa -in user1-key.pem -out user1-key.pem
```

https://github.com/docker-library/openjdk/issues/60

```
docker volume create --name nifi
ln -s storage/nifi-1.1.0-SNAPSHOT/lib
NiFi needs write permission on lib dir
```
