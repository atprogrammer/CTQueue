// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  devServer: {
    host: '0.0.0.0', // เปิดให้เข้าถึงจากเครื่องอื่น
    port: 8000,      // (พอร์ตที่ต้องการ)
  },
  app: {
    baseURL: '/',  // กำหนด base path เป็น /app1
  },
  nitro: {
    publicAssets: [
      {
        baseURL: '/documents', // ชื่อ path สำหรับไฟล์เอกสาร
        dir: 'static/documents', // โฟลเดอร์ที่เก็บไฟล์เอกสารในโปรเจกต์
      },
    ],
  },
});
