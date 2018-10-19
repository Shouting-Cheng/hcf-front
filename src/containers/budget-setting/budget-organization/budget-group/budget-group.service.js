import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
  //条件搜索预算组(分页)
  getOrganizationGroups(params){
    return httpFetch.get(`${config.budgetUrl}/api/budget/groups/query`, params)
  },

  //新增预算组
  addOrganizationGroup(group){
    return httpFetch.post(`${config.budgetUrl}/api/budget/groups`, group)
  },

  //更新预算组
  updateOrganizationGroup(group){
    return httpFetch.put(`${config.budgetUrl}/api/budget/groups`, group)
  },

  //根据预算组id得到预算组信息
  getOrganizationGroupById(id){
    return httpFetch.get(`${config.budgetUrl}/api/budget/groups/${id}`)
  },

  //根据预算项目组id与预算组织id查找当前预算项目组中未被添加的预算项目（不分页）
  filterItemByGroupIdAndOrganizationId(groupId, organizationId){
    return httpFetch.get(`${config.budgetUrl}/api/budget/groupDetail/${groupId}/query/filterAll?organizationId=${organizationId}`)
  },

  //根据预算组Id查找预算组下的预算项目（分页）
  getItemByGroupId(groupId, page, size){
    return httpFetch.get(`${config.budgetUrl}/api/budget/groupDetail/${groupId}/query?page=${page}&size=${size}`)
  },

  //根据id从预算组内删除单个预算项目
  deleteItemFromGroup(groupId, itemId){
    return httpFetch.delete(`${config.budgetUrl}/api/budget/groupDetail/${groupId}/${itemId}`)
  },

  //根据id从预算组内批量删除预算项目
  batchDeleteItemFromGroup(groupId, itemList){
    return httpFetch.delete(`${config.budgetUrl}/api/budget/groupDetail/${groupId}/batch`, itemList)
  },

  //为预算组批量增加预算项目
  batchAddItemToGroup(groupId, itemList){
    return httpFetch.post(`${config.budgetUrl}/api/budget/groupDetail/${groupId}/batch`, itemList)
  }
}
