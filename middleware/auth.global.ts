// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
        //const publicPages = [ '/contact','/']; // หน้าที่ยกเว้น
        const token = localStorage.getItem('national_id'); // ใช้ได้เฉพาะในฝั่งไคลเอนต์

        // หน้าที่ยกเว้น
        const publicPages = [
            '/contact',
            '/upload/',
            '/'
        ];
        
        if (!token && !publicPages.some(page => to.fullPath.startsWith(page))) {
            return navigateTo('/');
        }
        


        // ถ้าไม่มี token และหน้าไม่อยู่ใน publicPages ให้เปลี่ยนไป /login
        if (!token && !publicPages.includes(to.path)) {
            return navigateTo('/');
        }


         // หากผู้ใช้ล็อกอินแล้ว แต่พยายามเข้าถึง /login ให้เปลี่ยนไปหน้าแรก
         if (token && to.path === '/') {
            return navigateTo('/home');
        }
    }
});
