var nifiApiClient = require('nifi-api-client');
var fs = require('fs');
var yaml = require('js-yaml');

var trace = false;
var debug = false;

var printConnection = (connection) => {
  console.log(connection.id, connection.status.sourceName, '->', connection.status.destinationName, connection.status.aggregateSnapshot.queued);
}

var emptyQueue = (nifiApi, connection, callback) => {
  if (connection.status.aggregateSnapshot.queuedCount == 0) return callback(null);

  printConnection(connection);

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
          if (trace) console.log(dropRequest.current);
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

var visitArray = (array, onElement, callback) => {
  var c = array.length;
  if (c == 0) return callback(null);

  array.forEach((element) => {
    onElement(element, (err) => {
      if (err) return callback(err);

      c--;
      if (c == 0) return callback(null);
    });
  });
}

var visitProcessGroupFlows = (nifiApi, pgId, onProcessGroup, onProcessGroupFlow, callback) => {
  nifiApi.getProcessGroup(pgId, (err, pg) => {
    if (err) return callback(err);

    // Do something with a ProcessGroup
    onProcessGroup(pg, (err) => {
      if (err) return callback(err);

      nifiApi.getProcessGroupFlow(pgId, (err, pgFlow) => {
        if (err) return callback(err);

        // Do something with a ProcessGroupFlow
        var flow = pgFlow.processGroupFlow.flow;
        onProcessGroupFlow(pgFlow.processGroupFlow, (err) => {
          if (err) return callback(err);

          // Traverse children
          visitArray(flow.processGroups, (childPg, childPgBack) => {
            visitProcessGroupFlows(nifiApi, childPg.id,
              onProcessGroup, onProcessGroupFlow, childPgBack);
          }, callback);
        });
      });
    });
  });
}

// TODO: Wanna create a JSON stats object.
var printAllQueues = (nifiApi, pgId, callback) => {
  visitProcessGroupFlows(nifiApi, pgId, (pg, pgBack) => {
    if (debug) console.log('### Got pg', pg.component.name, pg.id);
    pgBack();

  }, (pgFlow, pgFlowBack) => {
    var connections = pgFlow.flow.connections;
    if (debug) console.log('### The pg has', connections.length, 'connections.');
    visitArray(pgFlow.flow.connections, (connection, connBack) => {
      printConnection(connection);
      connBack();

    }, pgFlowBack);

  }, callback);
}

var emptyAllQueues = (nifiApi, pgId, callback) => {
  visitProcessGroupFlows(nifiApi, pgId, (pg, pgBack) => {
    if (debug) console.log('### Got pg', pg.component.name, pg.id);
    pgBack();

  }, (pgFlow, pgFlowBack) => {
    var connections = pgFlow.flow.connections;
    if (debug) console.log('### The pg has', connections.length, 'connections.');
    visitArray(pgFlow.flow.connections, (connection, connBack) => {
      emptyQueue(nifiApi, connection, connBack);

    }, pgFlowBack);

  }, (err) => {
    if (err) return callback(err);

    nifiApi.getComponent('/flow/status', (err, res) => {
      if (res.controllerStatus.flowFilesQueued === 0) {
        callback();
      } else {
        console.log('There are some remaining flow-files', res.controllerStatus.queued);
        setTimeout(() => {
          emptyAllQueues(nifiApi, pgId, callback);
        }, 3000);
      }
    });
  });
}

var nifiApis = {};
var conf = yaml.safeLoad(fs.readFileSync('nifi-api-client-config.yml'));
Object.keys(conf).forEach((endpoint) => {
  nifiApis[endpoint] = new nifiApiClient.NiFiApi(conf[endpoint]);
});

var forEachEndpoint = (onEndpoint, callback) => {
  visitArray(Object.keys(nifiApis).map((endpoint) => {
    var nifiApi = nifiApis[endpoint];
    nifiApi.endpoint = endpoint;
    return nifiApi;
  }), onEndpoint, callback);
}

exports.apis = nifiApis;
exports.forEachEndpoint = forEachEndpoint;
exports.printAllQueues = printAllQueues;
exports.emptyAllQueues = emptyAllQueues;
exports.printConnection = printConnection;
exports.visitArray = visitArray;
