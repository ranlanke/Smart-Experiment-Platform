<script setup>
import { getTemplateDetailService, saveTemplateContentService } from '@/api/template'
import { ref, nextTick, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { Picture, View, Delete, Grid, Upload, Edit, Document, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHomeworkStore } from '@/stores/modules/homework'
import { useTemplateStore } from '@/stores/modules/template'
import { uploadFileService } from '@/api/upload'
import { useRoute, useRouter } from 'vue-router'
import { updateTemplateService } from '@/api/template'
import RichTextEditor from './RichTextEditor.vue'
import ResizableTable from './ResizableTable.vue'
import { throttle } from 'lodash-es'

const MAX_TABLE_ROWS = 20
const MAX_TABLE_COLS = 20 // 最多支持20列

const route = useRoute()
const router = useRouter()
const courseId = route.params.id
const templateId = route.params.templateId

const LOCAL_STORAGE_KEY = computed(() => `baogao_edit_content_${courseId}`)
const LOCAL_STORAGE_TITLE_KEY = computed(() => `baogao_title_${courseId}`)

const homeworkStore = useHomeworkStore()
const templateStore = useTemplateStore()
const reportTitle = ref('')
const titleSaved = ref(false)

const saveReportTitle = () => {
  if (!reportTitle.value.trim()) {
    ElMessage.warning('请输入标题后再保存')
    return
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_TITLE_KEY.value, reportTitle.value)
    titleSaved.value = true
    setTimeout(() => {
      titleSaved.value = false
    }, 3000)
  } catch (error) {
    console.error('保存标题到localStorage失败:', error)
    ElMessage.error('标题保存失败')
  }
}

const editTools = ref([
  {
    type: 'static-text',
    name: '静态文本',
    content: '',
    icon: Edit,
    isSubmitted: false,
    submitTime: null,
  },
  { type: 'table', name: '插入表格', icon: Grid, isSubmitted: false, submitTime: null },
  {
    type: 'file',
    name: '上传图片',
    isImage: true,
    file: null,
    url: '',
    icon: Picture,
    isSubmitted: false,
    submitTime: null,
    width: '100%',
    height: 'auto',
    isResizing: false,
  },
])

const favoriteList = ref([])

onMounted(async () => {
  if (templateId) {
    try {
      const res = await getTemplateDetailService(courseId, templateId)
      if (res && res.data && res.data.data) {
        const data = res.data.data
        reportTitle.value = data.name || ''
        if (Array.isArray(data.classIds)) {
          selectedClasses.value = data.classIds
        }
        favoriteList.value = (data.components || []).map((comp) => {
          if (comp.componentType === 'static_text') {
            let content = comp.content
            try {
              if (
                typeof content === 'string' &&
                content.trim().startsWith('"') &&
                content.trim().endsWith('"')
              ) {
                content = JSON.parse(content)
              }
            } catch {}
            return {
              type: 'static-text',
              content,
              isSubmitted: true,
            }
          }
          if (comp.componentType === 'dynamic_text') {
            let contentObj
            try {
              contentObj = JSON.parse(comp.content)
            } catch {
              contentObj = { text: comp.content, blanks: [] }
            }
            return {
              type: 'dynamic_text',
              content: contentObj,
              blanks: contentObj.blanks || [],
              isSubmitted: true,
            }
          }
          if (comp.componentType === 'table') {
            let cells
            let tableName = ''
            try {
              cells = JSON.parse(comp.content)
              if (cells && typeof cells === 'object' && cells.tableName) {
                tableName = cells.tableName
                delete cells.tableName
              }
            } catch {
              cells = []
            }
            return {
              type: 'table',
              cells,
              tableName,
              isSubmitted: true,
            }
          }
          if (comp.componentType === 'image') {
            let contentObj = { url: '' }
            try {
              if (typeof comp.content === 'string' && comp.content) {
                contentObj = JSON.parse(comp.content)
              }
            } catch {}
            if (!contentObj || typeof contentObj !== 'object') {
              contentObj = { url: '' }
            }
            let width = comp.width || contentObj.width || '100%'
            let height = comp.height || contentObj.height || 'auto'
            if (typeof width === 'string' && width.endsWith('px') && parseInt(width) < 200) {
              width = '100%'
            }
            if (typeof height === 'string' && height.endsWith('px') && parseInt(height) < 100) {
              height = 'auto'
            }
            return {
              type: 'file',
              isImage: true,
              url: contentObj.url || '',
              imageName: contentObj.imageName || contentObj.name || '',
              file: null,
              isSubmitted: true,
              width,
              height,
            }
          }
          if (comp.componentType === 'file') {
            let contentObj
            try {
              contentObj = JSON.parse(comp.content)
            } catch {
              contentObj = { url: '', name: '', size: 0 }
            }
            return {
              type: 'file',
              isImage: false,
              url: contentObj.url || '',
              file: contentObj.name ? { name: contentObj.name, size: contentObj.size } : null,
              isSubmitted: true,
            }
          }
          return { type: 'static-text', content: '', isSubmitted: true }
        })
        return
      }
    } catch (e) {
      ElMessage.error('获取报告详情失败')
    }
  }

  try {
    const savedTitle = localStorage.getItem(LOCAL_STORAGE_TITLE_KEY.value)
    if (savedTitle) {
      reportTitle.value = savedTitle
    }
  } catch (error) {
    console.error('从localStorage恢复标题失败:', error)
  }

  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY.value)
    if (localData) {
      favoriteList.value = JSON.parse(localData)
      fixDynamicTextContent(favoriteList.value)
      return
    }
  } catch (error) {
    console.error('从localStorage恢复数据失败:', error)
  }

  const storedDraft = homeworkStore.getHomeworkDraft(courseId)
  if (storedDraft && storedDraft.length > 0) {
    favoriteList.value = JSON.parse(JSON.stringify(storedDraft))
    ElMessage.info('已从草稿中恢复上次编辑的内容')
    fixDynamicTextContent(favoriteList.value)
  }

  favoriteList.value.forEach((item) => {
    if (item.type === 'table') {
      if (!item.tableName && item.cells && typeof item.cells === 'object' && item.cells.tableName) {
        item.tableName = item.cells.tableName
      }
      if (item.cells && typeof item.cells === 'object' && item.cells.tableName) {
        item.cells.tableName = undefined
      }
    }
    if (item.type === 'file' && item.isImage) {
      if (!item.imageName && item.file && item.file.name) {
        item.imageName = item.file.name
      }
      if (typeof item.imageName === 'undefined') {
        item.imageName = ''
      }
    }
  })

  window.onbeforeunload = (e) => {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
})

onBeforeUnmount(() => {
  window.onbeforeunload = null
})

