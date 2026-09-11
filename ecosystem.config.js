module.exports = {
  apps: [
    {
      name: "secret-notez",          // Name of your PM2 app
      script: "scripts/deploy-and-serve.sh",
      interpreter: "none",
      cwd: "/home/admin/apps/secretnotes-mobile",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
