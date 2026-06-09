<template>
  <div class="dynamic-text-container" @click.stop="$emit('edit', item)">
    <template v-if="!item.content">
      <div class="empty-dynamic-text">
        <el-icon><Document /></el-icon>
        <span>点击编辑动态文本</span>
      </div>
    </template>
    <template v-else>
      <div class="dynamic-text-content" v-html="renderDynamicText(item.content, item.blanks)"></div>
      <el-button v-if="!readonly" type="primary" size="small"> 编辑动态文本 </el-button>
    </template>
  </div>

  <!-- 动态文本编辑对话框 -->
  <el-dialog
    v-model="showDialog"
    title="编辑动态文本"
    width="800px"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @opened="onDialogOpened"
    @closed="onDialogClosed"
  >
    <div class="dynamic-text-edit-container">
      <div class="edit-instructions">
        <p>1. 输入文本内容</p>
        <p>2. 选中需要设置为填空的文本</p>
        <p>3. 点击"标记为填空"按钮</p>
      </div>
      <div
        ref="dynamicTextEditor"
        class="dynamic-text-editor"
        contenteditable="true"
        @input="handleInput"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      >
        {{ dynamicTextContent }}
      </div>
      <div class="edit-actions">
        <el-button type="primary" @click="markAsBlank" :disabled="!hasSelection">
          标记为填空
        </el-button>
      </div>
      <div class="blanks-preview" v-if="currentItem?.blanks?.length">
        <h4>已创建的填空：</h4>
        <ul>
          <li v-for="blank in currentItem.blanks" :key="blank.id">
            原文：{{ blank.originalText }}
          </li>
        </ul>
      </div>
    </div>
    <template #footer>
      <el-button @click="cancelEdit">取消</el-button>
      <el-button type="primary" @click="saveEdit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'

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

const emit = defineEmits(['update:item', 'edit'])

// 编辑器相关变量
const showDialog = ref(false)
const currentItem = ref(null)
const dynamicTextContent = ref('')
const selectionStart = ref(0)
const selectionEnd = ref(0)
const hasSelection = ref(false)
const isComposing = ref(false)
const dynamicTextEditor = ref(null)

// 开始编辑
const startEdit = (item) => {
  console.log('开始编辑动态文本', item)
  currentItem.value = item
  dynamicTextContent.value = item.content || ''
  showDialog.value = true
}

// 取消编辑
const cancelEdit = () => {
  showDialog.value = false
}

// 保存编辑
const saveEdit = () => {
  if (currentItem.value) {
    currentItem.value.content = dynamicTextContent.value
    emit('update:item', currentItem.value)
    showDialog.value = false
  }
}

// 渲染动态文本
const renderDynamicText = (content, blanks) => {
  if (!content || !blanks) return content

  let renderedContent = content
  blanks.forEach((blank) => {
    const placeholder = `<span class="blank-placeholder" data-blank-id="${blank.id}">${blank.answer || '________'}</span>`
    renderedContent = renderedContent.replace(`[blank-${blank.id}]`, placeholder)
  })
  return renderedContent
}

// 检查选择
const checkSelection = () => {
  if (typeof window === 'undefined') return false
  const selection = window.getSelection()
  if (!selection) return false
  return selection.toString().trim() !== ''
}

// 处理选择变化
const handleSelectionChange = () => {
  hasSelection.value = checkSelection()
}

// 处理输入
const handleInput = (e) => {
  if (isComposing.value) return // 输入法输入中不更新

  dynamicTextContent.value = e.target.innerText
  saveCaretPosition()
  restoreCaretPosition()
}

// 输入法事件
const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = (e) => {
  isComposing.value = false
  handleInput(e)
}

// 光标位置管理
const saveCaretPosition = () => {
  if (!dynamicTextEditor.value) return

  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return

  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(dynamicTextEditor.value)
  preCaretRange.setEnd(range.endContainer, range.endOffset)
  selectionStart.value = preCaretRange.toString().length
}

const restoreCaretPosition = () => {
  if (!dynamicTextEditor.value) return

  nextTick(() => {
    const editor = dynamicTextEditor.value
    const selection = window.getSelection()
    const range = document.createRange()

    // 找到正确的文本节点和偏移量
    let currentNode = editor.firstChild

    // 简单文本节点情况
    if (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
      if (selectionStart.value <= currentNode.length) {
        range.setStart(currentNode, selectionStart.value)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        return
      }
    }

    // 更复杂的嵌套节点情况
    if (selectionStart.value === 0) {
      range.setStart(editor, 0)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  })
}

// 标记选中文本为填空
const markAsBlank = () => {
  if (typeof window === 'undefined') return
  const selection = window.getSelection()
  if (!selection) return

  const selectedText = selection.toString().trim()
  if (!selectedText) return

  const editor = document.querySelector('.dynamic-text-editor')
  if (!editor) return

  // 获取选中的范围
  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(editor)
  preCaretRange.setEnd(range.startContainer, range.startOffset)
  selectionStart.value = preCaretRange.toString().length
  selectionEnd.value = selectionStart.value + selectedText.length

  // 创建一个新的填空标记
  const blankId = Date.now()
  const blankMark = `[blank-${blankId}]`

  // 更新内容，插入填空标记
  const content = editor.innerText
  const newContent =
    content.substring(0, selectionStart.value) + blankMark + content.substring(selectionEnd.value)

  // 保存填空信息
  if (currentItem.value) {
    if (!currentItem.value.blanks) {
      currentItem.value.blanks = []
    }
    currentItem.value.blanks.push({
      id: blankId,
      originalText: selectedText,
      answer: '',
    })
  }

  // 更新编辑器内容
  editor.innerText = newContent
  dynamicTextContent.value = newContent
}

// 对话框事件
const onDialogOpened = () => {
  nextTick(() => {
    document.addEventListener('selectionchange', handleSelectionChange)

    if (dynamicTextEditor.value) {
      dynamicTextEditor.value.focus()
    }
  })
}

const onDialogClosed = () => {
  document.removeEventListener('selectionchange', handleSelectionChange)
  hasSelection.value = false
}

// 导出公共方法
defineExpose({
  startEdit,
})
</script>

<style scoped>
.dynamic-text-container {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.dynamic-text-container:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.empty-dynamic-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  transition: all 0.3s;
}

.empty-dynamic-text:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.empty-dynamic-text .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.dynamic-text-edit-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-instructions {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  font-size: 14px;
}

.edit-instructions p {
  margin: 5px 0;
  color: #606266;
}

.dynamic-text-editor {
  min-height: 200px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.edit-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.blanks-preview {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.blanks-preview h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.blanks-preview ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.blanks-preview li {
  padding: 5px 0;
  color: #606266;
}

.blank-placeholder {
  display: inline-block;
  min-width: 60px;
  border-bottom: 1px solid #409eff;
  margin: 0 5px;
  padding: 0 5px;
  color: #409eff;
  font-style: italic;
}

.dynamic-text-content {
  margin-bottom: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
