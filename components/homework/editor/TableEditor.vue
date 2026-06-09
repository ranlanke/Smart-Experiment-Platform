<template>
  <div class="table-editor-container">
    <template v-if="!item.cells">
      <div class="table-placeholder" @click="showTableDialog = true">
        <el-icon :size="24"><Grid /></el-icon>
        <span>点击设置表格行列数</span>
      </div>
    </template>
    <template v-else>
      <div class="table-container">
        <table class="editable-table">
          <tr v-for="(row, rowIndex) in item.cells" :key="rowIndex">
            <td
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              @click.stop="handleCellEdit(rowIndex, colIndex)"
            >
              <div v-if="cell.editing" class="table-cell-edit">
                <el-input
                  :id="`table-cell-${rowIndex}-${colIndex}`"
                  v-model="cell.content"
                  type="textarea"
                  autosize
                  @blur="endCellEdit(cell)"
                  @keydown.enter="endCellEdit(cell)"
                  v-click-outside="() => endCellEdit(cell)"
                />
              </div>
              <div v-else class="table-cell-content">
                {{ cell.content || '点击编辑' }}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </template>
  </div>

  <!-- 表格行列设置对话框 -->
  <el-dialog v-model="showTableDialog" title="插入表格" width="400px">
    <div class="table-dialog-content">
      <div class="table-size-selector">
        <div class="size-input">
          <span class="input-label">行数:</span>
          <el-input-number v-model="tableRows" :min="1" :max="10" />
        </div>
        <div class="size-input">
          <span class="input-label">列数:</span>
          <el-input-number v-model="tableCols" :min="1" :max="10" />
        </div>
      </div>
      <div class="table-preview">
        <table class="preview-table">
          <tr v-for="row in Math.min(tableRows, 5)" :key="row">
            <td v-for="col in Math.min(tableCols, 5)" :key="col"></td>
          </tr>
        </table>
        <div v-if="tableRows > 5 || tableCols > 5" class="preview-hint">(预览只显示前5行5列)</div>
      </div>
    </div>
    <template #footer>
      <el-button @click="showTableDialog = false">取消</el-button>
      <el-button type="primary" @click="createTable">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Grid } from '@element-plus/icons-vue'

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

// 表格行列数
const tableRows = ref(3)
const tableCols = ref(3)
const showTableDialog = ref(false)

// 创建表格
const createTable = () => {
  const rows = parseInt(tableRows.value)
  const cols = parseInt(tableCols.value)

  if (rows <= 0 || cols <= 0) return

  const updatedItem = {
    ...props.item,
    rows: rows,
    cols: cols,
    cells: Array(rows)
      .fill()
      .map(() =>
        Array(cols)
          .fill()
          .map(() => ({ content: '', editing: false })),
      ),
  }

  emit('update:item', updatedItem)
  showTableDialog.value = false
}

// 处理单元格编辑
const handleCellEdit = (rowIndex, colIndex) => {
  if (props.readonly) return

  // 创建副本避免直接修改prop
  const newCells = JSON.parse(JSON.stringify(props.item.cells))

  // 先关闭所有单元格的编辑状态
  newCells.forEach((row) => {
    row.forEach((cell) => {
      cell.editing = false
    })
  })

  // 设置当前单元格为编辑状态
  newCells[rowIndex][colIndex].editing = true

  // 更新item
  emit('update:item', {
    ...props.item,
    cells: newCells,
  })

  // 下一个tick后聚焦到输入框
  nextTick(() => {
    const input = document.getElementById(`table-cell-${rowIndex}-${colIndex}`)
    if (input) {
      input.focus()
    }
  })
}

// 结束单元格编辑
const endCellEdit = (cell) => {
  cell.editing = false

  // 触发更新
  emit('update:item', { ...props.item })
}
</script>

<script>
// 创建自定义指令
const clickOutsideDirective = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  },
}

export default {
  directives: {
    'click-outside': clickOutsideDirective,
    clickOutside: clickOutsideDirective,
  },
}
</script>

<style scoped>
.table-editor-container {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.table-placeholder:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.editable-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.editable-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  min-width: 80px;
  height: 40px;
  cursor: text;
  position: relative;
}

.editable-table td:hover {
  background-color: #f5f7fa;
}

.table-cell-content {
  min-height: 24px;
  width: 100%;
  height: 100%;
}

.table-cell-edit {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.table-cell-edit :deep(.el-textarea__inner) {
  height: 100%;
  width: 100%;
  border-radius: 0;
  resize: none;
}

.table-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-size-selector {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.size-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-label {
  font-size: 14px;
  color: #606266;
}

.table-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-table {
  border-collapse: collapse;
}

.preview-table td {
  width: 30px;
  height: 30px;
  border: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

.preview-hint {
  font-size: 12px;
  color: #909399;
}
</style>
