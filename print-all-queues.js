var nifiUtils = require('./lib/nifi-api-utils.js');

var trace = false;
var debug = true;

nifiUtils.forEachEndpoint((nifiApi, nifiApiBack) => {
  console.log('got an API', nifiApi.endpoint);
  nifiUtils.printAllQueues(nifiApi, 'root', nifiApiBack);
}, (err) => {
  if (err) return console.log(err);
});