function fixDynamicTextContent(list) {
  list.forEach((item) => {
    if (item.type === 'dynamic_text') {
      if (
        !item.content ||
        typeof item.content !== 'object' ||
        !('text' in item.content) ||
        !('blanks' in item.content)
      ) {
        item.content = {
          text: '',
          blanks: [],
        }
      }
      if (!Array.isArray(item.blanks)) item.blanks = []
      if (Array.isArray(item.content.blanks)) item.blanks = item.content.blanks
    }
  })
}

const throttledSaveToLocal = throttle((key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('保存到localStorage失败:', error)
  }
}, 1000)

watch(
  favoriteList,
  (newList) => {
    fixDynamicTextContent(newList)
    homeworkStore.saveHomeworkDraft(newList, courseId)
    throttledSaveToLocal(LOCAL_STORAGE_KEY.value, newList)
  },
  { deep: true },
)

watch(reportTitle, (newTitle) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_TITLE_KEY.value, newTitle)
  } catch (error) {
    console.error('保存标题到localStorage失败:', error)
  }
})

const clearLocalStorage = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY.value)
    localStorage.removeItem(LOCAL_STORAGE_TITLE_KEY.value)
  } catch (error) {
    console.error('清除localStorage失败:', error)
  }
}

const editingItem = ref(null)
const selectedRange = ref(null)
const selectedTextItem = ref(null)
const isComposing = ref(false)
const showTableDialog = ref(false)
const tableRows = ref(3)
const tableCols = ref(3)
const currentTableIndex = ref(-1)
const showDynamicTextDialog = ref(false)
const currentDynamicText = ref(null)
const dynamicTextContent = ref('')
const selectionStart = ref(0)
const selectionEnd = ref(0)
const hasSelection = ref(false)
const dynamicTextEditor = ref(null)
const tableCellComposing = ref(false)
const isPreviewMode = ref(false)
const isPublishing = ref(false)

const showRichTextDialog = ref(false)
const richTextContent = ref('')
const richTextEditingItem = ref(null)
const showCellRichTextDialog = ref(false)
const currentCell = ref(null)
const currentCellContent = ref('')
const showTableEditorDialog = ref(false)
const editingTableItem = ref(null)
const tableEditorCells = ref([])
const showCellToolbar = ref(false)
const toolbarStyle = ref({})
const currentCellEl = ref(null)
const currentCellInfo = ref({ item: null, row: -1, col: -1 })
const resizingImage = ref(null)
const startImageResizePos = ref({ x: 0, y: 0, width: 0, height: 0 })

const clone = (item) => {
  if (item.type === 'table') {
    return { type: 'table', _isTemplate: true }
  }
  const clonedItem = JSON.parse(JSON.stringify(item))
  clonedItem.isSubmitted = false
  clonedItem.submitTime = null
  if (clonedItem.type === 'dynamic-text') {
    clonedItem.type = 'dynamic_text'
  }
  if (clonedItem.type === 'dynamic_text') {
    clonedItem.content = { text: '', blanks: [] }
    clonedItem.blanks = []
  }
  if (clonedItem.type === 'file') {
    clonedItem.isImage = true
  }
  if (clonedItem.type === 'file' && clonedItem.isImage) {
    clonedItem.imageName = ''
  }
  return clonedItem
}

const startEdit = (item) => {
  if (item.type === 'static-text') {
    richTextEditingItem.value = item
    richTextContent.value = item.content || ''
    showRichTextDialog.value = true
  }
}

const handleInput = (e) => {
  if (isComposing.value) return
  if (showDynamicTextDialog.value && dynamicTextEditor.value) {
    dynamicTextContent.value = e.target.innerText
    saveCaretPosition()
    restoreCaretPosition()
    return
  }
  if (selectedTextItem.value) {
    selectedTextItem.value.content = e.target.innerHTML
  }
}

const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = (e) => {
  isComposing.value = false
  handleInput(e)
}

const handleSelectionChange = () => {
  hasSelection.value = checkSelection()
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
    selectedRange.value = selection.getRangeAt(0)
  }
}

const checkSelection = () => {
  if (typeof window === 'undefined') return false
  const selection = window.getSelection()
  if (!selection) return false
  return selection.toString().trim() !== ''
}

const handleImageUpload = async (item, event) => {
  event.stopPropagation()
  event.preventDefault()

  if (item.type !== 'file' || !item.isImage) {
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.style.display = 'none'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const res = await uploadFileService('image', file)
      if (res.data && (res.data.code === 0 || res.data.code === 200) && res.data.data) {
        item.file = file
        item.url = res.data.data
        item.imageName = file.name
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error(res.data.message || '图片上传失败')
      }
    } catch (err) {
      console.error(err)
      ElMessage.error('图片上传失败')
    }
    document.body.removeChild(input)
  }

  document.body.appendChild(input)
  input.click()
}

const handleFileUpload = async (item, event) => {
  event.stopPropagation()
  if (item.type !== 'file') return

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.doc,.docx'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const res = await uploadFileService('file', file)
      if (res.data && (res.data.code === 0 || res.data.code === 200) && res.data.data) {
        item.file = file
        item.url = res.data.data
        ElMessage.success('文件上传成功')
      } else {
        ElMessage.error(res.data.message || '文件上传失败')
      }
    } catch (err) {
      console.error(err)
      ElMessage.error('文件上传失败')
    }
  }

  input.click()
}

const handleFilePreview = (item, event) => {
  event.stopPropagation()
  if (item.type !== 'file' || !item.url) return
  window.open(item.url, '_blank')
}

const handleDragEnd = (evt) => {
  const item = favoriteList.value[evt.newIndex]
  if (item.type === 'file' && !item.file) {
    handleFileUpload(item, new Event('click'))
  } else if (item.type === 'table') {
    currentTableIndex.value = evt.newIndex
    showTableDialog.value = true
    favoriteList.value.splice(evt.newIndex, 1)
  }
}

const createTable = () => {
  const rows = parseInt(tableRows.value)
  const cols = parseInt(tableCols.value)
  if (rows <= 0 || cols <= 0) return

  const tableData = {
    type: 'table',
    name: '表格',
    tableName: '',
    rows,
    cols,
    cells: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ content: '' })),
    ),
    width: 'auto',
    height: 200,
    isSubmitted: false,
    submitTime: null,
  }

  if (currentTableIndex.value !== -1) {
    favoriteList.value.splice(currentTableIndex.value, 0, tableData)
    currentTableIndex.value = -1
  } else {
    favoriteList.value.push(tableData)
  }

  showTableDialog.value = false
}

const deletePreviewItem = (index, event) => {
  event.stopPropagation()
  favoriteList.value.splice(index, 1)
}

