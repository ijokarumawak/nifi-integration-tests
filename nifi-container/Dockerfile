FROM mkobit/nifi:1.0.0-openjdk-8
ADD ./flow.xml.gz ./nifi-*.properties ./authorizers.xml ./authorizations.xml ./users.xml ./toolkit/nifi-*-keystore ./toolkit/nifi-*-truststore conf/
ADD ./start-nifi.sh .
RUN mkdir -p data/s2s/raw/drain-queue \
  && mkdir -p data/s2s/http/drain-queue \
  && mkdir -p data/s2s/raw/push-queue \
  && mkdir -p data/s2s/http/push-queue

EXPOSE 8080 8081 8082 9001
CMD ["./start-nifi.sh"]
