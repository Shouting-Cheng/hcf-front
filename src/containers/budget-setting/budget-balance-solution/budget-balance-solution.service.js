import httpFetch from 'share/httpFetch'
import config from 'config'

export default {
    /**
     * 预算余额查询方案list
     */
    getBudgetBalanceSolution(setOfBooksId, params) {
        return httpFetch.get(`${config.budgetUrl}/api/budget/solution/header/list?setOfBooksId=${setOfBooksId}`, params)
    },
    /**
     * 预算余额查询方案删除
     */
    deleteBudgetBalanceSolution(id) {
        return httpFetch.delete(`${config.budgetUrl}/api/budget/solution/header/${id}`);
    },
    /**
     *获取参数类型
     */
    getParameterTypes() {
        return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=2012`);
    },
    /**
     * 当参数类型是预算相关时，获取参数的接口
     */
    getBudgetRefParameters() {
        return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=2015`)
    },
    /**
     * 当参数类型是组织架构相关时，获取参数的接口
     */
    getOrgRefParameters() {
        return httpFetch.get(`${config.baseUrl}/api/custom/enumerations/template/by/type?type=2016`);
    },
    /**
     * 当参数类型是维度相关时，获取参数的接口
     */
    getDimensionRefParameters(setOfBooksId) {
        return httpFetch.get(`${config.baseUrl}/api/dimension/page/by/cond?setOfBooksId=${setOfBooksId}`)
    },
    /**
     * 获取当前账套对应的预算组织数据
     */
    getOrganization(setOfBooksId) {
        return httpFetch.get(`${config.budgetUrl}/api/budget/organizations/query/all?setOfBooksId=${setOfBooksId}&enabled=true`)
    },
    /**
     * 预算余额查询方案创建，修改
     */
    saveBgtBalanceSolution(params) {
        return httpFetch.post(`${config.budgetUrl}/api/budget/solution/header`, params);
    },
    /**
     * 根据id查询预算余额方案某一条数据
     */
    getBudgetBalanceSolutionById(id) {
        return httpFetch.get(`${config.budgetUrl}/api/budget/solution/header/${id}`);
    }
}
