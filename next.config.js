/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Nodemailer é usado apenas em rotas de servidor (Node runtime).
  serverExternalPackages: ["nodemailer"],
};

module.exports = nextConfig;