const generateDirectory = computed(() => {
  const directory = []
  favoriteList.value.forEach((item, itemIndex) => {
    if (item.type === 'static-text' && item.content) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = item.content
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach((heading, idx) => {
        const level = Number(heading.tagName[1])
        const text = heading.textContent.trim()
        if (text) {
          heading.setAttribute('data-heading-id', `heading-${itemIndex}-${idx}`)
          directory.push({
            text,
            level,
            item,
            itemIndex,
            headingId: `heading-${itemIndex}-${idx}`,
          })
        }
      })
      item.content = tempDiv.innerHTML
    }
  })
  return directory
})

const isAllSubmitted = computed(() => {
  if (favoriteList.value.length === 0) return false
  return favoriteList.value.every((item) => item.isSubmitted)
})

const submitItem = async (item) => {
  if (item.type === 'file' && item.file && !item.url) {
    try {
      const res = await uploadFileService(item.isImage ? 'image' : 'file', item.file)
      if (res.data && (res.data.code === 0 || res.data.code === 200) && res.data.data) {
        item.url = res.data.data
        ElMessage.success(item.isImage ? '图片上传成功' : '文件上传成功')
      } else {
        ElMessage.error(res.data.message || (item.isImage ? '图片上传失败' : '文件上传失败'))
        return
      }
    } catch (e) {
      console.error(e)
      ElMessage.error(item.isImage ? '图片上传失败' : '文件上传失败')
      return
    }
  }
  if (!validateItemContent(item)) {
    ElMessage.warning('请填写完整内容后再提交')
    return
  }
  item.isSubmitted = true
  item.submitTime = new Date().toLocaleString()
  ElMessage.success('提交成功')
}

const cancelSubmit = (item) => {
  item.isSubmitted = false
  item.submitTime = null
}

const validateItemContent = (item) => {
  switch (item.type) {
    case 'static-text':
      return item.content && typeof item.content === 'string' && item.content.trim() !== ''
    case 'file':
      if (item.isImage) {
        return item.url !== ''
      } else {
        return item.file !== null
      }
    case 'table':
      let tableCells = Array.isArray(item.cells)
        ? item.cells
        : item.cells && Array.isArray(item.cells.cells)
          ? item.cells.cells
          : []
      if (!tableCells.length) return false
      return tableCells.some((row) =>
        row.some((cell) => cell.content && cell.content.trim() !== ''),
      )
    case 'dynamic_text':
      if (!item.content) return false
      if (typeof item.content === 'string') {
        return item.content.trim() !== ''
      } else if (typeof item.content === 'object') {
        return item.content.text && item.content.text.trim() !== ''
      }
      return false
    default:
      return true
  }
}

const previewHomework = () => {
  if (!isAllSubmitted.value) {
    ElMessage.warning('请确保所有组件都已提交后再预览')
    return
  }
  isPreviewMode.value = true
}

const exitPreview = () => {
  isPreviewMode.value = false
  editingItem.value = null
}

const validateAllComponents = () => {
  for (const item of favoriteList.value) {
    if (item.type === 'file' && !item.url) {
      if (item.isImage) {
        ElMessage.warning('请先上传所有图片后再发布！')
      } else {
        ElMessage.warning('请先上传所有文件后再发布！')
      }
      return false
    }
  }
  return true
}

const saveHomework = async () => {
  if (!validateAllComponents()) return
  if (!isAllSubmitted.value) {
    ElMessage.warning('请确保所有组件都已提交后再保存')
    return
  }
  if (!reportTitle.value.trim()) {
    ElMessage.warning('请输入实验报告标题')
    return
  }

  try {
    isPublishing.value = true
    const payload = {
      components: favoriteList.value.map((item, idx) => {
        const baseComponent = {
          positionX: item.positionX ?? 100,
          positionY: item.positionY ?? 100,
          width: parseInt(item.width) || 500,
          height: parseInt(item.height) || 200,
          sortOrder: idx + 1,
        }
        let content
        switch (item.type) {
          case 'dynamic_text':
            content = JSON.stringify({
              text: typeof item.content === 'object' ? item.content.text : item.content,
              blanks: Array.isArray(item.blanks) ? JSON.parse(JSON.stringify(item.blanks)) : [],
            })
            return {
              ...baseComponent,
              componentType: 'dynamic_text',
              content,
            }
          case 'static-text':
            return {
              ...baseComponent,
              componentType: 'static_text',
              content: JSON.stringify(item.content || ''),
            }
          case 'file':
            content = {
              url: item.url || '',
              type: item.isImage ? 'image' : 'file',
              name: item.file ? item.file.name : '',
              size: item.file ? item.file.size : 0,
              imageName: item.isImage ? item.imageName || '' : undefined,
            }
            return {
              ...baseComponent,
              componentType: item.isImage ? 'image' : 'file',
              content: JSON.stringify(content),
            }
          case 'table':
            content = {
              tableName: item.tableName || '',
              cells: item.cells || [],
            }
            return {
              ...baseComponent,
              componentType: 'table',
              content: JSON.stringify(content),
            }
          default:
            return { ...baseComponent, componentType: 'unknown', content: '""' }
        }
      }),
    }

    if (templateId) {
      // 如果已有templateId，直接保存内容
      const res = await saveTemplateContentService(courseId, templateId, payload)
      if (res.data.code === 200) {
        ElMessage.success('报告保存成功')
        clearLocalStorage()
      } else {
        ElMessage.error(res.data.message || '保存失败')
      }
    } else {
      // 如果没有templateId，先创建基本信息，再保存内容
      const newTemplateId = await templateStore.createTemplateBasic(courseId, {
        name: reportTitle.value,
        classIds: [], // 暂时不发布到任何班级
      })

      if (newTemplateId) {
        const res = await saveTemplateContentService(courseId, newTemplateId, payload)
        if (res.data.code === 200) {
          ElMessage.success('报告创建并保存成功')
          clearLocalStorage()
          // 更新路由参数，这样用户就可以继续编辑
          router.replace({
            name: 'BaoGao',
            params: { id: courseId, templateId: newTemplateId },
          })
        } else {
          ElMessage.error(res.data.message || '保存失败')
        }
      } else {
        ElMessage.error('创建报告失败')
      }
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    isPublishing.value = false
  }
}

const scrollToHeading = (entry) => {
  if (isPreviewMode.value) {
    exitPreview()
    nextTick(() => {
      scrollToElement(entry)
    })
  } else {
    scrollToElement(entry)
  }
}

const scrollToElement = (entry) => {
  const itemElement = document.querySelector(
    `.preview-container .list-item:nth-child(${entry.itemIndex + 1})`,
  )
  if (itemElement) {
    const heading = itemElement.querySelector(`[data-heading-id='${entry.headingId}']`)
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'center' })
      heading.classList.add('highlight-item')
      setTimeout(() => heading.classList.remove('highlight-item'), 2000)
    } else {
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const startDynamicTextEdit = (item) => {
  if (item.type === 'dynamic_text') {
    currentDynamicText.value = item
    dynamicTextContent.value =
      item.content && typeof item.content === 'object' ? item.content.text : item.content || ''
    showDynamicTextDialog.value = true
  }
}

const markAsBlank = () => {
  if (typeof window === 'undefined') return
  const selection = window.getSelection()
  if (!selection) return

  const selectedText = selection.toString().trim()
  if (!selectedText) return

  const editor = document.querySelector('.dynamic-text-editor')
  if (!editor) return

  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(editor)
  preCaretRange.setEnd(range.startContainer, range.startOffset)
  selectionStart.value = preCaretRange.toString().length
  selectionEnd.value = selectionStart.value + selectedText.length

  const blankId = Date.now()
  const blankMark = `[blank-${blankId}]`

  const content = editor.innerText
  const newContent =
    content.substring(0, selectionStart.value) + blankMark + content.substring(selectionEnd.value)

  if (currentDynamicText.value) {
    if (!currentDynamicText.value.blanks) {
      currentDynamicText.value.blanks = []
    }
    currentDynamicText.value.blanks.push({
      id: blankId,
      originalText: selectedText,
      answer: '',
    })
    if (currentDynamicText.value.content && typeof currentDynamicText.value.content === 'object') {
      currentDynamicText.value.content.blanks = currentDynamicText.value.blanks
    }
  }

  editor.innerText = newContent
  dynamicTextContent.value = newContent
}

const saveDynamicText = () => {
  if (currentDynamicText.value) {
    if (!Array.isArray(currentDynamicText.value.blanks)) {
      if (typeof currentDynamicText.value.blanks === 'string') {
        try {
          currentDynamicText.value.blanks = JSON.parse(currentDynamicText.value.blanks)
        } catch {
          currentDynamicText.value.blanks = []
        }
      } else {
        currentDynamicText.value.blanks = []
      }
    }
    currentDynamicText.value.content = {
      text: typeof dynamicTextContent.value === 'string' ? dynamicTextContent.value : '',
      blanks: currentDynamicText.value.blanks,
    }
    currentDynamicText.value.blanks = currentDynamicText.value.content.blanks
    const idx = favoriteList.value.findIndex((i) => i === currentDynamicText.value)
    if (idx !== -1) {
      favoriteList.value[idx].content = currentDynamicText.value.content
      favoriteList.value[idx].blanks = currentDynamicText.value.blanks
      if (favoriteList.value[idx].content && typeof favoriteList.value[idx].content === 'object') {
        favoriteList.value[idx].content.blanks = currentDynamicText.value.blanks
      }
    }
    showDynamicTextDialog.value = false
  }
}

const renderDynamicText = (content, blanks) => {
  let text = typeof content === 'object' && content !== null ? content.text : content
  if (!text || typeof text !== 'string') return ''

  let blanksArray = blanks || []
  if (!Array.isArray(blanksArray)) {
    try {
      blanksArray = JSON.parse(blanksArray)
    } catch (e) {
      blanksArray = []
    }
  }

  if (blanksArray.length === 0) {
    return text.replace(/\[blank-(\d+)\]/g, (match, id) => {
      return `<span class="blank-placeholder" data-blank-id="${id}">________</span>`
    })
  }

  return text.replace(/\[blank-(\d+)\]/g, (match, id) => {
    const blank = blanksArray.find((b) => String(b.id) === id)
    if (blank) {
      return `<span class="blank-placeholder" data-blank-id="${id}">${blank.answer || '________'}</span>`
    }
    return `<span class="blank-placeholder" data-blank-id="${id}">________</span>`
  })
}

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

    let currentNode = editor.firstChild

    if (currentNode && currentNode.nodeType === Node.TEXT_NODE) {
      if (selectionStart.value <= currentNode.length) {
        range.setStart(currentNode, selectionStart.value)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        return
      }
    }

    if (selectionStart.value === 0) {
      range.setStart(editor, 0)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  })
}

