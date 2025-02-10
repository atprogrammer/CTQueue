<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import axios from 'axios'; // นำเข้า axios
import config from '@/config';

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showOldPassword = ref(false); // สถานะแสดงรหัสผ่านเก่า
const showNewPassword = ref(false); // สถานะแสดงรหัสผ่านใหม่
const showConfirmPassword = ref(false); // สถานะแสดงยืนยันรหัสผ่าน

definePageMeta(
    {
        layout: 'admin',
    }
)

const changePassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        Swal.fire({
            icon: 'error',
            title: 'รหัสผ่านไม่ตรงกัน',
            text: 'กรุณาตรวจสอบรหัสผ่านใหม่และยืนยันรหัสผ่าน',
        });
        return;
    }

    try {
        const username = localStorage.getItem('national_id'); // ดึง username จาก localStorage
        const level = localStorage.getItem('level_id'); // ดึง level จาก localStorage

        // ใช้ axios แทน fetch
        const response = await axios.post(
            `${config.apiServer}/api/changepassword`, // ไม่มี query parameters
            {
                old_password: oldPassword.value,
                new_password: newPassword.value,
                username: username,
                level: level,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // ตรวจสอบ response
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'เปลี่ยนรหัสผ่านสำเร็จ',
                text: response.data.message,
            });
        }
    } catch (error) {
        // จัดการข้อผิดพลาด
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.response?.data?.detail || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        });
    }
};
</script>

<template>
    <div class="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg transform transition-all hover:shadow-2xl">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">แก้ไขรหัสผ่าน</h1>
        <form @submit.prevent="changePassword" class="space-y-6">
            <!-- รหัสผ่านเก่า -->
            <div>
                <label for="oldPassword" class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านเก่า</label>
                <div class="relative">
                    <input
                        :type="showOldPassword ? 'text' : 'password'"
                        id="oldPassword"
                        v-model="oldPassword"
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 pr-10"
                        required
                    />
                    <button
                        type="button"
                        @click="showOldPassword = !showOldPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                        <i :class="showOldPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-500 hover:text-indigo-500"></i>
                    </button>
                </div>
            </div>

            <!-- รหัสผ่านใหม่ -->
            <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านใหม่</label>
                <div class="relative">
                    <input
                        :type="showNewPassword ? 'text' : 'password'"
                        id="newPassword"
                        v-model="newPassword"
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 pr-10"
                        required
                    />
                    <button
                        type="button"
                        @click="showNewPassword = !showNewPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                        <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-500 hover:text-indigo-500"></i>
                    </button>
                </div>
            </div>

            <!-- ยืนยันรหัสผ่านใหม่ -->
            <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                <div class="relative">
                    <input
                        :type="showConfirmPassword ? 'text' : 'password'"
                        id="confirmPassword"
                        v-model="confirmPassword"
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 pr-10"
                        required
                    />
                    <button
                        type="button"
                        @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-500 hover:text-indigo-500"></i>
                    </button>
                </div>
            </div>

            <!-- ปุ่มเปลี่ยนรหัสผ่าน -->
            <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 transform hover:scale-105"
            >
                เปลี่ยนรหัสผ่าน
            </button>
        </form>
    </div>
</template>