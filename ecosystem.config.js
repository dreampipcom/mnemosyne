require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'LetsHero-Server',
      script: 'server.js',

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: process.env.INSTANCES,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G'
    }
  ]
};
