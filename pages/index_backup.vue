<script setup>
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '@/config';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const router = useRouter();



const handleSubmit = async () => {
    try {
        if (!username.value || !password.value) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'กรุณากรอกทั้ง username และรหัสผ่าน',
            });
            return;
        }

        const response = await axios.post(`${config.apiServer}/api/user/signIn`, {
            username: username.value,
            password: password.value,
        });

        if (response.status === 200) {
            const { token, id, nationalId, name, level } = response.data;

            localStorage.setItem('nuxt_erp_user_id', id);
            localStorage.setItem('nuxt_erp_national_id', nationalId);
            localStorage.setItem('name_id', name);
            localStorage.setItem('level_id', level);

            if (level === 'admin') {
                router.push('/home');
            } else {
                router.push('/userLoad');
            }
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'ชื่อผู้ใช้หรือรหัสผ่านผิด กรุณาตรวจสอบอีกครั้ง',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            });
        }
        console.error(error.message);
    }
};

</script>




<template>
    <!-- ส่วน template -->
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-t from-blue-900 to-blue-100">
        <!-- ส่วน login form -->
        <div class="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">

            <!-- Heading ของ Login Form -->
            <h2 class="text-3xl font-bold text-gray-900 text-center">
                ระบบหนังสือรับรอง <br> การหักภาษี ณ ที่จ่าย
            </h2>

            <!-- ฟอร์ม login -->
            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <!-- input Username -->
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <div>เลขบัตรประชาชน</div>
                        <input v-model="username" required class="form-control" placeholder="Username">
                    </div>

                    <!-- input Password -->
                    <div class="pt-5">
                        <div>รหัสผ่าน</div>
                        <input type="password" v-model="password" required class="form-control" placeholder="Password" />
                    </div>

                </div>

                <!-- ส่วน checkbox และ link forgot password -->
                <div class="flex items-center justify-between">
                    <div class="flex">
                        <input id="remember_me" type="checkbox"
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded">
                        <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
                    </div>

                    <div class="text-sm">
                        <a href="#" class="font-medium text-indigo-600 @hover: text-indigo-500">
                            ลืมรหัสผ่าน ?
                        </a>
                    </div>
                </div>


                <!-- button submit -->
                <div>
                    <button type="submit" class="btn-full">Sign In</button>
                </div>
            </form>
        </div>

    </div>
</template>