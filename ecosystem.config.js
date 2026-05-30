module.exports = {
  apps: [
    {
      name: "shopdrop-api",
      cwd: "./server",
      script: "src/index.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
    {
      name: "shopdrop-web",
      cwd: "./client",
      script: ".next/standalone/server.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
