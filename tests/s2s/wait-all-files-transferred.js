var nifiUtils = require('../../lib/nifi-api-utils.js');

var queuesShouldBeEmpty = {
  "s2s/raw/drain-queue": "01581043-d944-18e1-b69e-d838e445e5b5",
  "s2s/raw/push-queue/sp": "49bdc0df-0158-1000-715b-dd1674cd4ff2",
  "s2s/raw/push-queue/ss": "49b999fd-0158-1000-4426-10fcdfa49dff",
  "s2s/raw/push-queue/cp": "49bfe296-0158-1000-0f0f-25f1e788ab01",
  "s2s/raw/push-queue/cs": "49ee9266-0158-1000-131c-80aef61343eb",
  "s2s/http/drain-queue": "01581044-d944-18e1-1546-ccc0cd10aaba",
  "s2s/http/push-queue/sp": "01581001-4fef-19ed-edea-767227f0fad1",
  "s2s/http/push-queue/ss": "01581003-4fef-19ed-a7b4-25be5b17d8e0",
  "s2s/http/push-queue/cp": "01581004-4fef-19ed-5aae-13a347475227",
  "s2s/http/push-queue/cs": "01581002-4fef-19ed-764b-b8a5d276b69f"
};

var timeoutMillis = 300000;
var queueCheckInterval = 10000;

nifiUtils.forEachEndpoint((nifiApi, nifiApiBack) => {

  var queues = Object.keys(queuesShouldBeEmpty).map((name) => {
    return {name: name, id: queuesShouldBeEmpty[name]};
  });

  var started = new Date().getTime();
  var finishedQueueIds = {};
  var waitQueue = () => {
    nifiUtils.visitArray(queues, (queue, queueBack) => {
      var connectionId = queue.id;
      nifiApi.getComponent('/connections/' + connectionId, (err, connection) => {
        if (err) return queueBack(err);
  
        if (connection.status.aggregateSnapshot.queuedCount == 0) {
          finishedQueueIds[queue.id] = true;
        } else {
          nifiUtils.printConnection(connection);
          delete finishedQueueIds[queue.id];
        }
  
        queueBack();
      });
    }, (err) => {
      if(err) return nifiApiBack(err);

      var remainingQueues = queues.length - Object.keys(finishedQueueIds).length;
      if (remainingQueues === 0) return nifiApiBack();

      var elapsed = new Date().getTime() - started;
      console.log('There are', remainingQueues, 'remaining queues...', nifiApi.endpoint, elapsed, 'ms elapsed.');

      if (elapsed > timeoutMillis) return nifiApiBack(new Error('Timeout for waiting queues to become empty. ' + nifiApi.endpoint));
      
      setTimeout(waitQueue, queueCheckInterval);
    });
  }
  waitQueue();

}, (err) => {
  if (err) return console.log(err);

  console.log('All queues became empty, finished!');
});
