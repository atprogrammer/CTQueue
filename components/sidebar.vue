<script setup>
import { ref } from 'vue' // นำเข้าฟังก์ชัน ref เพื่อสร้างตัวแปรที่มีค่าสามารถเปลี่ยนแปลงได้

import Swal from 'sweetalert2'; // นำเข้าไลบรารี SweetAlert2 สำหรับแสดงป๊อปอัพยืนยัน
import config from '@/config'; // นำเข้าไฟล์ config ซึ่งอาจมีข้อมูลเกี่ยวกับแอปพลิเคชัน เช่น ชื่อของ Token

const activeMenu = ref(''); // สร้างตัวแปร ref ชื่อ activeMenu เพื่อเก็บชื่อเมนูที่ถูกเลือกไว้

const toggleMenu = (menu) => {
    activeMenu.value = menu; // ฟังก์ชัน toggleMenu รับค่าเมนูเป็นพารามิเตอร์ แล้วอัปเดตค่า activeMenu 
}

const signOut = async () => {
    const button = await Swal.fire({ // ใช้ SweetAlert2 เพื่อแสดงป๊อปอัพยืนยันการออกจากระบบ
        icon: 'warning', // สร้างป๊อปอัพในรูปแบบ warning
        title: 'ยืนยันการออกจากระบบ', //ข้อความบนป๊อปอัพ
        showCancelButton: true, // แสดงปุ่มยกเลิก 
        showConfirmButton: true, // แสดงปุ่มตกลง
    });

    if (button.isConfirmed) { // ตรวจสอบว่าผู้ใช้กดปุ่มตกลง
        localStorage.removeItem(config.token); // ลบ Token ออกจาก localStorage
        // localStorage.removeItem('nuxt_erp_user_id'); // ลบข้อมูล user ID ออกจาก localStorage
        // localStorage.removeItem('nuxt_erp_national_id')
        //localStorage.setItem('token', token);
            localStorage.removeItem('national_id');
            localStorage.removeItem('name_id');
            localStorage.removeItem('level_id');
        navigateTo('/'); // แลกเปลี่ยนไปหน้า home page (หรือหน้าอื่นๆ)
    }


}

const name = ref('');
const level = ref('');

onMounted(() => {
    name.value = localStorage.getItem('name_id'); // รับค่า name จาก localStorage
    level.value = localStorage.getItem('level_id');
});

</script>



<template>
    <div>
        <div class="sidebar-title">Tax KKPHO</div>
        <div class="sidebar-avatar">
            <!-- <img src="https://cdn.pixabay.com/photo/2024/11/07/03/12/lizard-9179598_1280.jpg" alt="avatar"
                class="w-10 h-10 rounded-full mx-auto"> -->
            <img src="/images/logo.png" alt="avatar" class="w-10 h-10 rounded-full mx-auto">

            <div class="text-center text-wite text-sm mt-3">ผู้ใช้งานระบบ : <br>
                {{ name }}

            </div>
            <div class="text-center mt-3">
                <button class="btn btn-danger text-xs block w-full" @click="signOut">
                    <i class="fa fa-sign-out mr-1"></i>
                    ออกจากระบบ
                </button>
                <!-- <button class="btn btn-primary text-xs block w-full mt-2" @click="navigateTo('/userProfile')">
                    <i class="fa fa-user mr-1"></i>
                    Profile
                </button> -->
            </div>
        </div>
        <div class="sidebar-menu">
            <NuxtLink v-if="level == 'user'" class="nav-link" :class="{ 'active': activeMenu === 'userLoad' }"
                to="/userLoad" @click="toggleMenu('userLoad')">
                <i class="fa-solid fa-file"></i>
                โหลดเอกสาร
            </NuxtLink>
            <NuxtLink v-if="level == 'admin'" class="nav-link" :class="{ 'active': activeMenu === 'userLoad' }"
                to="http://import-tax.kkpho.go.th:8501/" target="_blank" @click="toggleMenu('userLoad')">
                <i class="fa-solid fa-file"></i>
                แปลงชื่อไฟล์ข้อมูล
            </NuxtLink>
            <NuxtLink v-if="level == 'admin'" class="nav-link" :class="{ 'active': activeMenu === 'upload' }"
                to="/upload" @click="toggleMenu('upload')">
                <i class="fa-solid fa-upload"></i>
                อัพโหลดไฟล์ข้อมูล
            </NuxtLink>
            <NuxtLink v-if="level == 'admin'" class="nav-link" :class="{ 'active': activeMenu === 'checkData' }"
                to="/checkData" @click="toggleMenu('checkData')">
                <i class="fa-solid fa-check-to-slot"></i>
                ตรวจสอบข้อมูล
            </NuxtLink>

            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'changePassword' }" to="/change-password"
                @click="toggleMenu('changePassword')">
                <i class="fa fa-key"></i>
                เปลี่ยนรหัสผ่าน
            </NuxtLink>
            <!-- <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'production' }" to="/production"
                @click="toggleMenu('production')">
                <i class="fa fa-copy"></i>
                บันทึกการผลิต
            </NuxtLink> -->

            <!-- <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'product' }" to="/product"
                @click="toggleMenu('product')">
                <i class="fa fa-box"></i>
                สินค้า
            </NuxtLink>
            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'material' }" to="/material"
                @click="toggleMenu('material')">
                <i class="fa fa-cogs"></i>
                วัสดุ,ส่วนผสม
            </NuxtLink>
            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'packaging' }" to="/packaging"
                @click="toggleMenu('packaging')">
                <i class="fa fa-box"></i>
                บรรจุภัณฑ์
            </NuxtLink>
            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'formula' }" to="/formula"
                @click="toggleMenu('formula')">
                <i class="fa fa-receipt"></i>
                สูตรสินค้า
            </NuxtLink>
            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'productionPlan' }" to="/productionPlan"
                @click="toggleMenu('productionPlan')">
                <i class="fa fa-receipt"></i>
                แผนการผลิต
            </NuxtLink>
            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'report' }" to="/report"
                @click="toggleMenu('report')">
                <i class="fa fa-chart-bar"></i>
                รายงานการผลิต
            </NuxtLink>
            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'report' }" to="/report"
                @click="toggleMenu('report')">
                <i class="fa fa-dollar-sign"></i>
                บัญชีต้นทุน
            </NuxtLink>
            <NuxtLink class="nav-link" :class="{ 'active': activeMenu === 'users' }" to="/users"
                @click="toggleMenu('users')">
                <i class="fa fa-users"></i>
                ผู้ใช้งาน
            </NuxtLink> -->
        </div>
    </div>
</template>