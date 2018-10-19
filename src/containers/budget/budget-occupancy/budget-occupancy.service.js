import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //获取占用调整列表
  getOccupancyList(page, size, searchParams) {
    let url = `${config.budgetUrl}/api/budget/reserve/adjust?page=${page}&size=${size}`;
    for(let paramsName in searchParams) {
      url += searchParams[paramsName] ? `&${paramsName}=${searchParams[paramsName]}` : ''
    }
    return httpFetch.get(url)
  },

  //获取导入信息
  getImporterInfo(page, size) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/reserve/adjust/import/data?page=${page}&size=${size}`)
  },

  //新建占用调整
  newOccupancy(params) {
    return httpFetch.post(`${config.budgetUrl}/api/budget/reserve/adjust/import/final/confirmation`, params)
  },

  //根据占用调整id获取占用调整信息
  getOccupancyInfo(id) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/reserve/adjust/${id}`)
  },

  //获取导入数据列表
  getImporterList(page, size, batchNumber) {
    return httpFetch.get(`${config.budgetUrl}/api/budget/reserve/adjust/import/ajust/data?page=${page}&size=${size}&batchNumber=${batchNumber}`)
  },

}