const saveRichText = () => {
  if (richTextEditingItem.value) {
    richTextEditingItem.value.content = richTextContent.value
    nextTick(() => {
      const index = favoriteList.value.findIndex((item) => item === richTextEditingItem.value)
      if (index !== -1) {
        favoriteList.value[index] = { ...richTextEditingItem.value }
      }
    })
  }
  showRichTextDialog.value = false
  richTextEditingItem.value = null
}

const handleCellRichEdit = (rowIndex, colIndex, tableItem) => {
  currentCell.value = tableItem.cells[rowIndex][colIndex]
  currentCellContent.value = currentCell.value.content || ''
  showCellRichTextDialog.value = true
}

const saveCellRichText = () => {
  if (currentCell.value) {
    currentCell.value.content = currentCellContent.value
  }
  showCellRichTextDialog.value = false
}

const onTableEditorConfirm = (cells) => {
  if (editingTableItem.value) {
    editingTableItem.value.cells = cells
    editingTableItem.value.isSubmitted = false
  }
  showTableEditorDialog.value = false
  editingTableItem.value = null
}

watch(
  favoriteList,
  (val) => {
    val.forEach((item, idx) => {
      if (item.type === 'table' && item._isTemplate) {
        currentTableIndex.value = idx
        showTableDialog.value = true
        favoriteList.value.splice(idx, 1)
      }
    })
  },
  { deep: true },
)

const handleTablePlaceholderClick = (idx) => {
  currentTableIndex.value = idx
  showTableDialog.value = true
}

const onTableCellInput = (e, tableItem, rowIndex, colIndex) => {
  if (tableCellComposing.value) return
  const el = e.target
  el.querySelectorAll('span[style*="background-color: yellow"]').forEach((span) => {
    if (!span.textContent.trim()) {
      const selection = window.getSelection()
      if (selection && selection.anchorNode && span.contains(selection.anchorNode)) {
        const range = document.createRange()
        range.setStartAfter(span)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        const zwsp = document.createTextNode('\u200B')
        range.insertNode(zwsp)
        range.setStartAfter(zwsp)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      span.parentNode.removeChild(span)
    }
  })
  tableItem.cells[rowIndex][colIndex].content = el.innerHTML
}

const onTableCellCompositionStart = () => {
  tableCellComposing.value = true
}

const onTableCellCompositionEnd = (e, tableItem, rowIndex, colIndex) => {
  tableCellComposing.value = false
  tableItem.cells[rowIndex][colIndex].content = e.target.innerHTML
}

const setCellContent = (el, content) => {
  if (el && el.innerHTML !== content) {
    el.innerHTML = content || ''
  }
}

const onCellFocus = (e, item, rowIndex, colIndex) => {
  currentCellEl.value = e.target
  currentCellInfo.value = { item, row: rowIndex, col: colIndex }
  showCellToolbar.value = true
  const rect = e.target.getBoundingClientRect()
  toolbarStyle.value = {
    position: 'fixed',
    top: `${rect.top - 38}px`,
    left: `${rect.left}px`,
    zIndex: 9999,
  }
}

const onCellBlur = (e) => {}

const handleGlobalClick = (e) => {
  if (
    !currentCellEl.value ||
    (!currentCellEl.value.contains(e.target) &&
      !document.querySelector('.cell-toolbar')?.contains(e.target))
  ) {
    showCellToolbar.value = false
    currentCellEl.value = null
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleGlobalClick)
  window.addEventListener('scroll', hideToolbar)
  window.addEventListener('resize', hideToolbar)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleGlobalClick)
  window.removeEventListener('scroll', hideToolbar)
  window.removeEventListener('resize', hideToolbar)
})

