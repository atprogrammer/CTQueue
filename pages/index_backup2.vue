<script setup>
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '@/config';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const isAdminLogin = ref(false);
const isLoading = ref(false); // สถานะการโหลด
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

        isLoading.value = true; // เริ่มแสดง Progress Bar

        const endpoint = isAdminLogin.value ? '/api/admin/signIn' : '/api/user/signIn';

        const response = await axios.post(`${config.apiServer}${endpoint}`, {
            username: username.value,
            password: password.value,
        });

        if (response.status === 200) {
            const { token, id, name, level } = response.data;

            // บันทึก token ลงใน localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('national_id', id);
            localStorage.setItem('name_id', name);
            localStorage.setItem('level_id', level);

            // เปลี่ยนเส้นทางตามระดับผู้ใช้
            const targetRoute = level === 'admin' ? '/home' : '/userLoad';
            router.push(targetRoute);
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
    } finally {
        isLoading.value = false; // ซ่อน Progress Bar หลังประมวลผลเสร็จ
    }
};

const toggleLoginMode = () => {
    isAdminLogin.value = !isAdminLogin.value;
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

            <!-- Progress Bar -->
            <div v-if="isLoading" class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 animate-progress"></div>
            </div>

            <!-- ปุ่มสลับระหว่าง admin และ user -->
            <div class="flex justify-center mt-4">
                <button
                    @click="toggleLoginMode"
                    class="px-4 py-2 rounded-full transition-colors"
                    :class="{
                        'bg-blue-500 text-white': isAdminLogin,
                        'bg-gray-200 text-gray-700': !isAdminLogin,
                    }"
                >
                    {{ isAdminLogin ? 'Admin Login' : 'User Login' }}
                </button>
            </div>

            <!-- ฟอร์ม login -->
            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <!-- input Username -->
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <!-- เปลี่ยนข้อความตามโหมดการล็อกอิน -->
                        <div>{{ isAdminLogin ? 'ชื่อผู้ใช้ระบบ' : 'เลขบัตรประชาชน' }}</div>
                        <input v-model="username" required class="form-control" placeholder="Username">
                    </div>

                    <!-- input Password -->
                    <div class="pt-5">
                        <div>รหัสผ่าน</div>
                        <input type="password" v-model="password" required class="form-control" placeholder="Password" />
                    </div>
                </div>

                <!-- button submit -->
                <div>
                    <button type="submit" class="btn-full" :disabled="isLoading">เข้าสู่ระบบ</button>
                </div>
            </form>
            <footer class="bg-gray-700 text-white py-4 text-center">
    &copy;2567 : กลุ่มงานสุขภาพดิจิทัล สสจ.ขอนแก่น
  </footer>
        </div>
    </div>
</template>

<style scoped>
.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
}

.btn-full {
    width: 100%;
    padding: 0.75rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
}

.btn-full:hover {
    background-color: #2563eb;
}

.btn-full:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
}

.animate-progress {
    animation: progress-animation 2s infinite linear;
}

@keyframes progress-animation {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
}
</style>
