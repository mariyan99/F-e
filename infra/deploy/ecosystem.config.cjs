/**
 * PM2 fallback: used only when the host has neither Docker nor systemd.
 * systemd is preferred — it restarts on boot without a separate agent.
 */
module.exports = {
  apps: [
    {
      name: "fabrizia-backend",
      cwd: "/srv/fabrizia/apps/backend",
      script: ".medusa/server/index.js",
      instances: 1,
      autorestart: true,
      max_restarts: 0, // never stop trying
      env: { NODE_ENV: "production" },
    },
    {
      name: "fabrizia-storefront",
      cwd: "/srv/fabrizia/apps/storefront",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 8000",
      instances: 1,
      autorestart: true,
      max_restarts: 0,
      env: { NODE_ENV: "production" },
    },
  ],
};
