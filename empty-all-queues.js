var nifiApiClient = require('nifi-api-client');
var fs = require('fs');
var yaml = require('js-yaml');

var trace = false;
var debug = true;

var emptyQueue = (nifiApi, connection, callback) => {
  if (connection.status.aggregateSnapshot.queuedCount == 0) return callback(null);

  console.log('empty queue', connection.id, connection.status.sourceName, '->', connection.status.destinationName, connection.status.aggregateSnapshot.queued);

  var dropRequestPath = '/flowfile-queues/' + connection.id + '/drop-requests';
  nifiApi.request({
    url: dropRequestPath,
    method: 'POST'
  }, (err, res, body) => {
    if (err) {
      callback(err);
      return;
    }
    if(trace) console.log(res.statusCode);
    if (res.statusCode == 202) {
      var dropRequest = JSON.parse(body).dropRequest;

      var waitDropRequest = (dropRequest, callback) => {
        if (dropRequest.finished) {
          return callback(null, dropRequest);
        } else {
          console.log(dropRequest.current);
          nifiApi.getComponent(dropRequestPath + '/' + dropRequest.id, (err, res) => {
            if (err) return callback(err);
            setTimeout(() => {waitDropRequest(res.dropRequest, callback)}, 1000);
          });
        }
      }

      // Start waiting.
      waitDropRequest(dropRequest, callback);
    } else {
      callback(res);
    }
  });
}

var emptyQueues = (nifiApi, connections, callback) => {
  var c = connections.length;
  if (c == 0) return callback(null);

  connections.forEach((connection) => {
    emptyQueue(nifiApi, connection, (err, dropRequest) => {
      if (err) return callback(err);

      c--;
      if (c == 0) return callback(null);
    });
  });
}

var emptyAllQueues = (nifiApi, pgId, callback) => {
  nifiApi.getProcessGroupFlow(pgId, (err, pgFlow) => {
    if (err) return callback(err);

    var flow = pgFlow.processGroupFlow.flow;
    emptyQueues(nifiApi, flow.connections, (err) => {
      if (err) return callback(err);

      var p = flow.processGroups.length;
      if (p == 0) return callback(null);

      flow.processGroups.forEach((pg) => {
        emptyAllQueues(nifiApi, pg.id, (err) => {
          if (err) return callback(err);

          p--;
          if (p == 0) return callback(null);
        });
      });
    });
  });
}

var conf = yaml.safeLoad(fs.readFileSync('nifi-api-client-config.yml'));

Object.keys(conf).forEach((endpoint) => {
  var nifiApi = new nifiApiClient.NiFiApi(conf[endpoint]);
  emptyAllQueues(nifiApi, 'root', (err) => {
    if (err) return console.log('Failed to empty all queues.', endpoint, err);
  
    console.log('Finished clearing all queues at ', endpoint);
  });
});