const execCellCmd = (cmd, value) => {
  if (currentCellEl.value) {
    currentCellEl.value.focus()
    document.execCommand(cmd, false, value)
    const { item, row, col } = currentCellInfo.value
    if (item && row >= 0 && col >= 0) {
      item.cells[row][col].content = currentCellEl.value.innerHTML
    }
  }
}

const hideToolbar = () => {
  showCellToolbar.value = false
}

const startImageResize = (item, event) => {
  resizingImage.value = item
  startImageResizePos.value = {
    x: event.clientX,
    y: event.clientY,
    width: parseInt(item.width) || 400,
    height: parseInt(item.height) || 300,
  }
  document.addEventListener('mousemove', onImageResizing)
  document.addEventListener('mouseup', stopImageResize)
}

const onImageResizing = (event) => {
  if (!resizingImage.value) return
  const dx = event.clientX - startImageResizePos.value.x
  const dy = event.clientY - startImageResizePos.value.y
  resizingImage.value.width = Math.max(50, startImageResizePos.value.width + dx) + 'px'
  resizingImage.value.height = Math.max(30, startImageResizePos.value.height + dy) + 'px'
}

const stopImageResize = () => {
  resizingImage.value = null
  document.removeEventListener('mousemove', onImageResizing)
  document.removeEventListener('mouseup', stopImageResize)
}

const getPreviewTableStyle = (item) => {
  const colCount = item.cells?.[0]?.length || 0
  const isWide = colCount > 6

  if (typeof item.width === 'number') {
    return {
      width: `${item.width}px`,
      height: typeof item.height === 'number' ? `${item.height}px` : item.height || 'auto',
      tableLayout: 'fixed',
    }
  }

  if (isWide) {
    return {
      width: '100%',
      height: typeof item.height === 'number' ? `${item.height}px` : item.height || 'auto',
      tableLayout: 'fixed',
    }
  } else {
    return {
      width: 'auto',
      height: typeof item.height === 'number' ? `${item.height}px` : item.height || 'auto',
      tableLayout: 'auto',
    }
  }
}

