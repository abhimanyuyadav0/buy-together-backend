module.exports = {
  apps: [
    {
      name: "buy-together-backend",
      script: "src/index.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
