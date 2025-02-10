<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import config from '@/config';
import { useRoute } from 'vue-router';

const showModal = ref(false);

definePageMeta({ layout: 'admin' });

const route = useRoute();
const pdfUrl = ref(null);
const name = ref('');

const LoadFile = async () => {
    const nationalId = localStorage.getItem('nuxt_erp_national_id'); // รับค่า nationalId จาก localStorage
    name.value = localStorage.getItem('name_id'); // รับค่า name จาก localStorage

    if (!nationalId) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No national ID found in the request',
        });
        return;
    }

    Swal.fire({
        title: 'Loading...',
        text: 'Please wait a moment',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        const response = await axios.get(`${config.apiServer}/documents/${nationalId}`, {
            responseType: 'blob',
        });

        const fileBlob = response.data;
        pdfUrl.value = window.URL.createObjectURL(fileBlob);

        Swal.close();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Unable to load the document',
        });
        console.error(error.message);
    }
};

// ฟังก์ชันดาวน์โหลดไฟล์
const DownloadFile = () => {
    const link = document.createElement('a');
    link.href = pdfUrl.value;
    link.download = 'document.pdf'; // ตั้งชื่อไฟล์ที่ดาวน์โหลด
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

onMounted(() => {
    LoadFile();
});
</script>

<template>
    <div class="title text-center">ข้อมูลหนังสือรับรอง
        การหักภาษี ณ ที่จ่าย ของคุณ {{ name }}</div>
    <div 
    v-if="!pdfUrl" 
    class="p-4 flex justify-center items-center">
        <!-- ปรับปุ่มให้ซ่อนเมื่อมีการแสดงเอกสาร -->
        <button 
            class="btn bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold py-3 px-6 rounded-lg flex items-center gap-2"
            @click="LoadFile"
        >
            <i class="fa-solid fa-download"></i>
            แสดงเอกสาร
        </button>
    </div>

    <!-- แสดงไฟล์ PDF -->
    <div v-if="pdfUrl" class="mt-8">
        <iframe
            :src="pdfUrl"
            class="w-full border rounded-lg"
            style="height: 600px;"
            frameborder="0"
        ></iframe>
        <div class="flex justify-center mt-4">
            <button
                class="btn bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-3 mt-3 mb-3 px-6 rounded-lg"
                @click="DownloadFile"
            >
                ดาวน์โหลดไฟล์
            </button>
        </div>
    </div>
</template>
