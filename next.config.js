/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    httpAgentOptions: {
        rejectUnauthorized: false,
    },
};

module.exports = nextConfig;
