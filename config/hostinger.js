module.exports = {
    apps: [
      {
        name: 'amigo-invisible',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        instances: 'max',
        exec_mode: 'cluster',
        watch: false,
        env: {
          PORT: 3000,
          NODE_ENV: 'production',
        },
        env_production: {
          PORT: 3000,
          NODE_ENV: 'production',
        },
      },
      {
        name: 'amigo-invisible-limpieza',
        script: 'node',
        args: './scripts/dist/limpieza.js',
        instances: 1,
        exec_mode: 'fork',
        cron_restart: '0 3 * * *', // Ejecuta todos los días a las 3 AM
        watch: false,
        autorestart: false,
        env: {
          NODE_ENV: 'production',
        },
      },
      {
        name: 'amigo-invisible-recordatorios',
        script: 'node',
        args: './scripts/dist/recordatorios.js',
        instances: 1,
        exec_mode: 'fork',
        cron_restart: '0 9 * * *', // Ejecuta todos los días a las 9 AM
        watch: false,
        autorestart: false,
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };