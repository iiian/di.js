const firstService  = require('./first-service');
const secondService = require('./second-service');
const app           = require('./app');
const di            = require('../dist');

const $injector     = di.$injector;
const $context      = di.$context;

$injector.config(firstService);
$injector.config(secondService);
$context .registerRoot(app);
$context .run();