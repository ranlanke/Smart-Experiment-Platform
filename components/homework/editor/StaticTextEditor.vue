<template>
  <div class="static-text-container">
    <div v-if="editing" class="edit-container">
      <div
        ref="editableDiv"
        class="editable-div"
        contenteditable
        @input="handleInput"
        @blur="updateContent"
        @paste="handlePaste"
        @keydown="handleKeyDown"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      ></div>
      <div class="text-style-container">
        <div
          v-for="(style, index) in headingStyles"
          :key="index"
          class="heading-style-item"
          :style="style.style"
          @click="applyHeadingStyle(style)"
        >
          {{ style.name }}
        </div>
      </div>
    </div>
    <div v-else class="item-text" v-html="item.content" @dblclick="startEdit"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  headingStyles: {
    type: Array,
    default: () => [
      { name: '正文', level: 0, style: { fontSize: '14px', fontWeight: 'normal' } },
      { name: '标题1', level: 1, style: { fontSize: '24px', fontWeight: 'bold' } },
      { name: '标题2', level: 2, style: { fontSize: '20px', fontWeight: 'bold' } },
      { name: '标题3', level: 3, style: { fontSize: '18px', fontWeight: 'bold' } },
      { name: '标题4', level: 4, style: { fontSize: '16px', fontWeight: 'bold' } },
      { name: '标题5', level: 5, style: { fontSize: '14px', fontWeight: 'bold' } },
    ],
  },
})

const emit = defineEmits(['update:item'])

// 编辑状态和引用
const editing = ref(false)
const editableDiv = ref(null)
const selectedRange = ref(null)
const isComposing = ref(false)

// 开始编辑
const startEdit = () => {
  if (props.readonly) return

  editing.value = true
  nextTick(() => {
    if (editableDiv.value) {
      editableDiv.value.innerHTML = props.item.content || ''
      editableDiv.value.focus()

      // 添加事件监听
      document.addEventListener('selectionchange', handleSelectionChange)
    }
  })
}

// 处理输入事件
const handleInput = (e) => {
  if (isComposing.value) return // 如果正在使用输入法，不处理输入事件

  updateItemContent(e.target.innerHTML)
}

// 更新内容
const updateContent = (e) => {
  updateItemContent(e.target.innerHTML)
  editing.value = false
  document.removeEventListener('selectionchange', handleSelectionChange)
}

// 更新项目内容
const updateItemContent = (content) => {
  emit('update:item', { ...props.item, content })
}

// 处理粘贴事件
const handlePaste = (e) => {
  e.preventDefault()

  // 获取纯文本
  const text = e.clipboardData.getData('text/plain')

  // 在当前光标位置插入文本
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(text))

    // 更新模型内容
    updateItemContent(e.target.innerHTML)

    // 移动光标到插入文本的末尾
    range.setStartAfter(range.endContainer)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

// 处理键盘事件
const handleKeyDown = (e) => {
  // 处理Tab键
  if (e.key === 'Tab') {
    e.preventDefault()

    // 插入tab空格
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const tabNode = document.createTextNode('\u00a0\u00a0\u00a0\u00a0') // 4个非断空格
      range.deleteContents()
      range.insertNode(tabNode)

      // 更新内容
      updateItemContent(e.target.innerHTML)

      // 移动光标到插入内容后
      range.setStartAfter(tabNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

// 处理输入法开始
const handleCompositionStart = () => {
  isComposing.value = true
}

// 处理输入法结束
const handleCompositionEnd = (e) => {
  isComposing.value = false

  // 更新内容
  updateItemContent(e.target.innerHTML)
}

// 处理文本选择
const handleSelectionChange = () => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0 && selection.toString().trim() !== '') {
    selectedRange.value = selection.getRangeAt(0)
  }
}

// 应用标题样式
const applyHeadingStyle = (style) => {
  if (!selectedRange.value) return

  const selectedText = selectedRange.value.toString()
  if (!selectedText) return

  // 保存光标位置和选择
  const selection = window.getSelection()
  const originalRange = selection.getRangeAt(0).cloneRange()

  if (style.level === 0) {
    // 创建纯文本节点替换选中内容
    const textNode = document.createTextNode(selectedText)
    selectedRange.value.deleteContents()
    selectedRange.value.insertNode(textNode)

    // 确保更新后的内容不包含任何格式标记
    if (editableDiv.value) {
      // 遍历所有子节点，移除任何带有data-level属性的元素
      const walker = document.createTreeWalker(
        editableDiv.value,
        NodeFilter.SHOW_ELEMENT,
        null,
        false,
      )

      let node
      const nodesToRemove = []

      while ((node = walker.nextNode())) {
        if (node.hasAttribute('data-level')) {
          nodesToRemove.push(node)
        }
      }

      nodesToRemove.forEach((node) => {
        // 用文本节点替换格式节点
        const textNode = document.createTextNode(node.textContent)
        node.parentNode.replaceChild(textNode, node)
      })

      updateItemContent(editableDiv.value.innerHTML)
    }
  } else {
    // 创建带有样式的span
    const span = document.createElement('span')
    span.style.fontSize = style.style.fontSize
    span.style.fontWeight = style.style.fontWeight
    span.dataset.level = style.level
    span.textContent = selectedText
    selectedRange.value.deleteContents()
    selectedRange.value.insertNode(span)

    // 更新内容
    if (editableDiv.value) {
      updateItemContent(editableDiv.value.innerHTML)
    }

    // 设置选择范围在新添加的span之后
    originalRange.setStartAfter(span)
    originalRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(originalRange)
  }
}
</script>

<style scoped>
.static-text-container {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.edit-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editable-div {
  width: 100%;
  min-height: 100px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  white-space: pre-wrap;
}

.text-style-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.heading-style-item {
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #fff;
  border: 1px solid #dcdfe6;
}

.heading-style-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.item-text {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.item-text ::v-deep([data-level='1']) {
  font-size: 24px !important;
  font-weight: bold !important;
  margin: 16px 0 8px 0;
  display: block;
}

.item-text ::v-deep([data-level='2']) {
  font-size: 20px !important;
  font-weight: bold !important;
  margin: 14px 0 7px 0;
  display: block;
}

.item-text ::v-deep([data-level='3']) {
  font-size: 18px !important;
  font-weight: bold !important;
  margin: 12px 0 6px 0;
  display: block;
}

.item-text ::v-deep([data-level='4']) {
  font-size: 16px !important;
  font-weight: bold !important;
  margin: 10px 0 5px 0;
  display: block;
}

.item-text ::v-deep([data-level='5']) {
  font-size: 14px !important;
  font-weight: bold !important;
  margin: 8px 0 4px 0;
  display: block;
}
</style>