const extractTextFromHtml = (html) => {
  if (!html) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

const getPreviewCellClass = (cell) => {
  if (!cell || !cell.content) {
    return ''
  }
  const text = extractTextFromHtml(cell.content)
  if (text.length > 4 && !cell.content.includes('<p>') && !cell.content.includes('<br>')) {
    return 'vertical-text-cell'
  }
  return ''
}

watch(tableRows, (val) => {
  if (val > MAX_TABLE_ROWS) {
    ElMessage.warning('最大支持20行，请重新输入')
    tableRows.value = MAX_TABLE_ROWS
  }
})

watch(tableCols, (val) => {
  if (val > MAX_TABLE_COLS) {
    ElMessage.warning(`最大支持${MAX_TABLE_COLS}列，请重新输入`)
    tableCols.value = MAX_TABLE_COLS
  }
})

const handleBack = () => {
  ElMessageBox.confirm('确定要返回吗？未保存的内容将会丢失，请先点击保存按钮。', '提示', {
    confirmButtonText: '确定返回',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      router.back()
    })
    .catch(() => {})
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="260px" class="side-bar">
      <el-card class="side-card" header="实验报告" shadow="never">
        <div class="report-title-section">
          <h4 class="section-title">实验报告标题</h4>
          <div class="title-input-container">
            <el-input
              v-model="reportTitle"
              placeholder="请输入实验报告标题"
              clearable
              :maxlength="50"
              show-word-limit
              @keyup.enter="saveReportTitle"
            >
              <template #append>
                <el-button type="primary" @click="saveReportTitle">保存标题</el-button>
              </template>
            </el-input>
            <div v-if="titleSaved" class="title-saved-tip">
              <el-tag type="success" size="small">标题已保存</el-tag>
            </div>
          </div>
        </div>

        <div class="directory-section">
          <h4 class="directory-title">目录</h4>
          <div class="directory-list">
            <div
              v-for="(entry, index) in generateDirectory"
              :key="index"
              class="directory-item"
              @click="scrollToHeading(entry)"
            >
              <span
                :class="['directory-text', `level-${entry.level}`]"
                :style="{ marginLeft: `${entry.level * 10}px` }"
              >
                {{ entry.text }}
              </span>
            </div>
            <div v-if="generateDirectory.length === 0" class="empty-directory">
              <el-empty description="暂无内容，从编辑区拖入组件" />
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button
            type="primary"
            :disabled="!isAllSubmitted"
            @click="previewHomework"
            :class="{ 'active-button': isAllSubmitted }"
          >
            <el-icon><View /></el-icon>
            预览报告
          </el-button>
          <el-button
            type="success"
            :disabled="!isAllSubmitted || isPublishing"
            @click="saveHomework"
            :loading="isPublishing"
            :class="{ 'active-button': isAllSubmitted }"
          >
            <el-icon><Check /></el-icon>
            {{ templateId ? '保存报告' : '保存报告' }}
          </el-button>
        </div>
      </el-card>
    </el-aside>

    <el-container>
      <el-header class="header-bar">
        <el-card class="box-card" header="组件区">
          <div class="edit-area-container">
            <VueDraggable
              v-model="editTools"
              :group="{ name: 'skills', pull: 'clone', put: false }"
              :sort="false"
              :clone="clone"
              item-key="type"
              class="toolbar-container"
            >
              <div v-for="(item, index) in editTools" :key="index" class="tool-item">
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
        </el-card>
      </el-header>

      <el-main class="main-content">
        <el-card class="box-card" header="编辑区">
          <VueDraggable
            v-model="favoriteList"
            group="skills"
            item-key="type"
            class="preview-container"
            @end="handleDragEnd"
            :delay="200"
            :delay-on-touch-only="true"
          >
            <div
              v-for="(item, index) in favoriteList"
              :key="index"
              class="list-item"
              @dblclick="item.type === 'static-text' && !item.isSubmitted ? startEdit(item) : null"
            >
              <div class="item-content">
                <el-button
                  v-if="!isPreviewMode"
                  class="delete-btn"
                  type="danger"
                  size="small"
                  circle
                  @click.stop="deletePreviewItem(index, $event)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>

                <div v-if="!isPreviewMode" class="item-action">
                  <div v-if="item.isSubmitted" class="submit-info">
                    <el-tag type="success" size="small">已提交</el-tag>
                    <span class="submit-time">{{ item.submitTime }}</span>
                    <el-button type="text" @click.stop="cancelSubmit(item)">取消提交</el-button>
                  </div>
                  <el-button v-else type="primary" size="small" @click.stop="submitItem(item)">
                    提交
                  </el-button>
                </div>

                <template v-if="item.type === 'static-text'">
                  <div v-if="editingItem === item && !isPreviewMode"></div>
                  <div
                    v-else
                    class="ql-editor"
                    :id="`content-${index}`"
                    v-html="item.content"
                  ></div>
                </template>

                <template v-else-if="item.type === 'file' && item.isImage">
                  <div>
                    <div
                      v-if="item.url"
                      class="image-preview"
                      style="cursor: default; position: relative"
                    >
                      <div class="image-container" style="position: relative">
                        <img
                          :src="item.url"
                          alt="上传的图片"
                          class="uploaded-image"
                          style="
                            max-width: 100%;
                            max-height: 600px;
                            object-fit: contain;
                            display: block;
                            margin: 0 auto;
                          "
                        />
                      </div>
                    </div>
                    <div
                      v-else
                      class="upload-placeholder"
                      @click.stop="handleImageUpload(item, $event)"
                      @dblclick.stop="handleImageUpload(item, $event)"
                    >
                      <el-icon :size="24">
                        <Picture />
                      </el-icon>
                      <span>点击上传图片</span>
                    </div>
                    <div v-if="!isPreviewMode">
                      <el-input
                        v-model="item.imageName"
                        :disabled="item.isSubmitted"
                        placeholder="请输入图片名称"
                        size="small"
                        style="width: 300px; margin: 8px auto 0 auto; display: block"
                      />
                    </div>
                    <div v-else-if="item.imageName || (item.file && item.file.name)">
                      <div class="image-title-text">
                        {{ item.imageName || (item.file && item.file.name) }}
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else-if="item.type === 'file' && item.file">
                  <div class="preview-file">
                    <div class="file-icon">
                      <el-icon :size="24"><Document /></el-icon>
                    </div>
                    <div class="file-info">
                      <div class="file-name">{{ item.file.name }}</div>
                      <div class="file-size">{{ (item.file.size / 1024).toFixed(2) }} KB</div>
                    </div>
                    <el-button
                      type="primary"
                      size="small"
                      @click.stop="handleFilePreview(item, $event)"
                    >
                      查看
                    </el-button>
                  </div>
                </template>

                <template v-else-if="item.type === 'table'">
                  <div class="table-container table-container-col">
                    <div v-if="!isPreviewMode" class="table-title-edit-center">
                      <el-input
                        v-model="item.tableName"
                        :disabled="item.isSubmitted"
                        placeholder="请输入表格名称"
                        size="small"
                        :style="{
                          width: '100%',
                          marginBottom: '8px',
                          textAlign: 'center',
                        }"
                      />
                    </div>
                    <div v-else-if="item.tableName" class="table-title-preview">
                      <div class="table-title-text">{{ item.tableName }}</div>
                    </div>
                    <div
                      v-if="!isPreviewMode"
                      style="
                        max-height: 400px;
                        overflow: auto;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                      "
                    >
                      <ResizableTable
                        :cells="
                          Array.isArray(item.cells)
                            ? item.cells
                            : item.cells && item.cells.cells
                              ? item.cells.cells
                              : []
                        "
                      >
                        <template #cell="{ cell, rowIndex, colIndex }">
                          <div
                            class="table-cell-content"
                            :class="{ 'readonly-cell': item.isSubmitted }"
                            :contenteditable="!item.isSubmitted"
                            :id="`table-cell-${index}-${rowIndex}-${colIndex}`"
                            @focus="
                              !item.isSubmitted && onCellFocus($event, item, rowIndex, colIndex)
                            "
                            @blur="!item.isSubmitted && onCellBlur"
                            @input="
                              !item.isSubmitted &&
                              onTableCellInput($event, item, rowIndex, colIndex)
                            "
                            @compositionstart="!item.isSubmitted && onTableCellCompositionStart"
                            @compositionend="
                              !item.isSubmitted &&
                              onTableCellCompositionEnd($event, item, rowIndex, colIndex)
                            "
                            :ref="(el) => setCellContent(el, cell.content)"
                            style="min-height: 32px"
                          ></div>
                        </template>
                      </ResizableTable>
                    </div>
                    <div v-else style="width: 100%; overflow-x: auto">
                      <table
                        class="preview-html-table"
                        style="
                          width: auto;
                          max-width: 100%;
                          margin: 0 auto;
                          border-collapse: collapse;
                        "
                      >
                        <tr
                          v-for="(row, rowIndex) in Array.isArray(item.cells)
                            ? item.cells
                            : item.cells && item.cells.cells
                              ? item.cells.cells
                              : []"
                          :key="rowIndex"
                        >
                          <td v-for="(cell, colIndex) in row" :key="colIndex">
                            <div v-html="cell.content"></div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </template>

                <template v-else-if="item.type === 'dynamic_text'">
                  <div class="dynamic-text-container" @click.stop="startDynamicTextEdit(item)">
                    <template
                      v-if="
                        !item.content || (typeof item.content === 'object' && !item.content.text)
                      "
                    >
                      <div class="empty-dynamic-text">
                        <el-icon><Document /></el-icon>
                        <span>点击编辑动态文本</span>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        class="dynamic-text-content"
                        v-html="
                          renderDynamicText(
                            typeof item.content === 'object' ? item.content.text : item.content,
                            typeof item.content === 'object' ? item.content.blanks : item.blanks,
                          )
                        "
                      ></div>
                      <el-button v-if="!isPreviewMode" type="primary" size="small">
                        编辑动态文本
                      </el-button>
                    </template>
                  </div>
                </template>

                <span v-else class="item-text">{{ item.name }}</span>
              </div>
            </div>
          </VueDraggable>
        </el-card>
      </el-main>
    </el-container>

    <el-dialog v-model="showTableDialog" title="插入表格" width="400px">
      <div class="table-dialog-content">
        <div class="table-size-selector">
          <div class="size-input">
            <span class="input-label">行数:</span>
            <el-input-number v-model="tableRows" :min="1" :max="20" />
          </div>
          <div class="size-input">
            <span class="input-label">列数:</span>
            <el-input-number v-model="tableCols" :min="1" :max="MAX_TABLE_COLS" />
          </div>
        </div>
        <div class="table-preview">
          <table class="preview-table">
            <tr v-for="row in Math.min(tableRows, 10)" :key="row">
              <td v-for="col in Math.min(tableCols, 10)" :key="col"></td>
            </tr>
          </table>
          <!-- <div v-if="tableRows > 10 || tableCols > 10" class="preview-hint">
            (预览只显示前10行10列)
          </div> -->
        </div>
      </div>
      <template #footer>
        <el-button @click="showTableDialog = false">取消</el-button>
        <el-button type="primary" @click="createTable">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="isPreviewMode" title="作业预览" fullscreen :before-close="exitPreview">
      <div class="preview-mode-container">
        <div class="preview-header">
          <h1 class="preview-title">作业预览</h1>
        </div>
        <el-button class="preview-close-btn" type="default" @click="exitPreview"
          >关闭预览</el-button
        >
        <div class="richtext-paper">
          <div class="report-title-display" v-if="reportTitle">
            <h1>{{ reportTitle }}</h1>
          </div>

          <div v-for="(item, index) in favoriteList" :key="index" class="preview-item">
            <template v-if="item.type === 'static-text'">
              <div class="ql-editor item-text" v-html="item.content"></div>
            </template>
            <template v-else-if="item.type === 'file' && item.isImage && item.url">
              <div class="preview-image">
                <img
                  :src="item.url"
                  alt="图片"
                  :style="{
                    maxWidth: '100%',
                    maxHeight: '600px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }"
                />
              </div>
              <div v-if="item.imageName || (item.file && item.file.name)" class="image-title-text">
                {{ item.imageName || (item.file && item.file.name) }}
              </div>
            </template>
            <template v-else-if="item.type === 'file' && item.file">
              <div class="preview-file">
                <div class="file-icon">
                  <el-icon :size="24"><Document /></el-icon>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ item.file.name }}</div>
                  <div class="file-size">{{ (item.file.size / 1024).toFixed(2) }} KB</div>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="handleFilePreview(item, $event)"
                >
                  查看
                </el-button>
              </div>
            </template>
            <template v-else-if="item.type === 'table' && item.cells">
              <div class="preview-table">
                <div
                  v-if="item.tableName || (item.cells && item.cells.tableName)"
                  class="table-title-text"
                >
                  {{ item.tableName || (item.cells && item.cells.tableName) }}
                </div>
                <table class="table preview-html-table" :style="getPreviewTableStyle(item)">
                  <tr
                    v-for="(row, rowIndex) in Array.isArray(item.cells)
                      ? item.cells
                      : item.cells && item.cells.cells
                        ? item.cells.cells
                        : []"
                    :key="rowIndex"
                  >
                    <td v-for="(cell, colIndex) in row" :key="colIndex">
                      <div v-html="cell.content"></div>
                    </td>
                  </tr>
                </table>
              </div>
            </template>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showDynamicTextDialog"
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
          v-text="dynamicTextContent"
        ></div>
        <div class="edit-actions">
          <el-button type="primary" @click="markAsBlank" :disabled="!hasSelection">
            标记为填空
          </el-button>
        </div>
        <div class="blanks-preview" v-if="currentDynamicText?.blanks?.length">
          <h4>已创建的填空：</h4>
          <ul>
            <li v-for="blank in currentDynamicText.blanks" :key="blank.id">
              原文：{{ blank.originalText }}
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDynamicTextDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDynamicText">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showRichTextDialog"
      title="富文本编辑"
      width="900px"
      destroy-on-close
      class="rich-text-dialog"
    >
      <RichTextEditor v-model="richTextContent" style="min-height: 300px" />
      <template #footer>
        <el-button @click="showRichTextDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRichText">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCellRichTextDialog" title="编辑单元格内容" width="700px">
      <RichTextEditor v-model="currentCellContent" />
      <template #footer>
        <el-button @click="showCellRichTextDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCellRichText">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showTableEditorDialog" title="表格编辑器" width="900px" destroy-on-close>
      <TableEditor
        v-model:cells="tableEditorCells"
        @confirm="onTableEditorConfirm"
        @cancel="showTableEditorDialog = false"
      />
    </el-dialog>

    <div v-if="showCellToolbar" class="cell-toolbar" :style="toolbarStyle">
      <button @mousedown.prevent="execCellCmd('bold')"><b>B</b></button>
      <button @mousedown.prevent="execCellCmd('underline')"><u>U</u></button>
    </div>
  </el-container>
