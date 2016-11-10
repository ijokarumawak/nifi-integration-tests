# nifi-test-containers
Docker containers for test


- docker-machine spec recommendation:
  - Memory: 8GB
  - CPU: 4 cores

npm install

docker-compose up -d

It takes 5 - 10 mins for the entire environment gets ready.


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
