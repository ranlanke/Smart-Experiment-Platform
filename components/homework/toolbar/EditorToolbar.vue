<template>
  <div class="editor-toolbar">
    <div class="toolbar-container">
      <VueDraggable
        v-model="toolList"
        :group="{ name: 'skills', pull: 'clone', put: false }"
        :sort="false"
        :clone="cloneItem"
        item-key="type"
        class="tools-list"
      >
        <div v-for="(item, index) in toolList" :key="index" class="tool-item">
          <el-tooltip :content="item.name" placement="top">
            <el-card class="item-card">
              <div class="item-content">
                <el-icon :size="20">
                  <component :is="item.icon" />
                </el-icon>
                <span class="item-text">{{ item.name }}</span>
              </div>
            </el-card>
          </el-tooltip>
        </div>
      </VueDraggable>
    </div>

    <div class="heading-styles-container" v-if="showHeadingStyles">
      <el-card class="heading-styles-card" shadow="never">
        <div class="heading-styles-title">文本样式</div>
        <div class="heading-styles-list">
          <div
            v-for="(style, index) in headingStyles"
            :key="index"
            class="heading-style-item"
            :style="style.style"
            @click="$emit('apply-style', style)"
          >
            {{ style.name }}
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { Picture, View, Delete, Grid, Upload, Edit, Document } from '@element-plus/icons-vue'

const props = defineProps({
  showHeadingStyles: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['tool-cloned', 'apply-style'])

// 编辑工具数据
const toolList = ref([
  {
    type: 'static-text',
    name: '静态文本',
    content: '',
    icon: Edit,
    isSubmitted: false,
    submitTime: null,
  },
  {
    type: 'table',
    name: '插入表格',
    icon: Grid,
    isSubmitted: false,
    submitTime: null,
  },
  {
    type: 'dynamic_text',
    name: '动态文本',
    content: '',
    blanks: [],
    icon: Document,
    isSubmitted: false,
    submitTime: null,
  },
  {
    type: 'file',
    name: '上传文件',
    file: null,
    url: null,
    icon: Upload,
    isSubmitted: false,
    submitTime: null,
  },
  {
    type: 'image',
    name: '上传图片',
    src: '',
    icon: Picture,
    isSubmitted: false,
    submitTime: null,
  },
])

// 标题样式数据
const headingStyles = ref([
  { name: '正文', level: 0, style: { fontSize: '14px', fontWeight: 'normal' } },
  { name: '标题1', level: 1, style: { fontSize: '24px', fontWeight: 'bold' } },
  { name: '标题2', level: 2, style: { fontSize: '20px', fontWeight: 'bold' } },
  { name: '标题3', level: 3, style: { fontSize: '18px', fontWeight: 'bold' } },
  { name: '标题4', level: 4, style: { fontSize: '16px', fontWeight: 'bold' } },
  { name: '标题5', level: 5, style: { fontSize: '14px', fontWeight: 'bold' } },
])

// 克隆函数
const cloneItem = (item) => {
  const clonedItem = JSON.parse(JSON.stringify(item))
  // 确保每个新拖拽的项都有正确的初始状态
  clonedItem.isSubmitted = false
  clonedItem.submitTime = null

  // 触发克隆事件给父组件
  emit('tool-cloned', clonedItem)

  return clonedItem
}
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  gap: 20px;
  width: 100%;
}

.toolbar-container {
  flex: 1;
}

.tools-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tool-item {
  cursor: move;
}

.item-card {
  padding: 10px;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
  cursor: grab;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

.item-text {
  font-size: 14px;
  color: #303133;
  margin: 0;
  padding: 0;
}

.heading-styles-container {
  width: auto;
  min-width: 300px;
}

.heading-styles-card {
  height: 100%;
  border: 1px solid #ebeef5;
}

.heading-styles-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.heading-styles-list {
  display: flex;
  flex-direction: row;
  gap: 12px;
  flex-wrap: wrap;
}

.heading-style-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
  white-space: nowrap;
  border: 1px solid #ebeef5;
  background-color: #f8f9fa;
}

.heading-style-item:hover {
  background-color: #f0f9eb;
}
</style>
