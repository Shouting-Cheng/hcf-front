import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * 获取费用调整单类型
     */
    getExpenseAdjustTypes(page, pageSize, params) {
        let url = `${config.baseUrl}/api/expense/adjust/types/query?page=${page}&size=${pageSize}`;
        for (let paramsName in params) {
            url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
        }
        return httpFetch.get(url)
    },
    /**
     * 获取关联表单类型
     */
    getRequisitionList(setOfBooksId) {
        return httpFetch.get(`${config.baseUrl}/api/custom/forms/setOfBooks/my/available/all?formTypeId=801006&setOfBooksId=${setOfBooksId}`);
    },
    /**
     * 获取费用类型
     */
    getExpenseType(params) {
        let url = `${config.baseUrl}/api/expense/adjust/types/queryExpenseTypeByRange`;
        return httpFetch.get(url, params);
    },
    /**
     * 获取维度数据
     */
    getDimension(params) {
        let url = `${config.baseUrl}/api/expense/adjust/types/queryDimensionByRange`;
        return httpFetch.get(url, params);
    },
    /**
     * 根据id查询费用调整单类型
     */
    getExpenseAdjustTypeById(typeId) {
        let url = `${config.baseUrl}/api/expense/adjust/types/${typeId}`;
        return httpFetch.get(url);
    },
    /**
     * 分页查询费用调整单类型定义下已经分配的公司
     */
    getDistributiveCompany(params) {
        let url = `${config.baseUrl}/api/expense/adjust/type/assign/companies/query`;
        return httpFetch.get(url, params);
    },
    /**
     * 分页查询费用调整单类型定义下未分配的公司
     */
    getUndistributedCompany(params) {
        let url = `${config.baseUrl}/api/expense/adjust/type/assign/companies/filter`;
        return httpFetch.get(url, params);
    },
    /**
     * 批量新增费用调整单类型定义之公司分配
     */
    batchAssignCompany(params) {
        let url = `${config.baseUrl}/api/expense/adjust/type/assign/companies/batch`;
        return httpFetch.post(url, params);
    },
    /**
     * 批量修改费用调整单类型之分配公司
     */
    batchUpdateAssignCompany(params) {
        let url = `${config.baseUrl}/api/expense/adjust/type/assign/companies/batch`;
        return httpFetch.put(url, params);
    },
    /**
     * 根据id删除费用调整单类型
     */
    deleteExpAdjustTypeById(typeId) {
        let url = `${config.baseUrl}/api/expense/adjust/types/${typeId}`;
        return httpFetch.delete(url);
    },
    /**
     * 保存或者更新费用调整单类型定义行数据
     */
    saveExpAdjustTypeLineData(putOrPost, params) {
        return httpFetch[putOrPost](`${config.baseUrl}/api/expense/adjust/types`, params);
    },
    /**
     * 修改预算管控和核算
     */
    updateBudgetorAccountFlag(id, accountFlag, budgetFlag) {
        return httpFetch.put(`${config.baseUrl}/api/expense/adjust/types/update/budget/or/account?id=${id}&budgetFlag=${budgetFlag}&accountFlag=${accountFlag}`);
    }
}