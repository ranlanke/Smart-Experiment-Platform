<template>
  <div class="file-uploader-container">
    <div class="file-preview">
      <div class="file-main" @click.stop="handleFileUpload">
        <div class="file-icon">
          <el-icon :size="24">
            <Upload />
          </el-icon>
        </div>
        <div class="file-info">
          <div class="file-name">
            {{ item.file ? item.file.name : '点击上传文件' }}
          </div>
          <div v-if="item.file" class="file-size">{{ (item.file.size / 1024).toFixed(2) }} KB</div>
        </div>
      </div>
      <div v-if="item.file" class="file-open" @click.stop="handleFilePreview">
        <el-icon :size="20"><View /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Upload, View } from '@element-plus/icons-vue'

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

// 处理文件上传
const handleFileUpload = () => {
  if (props.readonly) return

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.doc,.docx'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const updatedItem = {
      ...props.item,
      file,
      url: URL.createObjectURL(file),
    }
    emit('update:item', updatedItem)
  }

  input.click()
}

// 处理文件预览
const handleFilePreview = () => {
  if (!props.item.url) return
  window.open(props.item.url, '_blank')
}
</script>

<style scoped>
.file-uploader-container {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.file-preview {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.file-main {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  transition: all 0.3s;
}

.file-main:hover {
  background-color: #ecf5ff;
}

.file-icon {
  margin-right: 10px;
  color: #409eff;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #606266;
}

.file-open {
  margin-left: 10px;
  padding: 5px;
  color: #409eff;
  cursor: pointer;
  border-radius: 4px;
}

.file-open:hover {
  background-color: #ecf5ff;
}
</style>
