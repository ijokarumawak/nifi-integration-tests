FROM mkobit/nifi:1.0.0-oracle-java8
ADD ./start-nifi.sh ./
ADD ./conf/* ./toolkit/nifi-*-keystore ./toolkit/nifi-*-truststore conf/
ADD ./tests tests
RUN mv lib lib-org \
  && ./tests/build-tests

EXPOSE 8080 8081 8082 9001
CMD ["./start-nifi.sh"]
