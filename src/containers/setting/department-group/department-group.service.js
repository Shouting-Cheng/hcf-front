import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

    //条件查询部门组（分页）
    getDeptGroupByOptions(params) {
        return httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/selectByInput`, params)
    },

    //根据id删除部门组
    deleteDeptGroupById(params) {
        return httpFetch.delete(`${config.baseUrl}/api/DepartmentGroupDetail/BatchDeleteByIds`, params)
    },

    //根据id查询部门组信息
    getDeptGroupById(params) {
        return httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/selectById?id=${params}`)
    },

    //新增/更新部门组
    addOrUpdateDeptGroup(params) {
        return httpFetch.post(`${config.baseUrl}/api/DepartmentGroup/insertOrUpdate`, params)
    },

    //查询部门组详情
    getDeptGroupInfo(params) {
        return httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/selectDepartmentByGroupId`, params)
    },

    //添加部门
    addDept(params) {
        return httpFetch.post(`${config.baseUrl}/api/DepartmentGroupDetail/BatchAddDepartmentGroupDetail`, params)
    }
}
