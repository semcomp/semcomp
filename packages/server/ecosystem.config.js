module.exports = {
  apps : [{
    script: "./build/index.js",
    instances : "1",
    node_args : '-r dotenv/config',
    env_production: {
      NODE_ENV: "production"
   },
  }]
};


