/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/lab/consistent-hashing",
        destination: "/lab/hashing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