</template>

<style>
.layout-container {
  height: 100vh;
  overflow: auto;
}

.side-bar {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.side-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: none;
  height: 100%;
}

.side-card :deep(.el-card__body) {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.directory-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.directory-title {
  color: #606266;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
}

.directory-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.directory-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
}

.directory-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.directory-text {
  color: #303133;
  font-size: 14px;
  flex: 1;
}

.empty-directory {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-bar {
  height: 180px !important;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  padding: 10px;
}

.main-content {
  background-color: #fafafa;
  padding: 20px;
  margin-top: 100px;
  height: calc(100vh - 180px);
  overflow: auto;
}

.edit-area-container {
  display: flex;
  gap: 20px;
}

.toolbar-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
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
  padding: 0 0 10px 0;
  min-height: 24px;
  line-height: 1.5;
  white-space: pre-wrap;
  text-align: left;
  word-break: break-word;
  overflow-wrap: break-word;
}

.preview-container {
  min-height: 500px;
  overflow-y: auto;
  max-height: 70vh;
}

.list-item {
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.image-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.image-container {
  position: relative;
  display: inline-block;
  margin: 0 auto;
  max-width: 100%;
  user-select: none;
}

.image-container.resizing {
  pointer-events: none;
}

.uploaded-image {
  display: block;
  max-width: 100%;
  max-height: 600px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  object-fit: contain;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
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

.table-container {
  width: 100%;
  overflow: visible;
  margin-bottom: 20px;
  position: relative;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.table-container.resizing {
  pointer-events: none;
  cursor: grabbing;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.table-container.resizing * {
  user-select: none;
}

.editable-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  transition: none;
  max-width: fit-content;
}

.editable-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  min-width: 80px;
  height: 40px;
  cursor: text;
  position: relative;
  text-align: center;
  word-break: break-all;
  font-size: 16px;
  vertical-align: middle;
}

.editable-table td:hover {
  background-color: #f5f7fa;
}

.table-cell-content {
  min-height: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

.table-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #f8f9fa;
}

.table-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #f0f9ff;
}

.table-placeholder span {
  margin-top: 10px;
  font-size: 14px;
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
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.preview-table {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  max-width: 794px;
  margin: 0 auto;
  box-sizing: border-box;
}

.table-title-text {
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  margin-bottom: 8px;
}

.preview-html-table {
  border-collapse: collapse;
  border: 1px solid #dcdfe6;
  display: table;
  width: 100%;
  table-layout: fixed;
  max-width: 100%;
  margin: 0 auto;
}

.preview-html-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  min-width: 80px;
  height: 40px;
  position: relative;
  text-align: center;
  vertical-align: middle;
  font-size: 16px;
  word-break: break-all;
}

.preview-hint {
  font-size: 12px;
  color: #909399;
}

.delete-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.3s;
}

