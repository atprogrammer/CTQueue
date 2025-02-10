<script setup>
definePageMeta(
    {
        layout: 'admin',
    }
)
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold mb-6 text-center">คู่มือการใช้งานโปรแกรม</h1>

        <!-- ขั้นตอนการใช้งาน -->
        <div class="space-y-6">
            <!-- ขั้นตอนที่ 1 -->
            <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-2">ขั้นตอนที่ 1: แปลงไฟล์ข้อมูล</h2>
                <p class="text-gray-700">
                    - เลือกเมนู <span class="font-medium">แปลงชื่อไฟล์ข้อมูล</span> แล้วนำเข้าไฟล์ข้อมูลเพื่อเตรียมนำเข้าระบบ<br>
                </p>
            </div>

            <!-- ขั้นตอนที่ 2 -->
            <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-2">ขั้นตอนที่ 2: อัพโหลดไฟล์ข้อมูลในรูปแบบ zip ไฟล์</h2>
                <p class="text-gray-700">
                    - เลือกเมนู <span class="font-medium">อัพโหลดไฟล์ข้อมูล</span> เพื่อนำเข้าข้อมูลเข้าระบบ

                </p>
            </div>

                <!-- ขั้นตอนที่ 3 -->
                <div class="bg-white shadow-md rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-2">ขั้นตอนที่ 3: ตรวจสอบความถูกต้องของข้อมูล</h2>
                <p class="text-gray-700">
                    - เลือกเมนู <span class="font-medium">ตรวจสอบข้อมูล</span>

                </p>
            </div>
        </div>
    </div>
</template>