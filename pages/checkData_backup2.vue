<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import config from '@/config';
import Swal from 'sweetalert2';

definePageMeta({
  layout: 'admin',
});

// กำหนด state สำหรับเก็บข้อมูล
const missingFiles = ref([]); // ไฟล์ที่ยังไม่ได้ลงทะเบียน
const registeredFiles = ref([]); // ไฟล์ที่ลงทะเบียนแล้ว (พร้อมชื่อผู้ใช้)
const totalFiles = ref(0); // จำนวนไฟล์ทั้งหมด
const missingFilesCount = ref(0); // จำนวนไฟล์ที่ไม่พบในฐานข้อมูล
const isLoading = ref(false);
const errorMessage = ref('');
const showModal = ref(false);
const selectedFile = ref('');
const userName = ref('');

// State สำหรับ Pagination ของไฟล์ที่ยังไม่ได้ลงทะเบียน
const currentPageMissing = ref(1); // หน้าปัจจุบันสำหรับไฟล์ที่ยังไม่ได้ลงทะเบียน
const itemsPerPageMissing = ref(5); // จำนวนรายการต่อหน้าสำหรับไฟล์ที่ยังไม่ได้ลงทะเบียน

// State สำหรับ Pagination ของไฟล์ที่ลงทะเบียนแล้ว
const currentPageRegistered = ref(1); // หน้าปัจจุบันสำหรับไฟล์ที่ลงทะเบียนแล้ว
const itemsPerPageRegistered = ref(5); // จำนวนรายการต่อหน้าสำหรับไฟล์ที่ลงทะเบียนแล้ว

// State สำหรับ Toggle
const showRegisteredFiles = ref(false); // แสดงไฟล์ที่ลงทะเบียนแล้ว

// คำนวณรายการที่แสดงในหน้าปัจจุบันสำหรับไฟล์ที่ยังไม่ได้ลงทะเบียน
const paginatedMissingFiles = computed(() => {
  const start = (currentPageMissing.value - 1) * itemsPerPageMissing.value;
  const end = start + itemsPerPageMissing.value;
  return missingFiles.value.slice(start, end);
});

// คำนวณรายการที่แสดงในหน้าปัจจุบันสำหรับไฟล์ที่ลงทะเบียนแล้ว
const paginatedRegisteredFiles = computed(() => {
  const start = (currentPageRegistered.value - 1) * itemsPerPageRegistered.value;
  const end = start + itemsPerPageRegistered.value;
  return registeredFiles.value.slice(start, end);
});

// คำนวณจำนวนหน้าทั้งหมดสำหรับไฟล์ที่ยังไม่ได้ลงทะเบียน
const totalPagesMissing = computed(() => {
  return Math.ceil(missingFiles.value.length / itemsPerPageMissing.value);
});

// คำนวณจำนวนหน้าทั้งหมดสำหรับไฟล์ที่ลงทะเบียนแล้ว
const totalPagesRegistered = computed(() => {
  return Math.ceil(registeredFiles.value.length / itemsPerPageRegistered.value);
});

// ฟังก์ชันเปลี่ยนหน้าสำหรับไฟล์ที่ยังไม่ได้ลงทะเบียน
const goToPageMissing = (page) => {
  if (page >= 1 && page <= totalPagesMissing.value) {
    currentPageMissing.value = page;
  }
};

// ฟังก์ชันเปลี่ยนหน้าสำหรับไฟล์ที่ลงทะเบียนแล้ว
const goToPageRegistered = (page) => {
  if (page >= 1 && page <= totalPagesRegistered.value) {
    currentPageRegistered.value = page;
  }
};

