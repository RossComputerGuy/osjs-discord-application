const request = require('request');

const API_URL = 'https://discordapp.com/api/v6/';

module.exports = (core,proc) => ({
  init: async () => {
    core.app.get(proc.resource('/oauth2'),(req,res) => {
      res.send('Your login token is '+req.query.code+', please paste it in the Login dialog.');
    });
    core.app.use(proc.resource('/api/*'),(req,res) => {
      request({
        method: req.method,
        uri: API_URL+req.params['0']
      },(e,r,b) => {
        res.type('json').send(b);
      });
    });
  },
  start: () => {},
  destroy: () => {}
});
