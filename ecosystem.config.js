module.exports = {
  apps : [{
    name: "server",
    script: "./src/server.js",
    exec_mode: "fork",
    env_production: {
       NODE_ENV: "production"
    },
    env_development: {
       NODE_ENV: "development"
    }
  }]
}