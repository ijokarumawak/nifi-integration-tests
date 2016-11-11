# Automated NiFi Integration Tests

Apache NiFi has lots of Unit Test code and its mock module is very convenient, however it is not that easy to conduct a series of automated Integration Tests with running NiFi processes and its active data flow.
It's mainly because NiFi doesn't provide an 'Easy to Use' programmable interface to control flow, such as to start or stop Processors, deploy templates or verify queued flow file count ... etc.
Also, due to the characteristic of the product, we need to integrate with a variety of data sources. It is difficult to keep maintaining those environments manually.

This project is aimed to solve above concerns. Designed to provide a framework for NiFi Integration Test.

## Key Components



- docker-machine spec recommendation:
  - Memory: 8GB
  - CPU: 4 cores

npm install

docker-compose up -d

It takes 5 - 10 mins for the entire environment gets ready.

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
