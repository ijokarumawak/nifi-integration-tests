var nifiUtils = require('./nifi-api-utils.js');

var trace = false;
var debug = true;

nifiUtils.forEachEndpoint((nifiApi, nifiApiBack) => {
  nifiUtils.emptyAllQueues(nifiApi, 'root', nifiApiBack);
}, (err) => {
  if (err) return console.log(err);
  console.log('Finished emptying all queues.');
});
