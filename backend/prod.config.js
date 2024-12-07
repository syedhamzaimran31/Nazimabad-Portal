module.exports = {
    apps: [
        {
            name: 'community-app',
            script: 'dist/main.js',
            instances: 'max',
            exec_mode: 'cluster',
            watch: true,
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};