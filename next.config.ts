import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // --- TAMBAHKAN BLOK INI ---
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'w302ieewdugquuzl.public.blob.vercel-storage.com', // <-- Ganti dengan hostname Vercel Blob kamu
        port: '',
        pathname: '/**',
      },
    ],
  },
  // -------------------------
};

export default nextConfig;