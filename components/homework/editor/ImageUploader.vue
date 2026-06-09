<template>
  <div class="image-uploader-container">
    <div
      v-if="item.src"
      class="image-preview"
      @click.stop="readonly ? handleImagePreview : handleImageUpload"
    >
      <img :src="item.src" alt="上传的图片" class="uploaded-image" />
    </div>
    <div v-else class="upload-placeholder" @click.stop="handleImageUpload">
      <el-icon :size="24">
        <Picture />
      </el-icon>
      <span>点击上传图片</span>
    </div>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:item'])

// 处理图片上传
const handleImageUpload = () => {
  if (props.readonly) return

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const updatedItem = {
        ...props.item,
        src: event.target.result,
      }
      emit('update:item', updatedItem)
    }
    reader.readAsDataURL(file)
  }

  input.click()
}

// 处理图片预览
const handleImagePreview = () => {
  if (!props.item.src) return

  // 创建一个新窗口预览图片
  const newWindow = window.open('', '_blank')
  newWindow.document.write(`
    <html>
      <head>
        <title>图片预览</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f0f0;
          }
          img {
            max-width: 95%;
            max-height: 95vh;
            object-fit: contain;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <img src="${props.item.src}" alt="图片预览">
      </body>
    </html>
  `)
  newWindow.document.close()
}
</script>

<style scoped>
.image-uploader-container {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px 0;
  cursor: pointer;
}

.uploaded-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.uploaded-image:hover {
  transform: scale(1.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f8f9fa;
}

.upload-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #f0f9ff;
}

.upload-placeholder span {
  margin-top: 10px;
  font-size: 14px;
}
</style>
