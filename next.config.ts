import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // --- BLOK INI DITAMBAHKAN ---
  // Ini memberi tahu Next.js bahwa gambar dari Vercel Blob aman
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // GANTI HOSTNAME INI DENGAN HOSTNAME VERCEL BLOB KAMU
        hostname: 'xxxxxxx.public.blob.vercel-storage.com', 
        port: '',
        pathname: '/**', // Izinkan semua gambar dari host ini
      },
    ],
  },
  // -------------------------
};

export default nextConfig;