/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // ده أهم سطر لـ static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,     // عشان الصور تشتغل بدون optimization server-side
  },
}

export default nextConfig
