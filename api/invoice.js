import request from '@/utils/request'

/**
 * 获取发票列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.size - 每页大小
 * @param {string} params.payerName - 付款人姓名（可选）
 * @param {string} params.beneficiaryName - 收款人姓名（可选）
 * @returns {Promise} 返回发票列表数据
 */
export function getInvoiceList(params) {
  return request({
    url: '/api/invoices',
    method: 'get',
    params,
  })
}

/**
 * 创建发票
 * @param {Object} data - 发票数据
 * @param {string} data.payerName - 付款人姓名
 * @param {string} data.beneficiaryName - 收款人姓名
 * @param {string} data.goodsName - 货物信息
 * @param {number} data.goodsPrice - 单价
 * @param {number} data.goodsQuantity - 数量
 * @param {number} data.goodsTotalPrice - 总价
 * @returns {Promise} 返回创建结果
 */
export function createInvoiceService(data) {
  return request({
    url: '/api/invoices',
    method: 'post',
    data,
  })
}

/**
 * 从测试演示接口获取数据
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.size - 每页大小
 * @param {string} params.payer - 付款人姓名（可选）
 * @param {string} params.payee - 收款人姓名（可选）
 * @returns {Promise} 返回测试数据
 */
export function getTestDemoData(params) {
  console.log('调用API: /test-demo/page, 参数:', params)
  return request({
    url: '/test-demo/page',
    method: 'get',
    params,
    validateStatus: (status) => {
      console.log('API响应状态码:', status)
      return status >= 200 && status < 300
    },
  })
}
