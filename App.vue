<script setup>
import { RouterView } from 'vue-router'
import DifyChatbot from '@/components/DifyChatbot.vue'
import 'quill/dist/quill.snow.css'
</script>

<template>
  <!-- <header>niao</header> -->
  <RouterView />
  <DifyChatbot />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* 强制 Element Plus Message 居中显示在顶部 */
.el-message {
  position: fixed !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  right: auto !important;
  bottom: auto !important;
  z-index: 99999 !important;
  min-width: 200px;
  max-width: 80vw;
  box-sizing: border-box;
}
</style>
