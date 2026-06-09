<template>
  <div class="editor-container">
    <!-- 表格编辑区 -->
    <div v-if="cells && cells.length" class="table-edit-area">
      <table class="editable-table">
        <tr v-for="(row, rowIndex) in cells" :key="rowIndex">
          <td v-for="(cell, colIndex) in row" :key="colIndex">
            <div
              class="cell-content"
              :contenteditable="isEditingCell(rowIndex, colIndex)"
              v-html="cell.content || '双击编辑'"
              @dblclick="activateCell($event, rowIndex, colIndex)"
              @input="onCellInput($event, rowIndex, colIndex)"
              @blur="onCellBlur(rowIndex, colIndex)"
              @keydown.enter.prevent="onCellEnter(rowIndex, colIndex)"
              ref="cellRefs"
            ></div>
          </td>
        </tr>
      </table>
    </div>
    <div v-else class="empty-table-tip">请先插入表格</div>

    <!-- 插入表格弹窗 -->
    <template v-if="showTableDialog">
      <div class="table-dialog-mask">
        <div class="table-dialog">
          <div class="table-dialog-title">插入表格</div>
          <div class="table-dialog-body">
            <label>行数：</label>
            <input
              type="number"
              v-model="tableRows"
              min="1"
              max="20"
              style="width: 60px; margin-right: 16px"
            />
            <label>列数：</label>
            <input type="number" v-model="tableCols" min="1" max="20" style="width: 60px" />
          </div>
          <div class="table-dialog-footer">
            <button @click="showTableDialog = false">取消</button>
            <button @click="insertTable">确定</button>
          </div>
        </div>
      </div>
    </template>

    <!-- 迷你富文本工具栏 -->
    <div v-if="miniToolbarVisible" class="mini-toolbar" :style="miniToolbarStyle">
      <button @mousedown.prevent="execCellCommand('bold')"><b>B</b></button>
      <button @mousedown.prevent="execCellCommand('italic')"><i>I</i></button>
      <button @mousedown.prevent="execCellCommand('underline')"><u>U</u></button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])

const showTableDialog = ref(false)
const tableRows = ref(3)
const tableCols = ref(3)
const cells = ref([])

// 编辑状态
const editingCell = ref({ row: null, col: null })
const cellRefs = ref([])

// 工具栏相关
const miniToolbarVisible = ref(false)
const miniToolbarStyle = ref({ top: '0px', left: '0px' })

const isEditingCell = (row, col) => {
  return editingCell.value.row === row && editingCell.value.col === col
}

const activateCell = (event, row, col) => {
  editingCell.value = { row, col }
  nextTick(() => {
    const cell = event.target
    cell.setAttribute('contenteditable', 'true')
    cell.focus()
    const rect = cell.getBoundingClientRect()
    miniToolbarStyle.value = {
      top: `${rect.top + window.scrollY - 40}px`,
      left: `${rect.left + window.scrollX}px`,
    }
    miniToolbarVisible.value = true
  })
}

const onCellInput = (e, row, col) => {
  cells.value[row][col].content = e.target.innerHTML
}

const onCellBlur = (row, col) => {
  miniToolbarVisible.value = false
  editingCell.value = { row: null, col: null }
}

const onCellEnter = (row, col) => {
  miniToolbarVisible.value = false
  editingCell.value = { row: null, col: null }
}

const execCellCommand = (cmd, value = null) => {
  document.execCommand(cmd, false, value)
}

// 初始化cells
watch(
  () => props.modelValue,
  (val) => {
    if (Array.isArray(val)) {
      cells.value = JSON.parse(JSON.stringify(val))
    }
  },
  { immediate: true, deep: true },
)

// 监听cells变化，emit
watch(
  cells,
  (val) => {
    emit('update:modelValue', JSON.parse(JSON.stringify(val)))
  },
  { deep: true },
)

const insertTable = () => {
  const rows = parseInt(tableRows.value)
  const cols = parseInt(tableCols.value)
  if (rows <= 0 || cols <= 0) return
  cells.value = Array(rows)
    .fill()
    .map(() =>
      Array(cols)
        .fill()
        .map(() => ({ content: '' })),
    )
  showTableDialog.value = false
}
</script>

<style scoped>
/* ...原有样式保持... */
.mini-toolbar {
  position: absolute;
  z-index: 9999;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 8px;
  display: flex;
  gap: 6px;
}
.cell-content[contenteditable='true'] {
  outline: 2px solid #409eff;
  background: #f4f8ff;
}
</style>
