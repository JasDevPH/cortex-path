import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cortexpath/shared", "@cortexpath/database"],
  reactStrictMode: true,

  // Prevent Next.js from bundling packages that use native modules / WASM
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],

  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
