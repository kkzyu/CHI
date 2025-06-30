<template>
  <div id="app-container">
    <main class="main-content-area">
      <router-view />
      <GlobalLoading />
      <button 
        @click="()=>downloadPDF('系统文档.pptx')" 
        :disabled="isDownloadingPdf" 
        class="download-button"
        :class="{ 'downloading': isDownloadingPdf }"
      >
        <svg v-if="!isDownloadingPdf" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-if="isDownloadingPdf" class="loading-spinner"></span>
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GlobalLoading from '@/components/common/LoadingSpinner.vue';

// 下载状态
const isDownloadingPdf = ref(false);

// 下载函数
const downloadPDF = async (filename) => {
  try {
    isDownloadingPdf.value = true;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/CHI';
    const fileUrl =`${baseUrl}/${filename}`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    link.target = '_blank';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('下载失败:', error);
  } finally {
    isDownloadingPdf.value = false;
  }
};
</script>

<style>
@import '@/assets/styles/variables.css';
@import '@/assets/styles/base.css';

#app-container {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  background-color: #E6EAEE;
}

.main-content-area {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 0;
  position: relative;
}

.download-button {
  position: fixed;
  right: 24px;
  bottom: 100px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: #1677ff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
}

.download-button:hover {
  background-color: #4096ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.download-button:active {
  transform: translateY(0);
}

.download-button:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
  transform: none;
}

.download-button.downloading {
  background-color: #d9d9d9;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #666;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>