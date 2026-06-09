<template>
  <div class="content-preview">
    <VueDraggable
      v-model="localItems"
      group="skills"
      item-key="type"
      class="preview-container"
      @end="handleDragEnd"
    >
      <div
        v-for="(item, index) in localItems"
        :key="index"
        class="list-item"
        :class="{ 'highlight-item': highlightIndex === index }"
      >
        <div class="item-content">
          <!-- 删除按钮 -->
          <el-button
            v-if="!readonly"
            class="delete-btn"
            type="danger"
            size="small"
            circle
            @click.stop="deleteItem(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>

          <!-- 提交按钮和状态显示 -->
          <div v-if="!readonly" class="item-action">
            <div v-if="item.isSubmitted" class="submit-info">
              <el-tag type="success" size="small">已提交</el-tag>
              <span class="submit-time">{{ item.submitTime }}</span>
              <el-button type="text" @click.stop="cancelSubmit(index)">取消提交</el-button>
            </div>
            <el-button v-else type="primary" size="small" @click.stop="submitItem(index)">
              提交
            </el-button>
          </div>

          <!-- 根据不同类型渲染不同组件 -->
          <component
            :is="getComponentByType(item.type)"
            v-if="getComponentByType(item.type)"
            :item="item"
            :readonly="readonly"
            @update:item="updateItem(index, $event)"
          />
        </div>
      </div>
    </VueDraggable>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 导入组件
import StaticTextEditor from '../editor/StaticTextEditor.vue'
import DynamicTextEditor from '../editor/DynamicTextEditor.vue'
import TableEditor from '../editor/TableEditor.vue'
import FileUploader from '../editor/FileUploader.vue'
import ImageUploader from '../editor/ImageUploader.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:items', 'drag-end'])

// 本地项目列表
const localItems = computed({
  get: () => props.items,
  set: (value) => emit('update:items', value),
})

// 高亮显示的项目索引
const highlightIndex = ref(-1)

// 根据类型获取对应的组件
const getComponentByType = (type) => {
  const componentMap = {
    'static-text': markRaw(StaticTextEditor),
    dynamic_text: markRaw(DynamicTextEditor),
    table: markRaw(TableEditor),
    file: markRaw(FileUploader),
    image: markRaw(ImageUploader),
  }
  return componentMap[type]
}

// 更新项目
const updateItem = (index, newItem) => {
  const newItems = [...localItems.value]
  newItems[index] = newItem
  emit('update:items', newItems)
}

// 删除项目
const deleteItem = (index) => {
  const newItems = [...localItems.value]
  newItems.splice(index, 1)
  emit('update:items', newItems)
}

// 提交项目
const submitItem = (index) => {
  const item = localItems.value[index]

  // 验证内容是否填写完整
  if (!validateItemContent(item)) {
    ElMessage.warning('请填写完整内容后再提交')
    return
  }

  const newItems = [...localItems.value]
  newItems[index] = {
    ...item,
    isSubmitted: true,
    submitTime: new Date().toLocaleString(),
  }

  emit('update:items', newItems)
  ElMessage.success('提交成功')
}

// 取消提交
const cancelSubmit = (index) => {
  const item = localItems.value[index]
  const newItems = [...localItems.value]
  newItems[index] = {
    ...item,
    isSubmitted: false,
    submitTime: null,
  }

  emit('update:items', newItems)
}

// 验证组件内容是否完整
const validateItemContent = (item) => {
  switch (item.type) {
    case 'static-text':
      return item.content && item.content.trim() !== ''
    case 'image':
      return item.src !== ''
    case 'file':
      return item.file !== null
    case 'table':
      if (!item.cells) return false
      // 检查表格是否至少有一个单元格有内容
      return item.cells.some((row) =>
        row.some((cell) => cell.content && cell.content.trim() !== ''),
      )
    case 'dynamic_text':
      return item.content && item.content.trim() !== ''
    default:
      return true
  }
}

// 拖拽结束处理
const handleDragEnd = (evt) => {
  emit('drag-end', evt)
}

// 高亮显示某个项目
const highlightItem = (index) => {
  highlightIndex.value = index
  setTimeout(() => {
    highlightIndex.value = -1
  }, 2000)
}

// 暴露方法
defineExpose({
  highlightItem,
})
</script>

<style scoped>
.content-preview {
  width: 100%;
}

.preview-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  cursor: default;
  transition: all 0.3s;
  position: relative;
  padding: 5px;
  border-radius: 4px;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-content {
  position: relative;
}

.delete-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
}

.list-item:hover .delete-btn {
  opacity: 1;
}

.item-action {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 10;
}

.submit-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.submit-time {
  font-size: 12px;
  color: #909399;
}

/* 高亮效果 */
.highlight-item {
  animation: highlight-animation 2s ease;
}

@keyframes highlight-animation {
  0% {
    background-color: rgba(64, 158, 255, 0.2);
  }
  70% {
    background-color: rgba(64, 158, 255, 0.2);
  }
  100% {
    background-color: transparent;
  }
}
</style>
