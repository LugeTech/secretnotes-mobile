module.exports = {
  apps: [
    {
      name: "secret-notez",          // Name of your PM2 app
      script: "npx",                 // Use npx to run the serve command
      interpreter: "none",           // PM2 should not run this as a Node script
      args: "serve web-build -p 3002", // Serve the web-build directory on port 3000
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
