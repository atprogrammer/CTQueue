<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '@/config';

definePageMeta({ layout: 'admin' });

const pdfUrl = ref(null); // สำหรับเก็บ URL ของไฟล์ที่อัพโหลด
const fileInput = ref(null); // สำหรับอ้างอิงถึง input file
const filesUploaded = ref(0); // สำหรับเก็บจำนวนไฟล์ที่อัพโหลด
const isLoading = ref(false); // สำหรับตรวจสอบสถานะการโหลด

// ฟังก์ชันที่เรียกใช้เมื่อกดปุ่มนำเข้าไฟล์
const LoadFile = async () => {
  const file = fileInput.value.files[0];
  if (!file) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณาเลือกไฟล์ ZIP',
      text: 'กรุณาเลือกไฟล์ ZIP ที่ต้องการอัพโหลด',
    });
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    isLoading.value = true; // เริ่มแสดงหน้าโหลด
    const response = await axios.post(`${config.apiServer}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success) {
      pdfUrl.value = response.data.pdfUrl;
      filesUploaded.value = response.data.filesUploaded;
      Swal.fire({
        icon: 'success',
        title: 'อัพโหลดไฟล์สำเร็จ',
        text: 'ไฟล์ ZIP ถูกอัพโหลดและแปลงเป็น PDF เรียบร้อยแล้ว',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: response.data.message || 'ไม่สามารถอัพโหลดไฟล์ได้',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาดในการอัพโหลด',
      text: error.response?.data?.message || error.message,
    });
  } finally {
    isLoading.value = false; // ซ่อนหน้าโหลด
  }
};

// ฟังก์ชันเพื่อเปิด dialog ของ input file
const browseFile = () => {
  fileInput.value.click();
};
</script>

<template>
  <div class="title text-center">นำเข้าไฟล์เอกสาร</div>

  <!-- Spinner ระหว่างโหลด -->
  <div v-if="isLoading" class="fixed inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 z-50">
    <div class="loader animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-16 h-16 mb-4"></div>
    <p class="text-white text-lg font-semibold">กำลังอัพโหลดไฟล์...</p>
  </div>

  <!-- ส่วนอัพโหลด -->
  <div v-if="!pdfUrl && !isLoading" class="p-4 flex justify-center items-center">
    <button 
      class="btn bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
      @click="browseFile"
    >
      <i class="fa-solid fa-download"></i>
      เลือกไฟล์ ZIP
    </button>
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept=".zip"
      @change="LoadFile" 
    />
  </div>

  <!-- แสดงผลลัพธ์ -->
  <div v-if="pdfUrl && !isLoading" class="p-4 flex flex-col items-center">
    <p class="text-green-500 text-xl">ไฟล์ PDF ของคุณพร้อมใช้งาน</p>
    <p class="text-blue-500 text-lg mt-2">จำนวนไฟล์ที่อัปโหลด: {{ filesUploaded }} ไฟล์</p>
  </div>

  <div v-if="!pdfUrl && !isLoading" class="p-4 flex justify-center items-center text-red-500 text-xl">
    * หมายเหตุ ไฟล์ที่นำเข้าคือไฟล์ที่ได้ทำการแปลงชื่อไฟล์ผ่านโปรแกรมแปลงชื่อไฟล์หนังสือรับรองหักภาษี ณ ที่จ่าย มาเรียบร้อยแล้ว
    และได้ทำการบีบอัดในรูปแบบ zip ไฟล์
  </div>
</template>

<style scoped>
.loader {
  border-width: 4px;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
}
</style>
