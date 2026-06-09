<template>
  <div class="text-editor-container">
    <template v-if="editing">
      <el-input
        v-model="editContent"
        type="textarea"
        autosize
        @blur="saveContent"
        @keydown.enter.prevent="saveContent"
        ref="textInput"
      />
      <div class="editor-actions">
        <el-button size="small" type="primary" @click="saveContent">保存</el-button>
        <el-button size="small" @click="cancelEdit">取消</el-button>
      </div>
    </template>
    <div v-else class="text-content" @click="startEdit">
      <div v-if="modelValue && modelValue.trim()">{{ modelValue }}</div>
      <div v-else class="text-placeholder">
        <el-icon><Edit /></el-icon>
        <span>点击编辑动态文本</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Edit } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const editing = ref(false)
const editContent = ref('')
const textInput = ref(null)

// 开始编辑
const startEdit = () => {
  if (props.readonly) return

  editContent.value = props.modelValue
  editing.value = true

  // 下一个tick后聚焦到输入框
  nextTick(() => {
    if (textInput.value) {
      textInput.value.focus()
    }
  })
}

// 保存内容
const saveContent = () => {
  emit('update:modelValue', editContent.value)
  editing.value = false
}

// 取消编辑
const cancelEdit = () => {
  editing.value = false
}

// 当外部modelValue变化时更新编辑内容
watch(
  () => props.modelValue,
  (newVal) => {
    if (!editing.value) {
      editContent.value = newVal
    }
  },
)
</script>

<style scoped>
.text-editor-container {
  width: 100%;
  min-height: 100px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  margin-bottom: 16px;
}

.text-content {
  min-height: 100px;
  padding: 12px;
  cursor: text;
  word-break: break-word;
}

.text-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #909399;
  font-size: 14px;
  gap: 8px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}
</style>
