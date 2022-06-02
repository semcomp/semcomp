module.exports = {
  apps : [{
    script: "./build/index.js",
    instances : "max",
    node_args : '-r dotenv/config',
    env_production: {
      NODE_ENV: "production"
   },
  }]
};


