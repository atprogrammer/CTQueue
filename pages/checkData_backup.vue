<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import config from '@/config';
import Swal from 'sweetalert2';

definePageMeta(
    {
        layout: 'admin',
    }
)

// กำหนด state สำหรับเก็บข้อมูล
const missingFiles = ref([]);
const totalFiles = ref(0); // จำนวนไฟล์ทั้งหมด
const missingFilesCount = ref(0); // จำนวนไฟล์ที่ไม่พบในฐานข้อมูล
const isLoading = ref(false);
const errorMessage = ref('');
const showModal = ref(false);
const selectedFile = ref('');
const userName = ref('');

// State สำหรับ Pagination
const currentPage = ref(1); // หน้าปัจจุบัน
const itemsPerPage = ref(5); // จำนวนรายการต่อหน้า

// คำนวณรายการที่แสดงในหน้าปัจจุบัน
const paginatedFiles = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return missingFiles.value.slice(start, end);
});

// คำนวณจำนวนหน้าทั้งหมด
const totalPages = computed(() => {
    return Math.ceil(missingFiles.value.length / itemsPerPage.value);
});

// ฟังก์ชันเปลี่ยนหน้า
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

// ฟังก์ชันเรียก API เพื่อดึงข้อมูล
const fetchMissingDocuments = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
        const response = await axios.get(`${config.apiServer}/api/check-missing-documents`);
        if (response.data.success) {
            missingFiles.value = response.data.missing_files;
            totalFiles.value = response.data.total_files; // รับจำนวนไฟล์ทั้งหมด
            missingFilesCount.value = response.data.missing_files_count; // รับจำนวนไฟล์ที่ไม่พบ
        } else {
            errorMessage.value = 'ไม่สามารถดึงข้อมูลได้';
        }
    } catch (error) {
        errorMessage.value = 'เกิดข้อผิดพลาดในการดึงข้อมูล';
        console.error('Error fetching missing documents:', error);
    } finally {
        isLoading.value = false;
    }
};

// ฟังก์ชันลบไฟล์
const deleteFile = async (fileName) => {
    const result = await Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: `คุณต้องการลบไฟล์ ${fileName}.pdf ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบไฟล์',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
        try {
            const response = await axios.delete(`${config.apiServer}/api/delete-missing-file/${fileName}`);
            if (response.data.success) {
                await Swal.fire({
                    title: 'สำเร็จ!',
                    text: response.data.message,
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                });
                // รีเฟรชรายการไฟล์หลังจากลบ
                await fetchMissingDocuments();
            }
        } catch (error) {
            await Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'เกิดข้อผิดพลาดในการลบไฟล์',
                icon: 'error',
                confirmButtonText: 'ตกลง',
            });
            console.error('Error deleting file:', error);
        }
    }
};

// ฟังก์ชันเปิด Modal สำหรับลงทะเบียนไฟล์
const openRegisterModal = (fileName) => {
    selectedFile.value = fileName;
    showModal.value = true;
};

// ฟังก์ชันปิด Modal
const closeModal = () => {
    showModal.value = false;
    selectedFile.value = '';
    userName.value = '';
};

// ฟังก์ชันลงทะเบียนไฟล์
const registerFile = async () => {
    if (!userName.value) {
        await Swal.fire({
            title: 'กรุณากรอกชื่อผู้ใช้',
            text: 'คุณต้องกรอกชื่อผู้ใช้ก่อนดำเนินการต่อ',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
        });
        return;
    }

    try {
        const response = await axios.post(`${config.apiServer}/api/register-missing-file`, {
            file_name: selectedFile.value,
            user_name: userName.value,
        });

        if (response.data.success) {
            await Swal.fire({
                title: 'สำเร็จ!',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'ตกลง',
            });
            closeModal();
            await fetchMissingDocuments(); // รีเฟรชรายการไฟล์หลังจากลงทะเบียน
        }
    } catch (error) {
        await Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: 'เกิดข้อผิดพลาดในการลงทะเบียนไฟล์',
            icon: 'error',
            confirmButtonText: 'ตกลง',
        });
        console.error('Error registering file:', error);
    }
};

// เรียก API เมื่อโหลดหน้า
onMounted(() => {
    fetchMissingDocuments();
});
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold mb-6">ไฟล์ PDF ที่ไม่มีในฐานข้อมูล</h1>

        <!-- แสดงจำนวนไฟล์ทั้งหมดและไฟล์ที่ไม่พบ -->
        <div class="space-y-4 mb-6">
            <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                พบไฟล์ PDF ทั้งหมด: {{ totalFiles }} ไฟล์
            </div>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                พบไฟล์ PDF ที่ไม่เชื่อมโยงกับผู้ใช้งาน: {{ missingFilesCount }} ไฟล์
            </div>
        </div>

        <!-- แสดงข้อความโหลด -->
        <div v-if="isLoading" class="text-center text-gray-600">
            กำลังโหลดข้อมูล...
        </div>

        <!-- แสดงข้อผิดพลาด -->
        <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {{ errorMessage }}
        </div>

        <!-- แสดงรายการไฟล์ PDF -->
        <div v-if="missingFiles.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
            <table class="min-w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ชื่อไฟล์
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            การดำเนินการ
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="file in paginatedFiles" :key="file" class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {{ file }}.pdf
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                                @click="openRegisterModal(file)"
                                class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                                ลงทะเบียน
                            </button>
                            <button
                                @click="deleteFile(file)"
                                class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                ลบไฟล์
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- ปุ่มเปลี่ยนหน้า -->
            <div class="flex justify-between items-center p-4 border-t border-gray-200">
                <button
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span class="text-sm text-gray-700">
                    หน้า {{ currentPage }} จาก {{ totalPages }}
                </span>
                <button
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>

        <!-- แสดงข้อความหากไม่มีไฟล์ -->
        <div v-else-if="!isLoading" class="text-center text-gray-600">
            ไม่พบไฟล์ PDF ที่ไม่มีในฐานข้อมูล
        </div>

        <!-- Modal สำหรับลงทะเบียนไฟล์ -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 class="text-xl font-bold mb-4">ลงทะเบียนไฟล์ {{ selectedFile }}.pdf</h2>
                <form @submit.prevent="registerFile">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
                        <input
                            v-model="userName"
                            type="text"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="กรอกชื่อผู้ใช้"
                            required
                        />
                    </div>
                    <div class="flex justify-end space-x-2">
                        <button
                            type="button"
                            @click="closeModal"
                            class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>