// ฟังก์ชันเรียก API เพื่อดึงข้อมูล
const fetchFiles = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.get(`${config.apiServer}/api/check-missing-documents`);
    if (response.data.success) {
      missingFiles.value = response.data.missing_files;
      registeredFiles.value = response.data.registered_files; // ข้อมูลชื่อผู้ใช้ที่ลงทะเบียน
      totalFiles.value = response.data.total_files;
      missingFilesCount.value = response.data.missing_files_count;
    } else {
      errorMessage.value = 'ไม่สามารถดึงข้อมูลได้';
    }
  } catch (error) {
    errorMessage.value = 'เกิดข้อผิดพลาดในการดึงข้อมูล';
    console.error('Error fetching files:', error);
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
        await fetchFiles(); // รีเฟรชรายการไฟล์หลังจากลบ
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

// ฟังก์ชันลบไฟล์ทั้งหมด
const deleteAllFiles = async () => {
  const { value: password } = await Swal.fire({
    title: 'ยืนยันการลบไฟล์ทั้งหมด',
    text: 'กรุณากรอกรหัสผ่านของ admin เพื่อดำเนินการลบไฟล์ทั้งหมด',
    input: 'password',
    inputPlaceholder: 'กรอกรหัสผ่าน',
    showCancelButton: true,
    confirmButtonText: 'ลบไฟล์ทั้งหมด',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    inputValidator: (value) => {
      if (!value) {
        return 'กรุณากรอกรหัสผ่าน';
      }
    },
  });

  if (password) {
    try {
      const response = await axios.post(`${config.apiServer}/api/delete-all-files`, {
        password: password, // ส่งรหัสผ่านไปตรวจสอบที่ backend
      });

      if (response.data.success) {
        await Swal.fire({
          title: 'สำเร็จ!',
          text: response.data.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        });
        await fetchFiles(); // รีเฟรชรายการไฟล์หลังจากลบ
      } else {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: response.data.message || 'รหัสผ่านไม่ถูกต้อง',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบไฟล์ทั้งหมด',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      console.error('Error deleting all files:', error);
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
      await fetchFiles(); // รีเฟรชรายการไฟล์หลังจากลงทะเบียน
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
  fetchFiles();
});
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-6">ตรวจสอบข้อมูล</h1>

    <!-- ปุ่มลบไฟล์ทั้งหมด -->
    <div class="flex justify-end mb-6">
      <button
        @click="deleteAllFiles"
        class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
      >
        ลบไฟล์ทั้งหมด
      </button>
    </div>

    <!-- แสดงจำนวนไฟล์ทั้งหมดและไฟล์ที่ไม่พบ -->
    <div class="space-y-4 mb-6">
      <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        พบไฟล์ PDF ทั้งหมด: {{ totalFiles }} ไฟล์
      </div>
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        พบไฟล์ PDF ที่ไม่ได้ลงทะเบียนผู้ใช้งาน: {{ missingFilesCount }} ไฟล์
      </div>
    </div>

    <!-- แถบ Toggle -->
    <div class="flex justify-center mb-6">
      <button
        @click="showRegisteredFiles = false"
        :class="{
          'bg-blue-500 text-white': !showRegisteredFiles,
          'bg-gray-200 text-gray-700': showRegisteredFiles,
        }"
        class="px-4 py-2 rounded-l-lg transition-colors"
      >
        ไฟล์ที่ยังไม่ได้ลงทะเบียน
      </button>
      <button
        @click="showRegisteredFiles = true"
        :class="{
          'bg-blue-500 text-white': showRegisteredFiles,
          'bg-gray-200 text-gray-700': !showRegisteredFiles,
        }"
        class="px-4 py-2 rounded-r-lg transition-colors"
      >
        ไฟล์ที่ลงทะเบียนแล้ว
      </button>
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
    <div v-if="(showRegisteredFiles ? paginatedRegisteredFiles : paginatedMissingFiles).length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ชื่อไฟล์
            </th>
            <th v-if="showRegisteredFiles" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ชื่อผู้ใช้ที่ลงทะเบียน
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              การดำเนินการ
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="file in (showRegisteredFiles ? paginatedRegisteredFiles : paginatedMissingFiles)" :key="file.file_name || file" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ file.file_name || file }}.pdf
            </td>
            <td v-if="showRegisteredFiles" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ file.user_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
              <button
                v-if="!showRegisteredFiles"
                @click="openRegisterModal(file)"
                class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                ลงทะเบียน
              </button>
              <button
                @click="deleteFile(file.file_name || file)"
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
          @click="showRegisteredFiles ? goToPageRegistered(currentPageRegistered - 1) : goToPageMissing(currentPageMissing - 1)"
          :disabled="showRegisteredFiles ? currentPageRegistered === 1 : currentPageMissing === 1"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="text-sm text-gray-700">
          หน้า {{ showRegisteredFiles ? currentPageRegistered : currentPageMissing }} จาก {{ showRegisteredFiles ? totalPagesRegistered : totalPagesMissing }}
        </span>
        <button
          @click="showRegisteredFiles ? goToPageRegistered(currentPageRegistered + 1) : goToPageMissing(currentPageMissing + 1)"
          :disabled="showRegisteredFiles ? currentPageRegistered === totalPagesRegistered : currentPageMissing === totalPagesMissing"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <!-- แสดงข้อความหากไม่มีไฟล์ -->
    <div v-else-if="!isLoading" class="text-center text-gray-600">
      ไม่พบไฟล์ PDF ที่{{ showRegisteredFiles ? 'ลงทะเบียนแล้ว' : 'ยังไม่ได้ลงทะเบียน' }}
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