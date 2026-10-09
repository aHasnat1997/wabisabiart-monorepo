import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: "@svgr/webpack", options: { icon: true } }],
    });
    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://api.wabisabiart.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