.list-item:hover .delete-btn {
  opacity: 1;
}

.editable-div {
  width: 736px;
  min-width: 736px;
  max-width: 736px;
  min-height: 100px;
  padding: 5px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  text-align: left;
  margin: 0 auto;
  font-size: 16px;
  font-family: '黑体', '微软雅黑', '宋体', Arial, sans-serif;
  line-height: 1.8;
}

.level-1 {
  font-weight: bold;
  font-size: 18px;
}

.level-2 {
  font-weight: bold;
  font-size: 16px;
  margin-left: 10px;
}

.level-3 {
  font-weight: bold;
  font-size: 14px;
  margin-left: 20px;
}

.level-4 {
  font-weight: bold;
  font-size: 13px;
  margin-left: 30px;
}

.level-5 {
  font-weight: bold;
  font-size: 12px;
  margin-left: 40px;
}

.edit-container {
  width: 100%;
  padding: 8px 0;
  max-width: 170mm;
  margin: 0 auto;
  box-sizing: border-box;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.active-button {
  background-color: #409eff;
  border-color: #409eff;
}

.preview-mode-container {
  padding: 32px 0;
  margin: 0 auto;
  background-color: #f4f5f7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  max-width: 210mm;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.preview-title {
  font-size: 18px;
  font-weight: bold;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: #303133;
  padding: 0;
  margin: 0;
  text-align: left;
}

.preview-text [data-level] {
  font-weight: bold !important;
  font-size: inherit !important;
}

.preview-image {
  width: 100%;
  display: flex;
  justify-content: center;
}

.preview-file {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f8f9fa;
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
}

.file-size {
  font-size: 12px;
  color: #606266;
}

.preview-table {
  width: 100%;
  overflow-x: auto;
  padding: 10px 0;
}

.preview-html-table {
  border-collapse: collapse;
  border: 1px solid #dcdfe6;
  display: table;
  width: 100%;
  table-layout: fixed;
  max-width: 100%;
  margin: 0 auto;
}
.preview-html-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  min-width: 80px;
  height: 40px;
  position: relative;
  text-align: center;
  vertical-align: middle;
  font-size: 16px;
  word-break: break-all;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  min-width: 80px;
  height: 40px;
  cursor: text;
  position: relative;
}

.table td:hover {
  background-color: #f5f7fa;
}

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

.preview-item .item-text {
  font-size: 16px;
  font-family: '黑体', '微软雅黑', '宋体', Arial, sans-serif;
  line-height: 1.8;
  width: 736px;
  max-width: 736px;
  min-width: 736px;
  margin: 0 auto;
  white-space: pre-wrap;
  word-break: break-all;
  box-sizing: border-box;
  padding: 0;
}

.preview-table .table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.preview-table .table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  min-width: 80px;
  height: 40px;
}

.preview-table .table {
  max-width: 100%;
}

.list-item .item-content {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
  max-width: 170mm;
  margin: 0 auto;
}

.main-content .box-card {
  width: 100%;
  max-width: 210mm;
  margin: 0 auto;
}

.title-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-saved-tip {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.report-title-display {
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
}

.report-title-display h1 {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 20px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.table-container {
  width: 100%;
  overflow: visible;
  margin-bottom: 20px;
  position: relative;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.table-container.resizing {
  pointer-events: none;
  cursor: grabbing;
}

.table-container.resizing * {
  user-select: none;
}

.resize-handle {
  position: absolute;
  background-color: #409eff;
  border-radius: 50%;
  z-index: 100;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.left {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  cursor: w-resize;
}

.editable-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  transition: none;
  max-width: fit-content;
}

.class-select-container {
  padding: 20px 10px;
}

.dialog-tip {
  margin-bottom: 15px;
  color: #606266;
  font-size: 14px;
}

.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.el-checkbox {
  margin-right: 0;
}

.richtext-paper {
  max-width: 794px;
  min-width: 794px;
  min-height: 1123px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  padding: 48px 60px 48px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  gap: 10px;
}

.cell-toolbar {
  display: flex;
  gap: 4px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 4px 8px;
  align-items: center;
  z-index: 9999;
}
.cell-toolbar button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  padding: 2px 6px;
  border-radius: 2px;
  transition: background 0.2s;
}
.cell-toolbar button:hover {
  background: #f0f0f0;
}

.preview-html-table {
  border-collapse: collapse;
  border: 1px solid #dcdfe6;
  display: inline-table;
  max-width: 100%;
}
.preview-html-table td {
  border: 1px solid #dcdfe6;
  padding: 8px;
  min-width: 40px;
  height: 40px;
  position: relative;
  text-align: center;
  vertical-align: middle;
  word-break: break-all;
}

.preview-html-table td.vertical-text-cell {
  padding: 8px 4px;
}

.preview-html-table td.vertical-text-cell > div {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  white-space: nowrap;
  letter-spacing: 2px;
  display: inline-block;
  line-height: 1.2;
}

.image-resize-handle {
  width: 18px;
  height: 18px;
  position: absolute;
  right: 0;
  bottom: 0;
  cursor: se-resize;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.rich-text-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 0;
  }
}

.ql-editor {
  width: 736px !important;
  max-width: 736px !important;
  min-width: 736px !important;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.8;
  font-family: '黑体', '微软雅黑', '宋体', Arial, sans-serif;
  text-align: left !important;
  box-sizing: border-box;
  padding: 0 !important;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.readonly-cell {
  background: #f5f5f5;
  cursor: not-allowed;
  pointer-events: none;
}

.table-title-text {
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  margin-bottom: 8px;
}
.image-title-text {
  font-size: 15px;
  color: #666;
  text-align: center;
  margin-top: 8px;
}

.table-title-edit-center {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.table-container-col {
  flex-direction: column;
  align-items: center;
  display: flex;
}

.table-cell-content {
  resize: none !important;
  overflow: auto;
  outline: none;
}

.preview-close-btn {
  position: fixed;
  top: 32px;
  right: 48px;
  z-index: 2000;
  background: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  font-size: 15px;
  padding: 8px 18px;
  transition: background 0.2s;
}
.preview-close-btn:hover {
  background: #f5f7fa;
  border-color: #409eff;
  color: #409eff;
}
.richtext-paper {
  max-width: 794px;
  min-width: 794px;
  width: 100%;
  margin: 0 auto;
  background: #fff;
}

.preview-table {
  width: 100%;
  display: block;
  margin: 0 auto;
}

.preview-html-table {
  border-collapse: collapse;
  border: 1px solid #dcdfe6;
  display: table;
  margin: 0 auto;
  /* 不要写 width/table-layout，全部交给 :style 控制 */
}

.preview-html-table td {
  min-width: 40px;
  padding: 8px;
  height: 40px;
  border: 1px solid #dcdfe6;
  text-align: center;
}
</style>
