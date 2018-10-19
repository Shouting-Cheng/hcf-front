import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //条件查询项目映射（分页）
  getItemMapByOptions(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/itemsMapping/selectByInput`,params)
  },

  //新增或修改项目映射
  insertOrUpdateItemMap(params){
    return httpFetch.post(`${config.budgetUrl}/api/budget/itemsMapping/insertOrUpdate`,params)
  },

  //删除项目映射
  deleteItemMap(params){
    return httpFetch.delete(`${config.budgetUrl}/api/budget/itemsMapping/deleteByIds`,params)
  },


}
