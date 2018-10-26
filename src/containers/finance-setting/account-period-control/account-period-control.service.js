import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //获取账套级会计期间列表
  getAccountPeriodList(page, size, searchParams) {
    let url = `${config.baseUrl}/api/setOfBooks/query/dto?page=${page}&size=${size}`;
    for(let paramsName in searchParams){
      url += searchParams[paramsName] ? `&${paramsName}=${searchParams[paramsName]}` : '';
    }
    return httpFetch.get(url)
  },

  //根据账套id和期间id获取账套期间信息
  getAccountPeriodInfo(periodSetId, setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/setOfBooks/query/head/dto?periodSetId=${periodSetId}&setOfBooksId=${setOfBooksId}`)
  },

  //根据账套id和期间id获取关闭期间列表
  getClosePeriod(page, size, periodSetId, setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/periods/query/close?periodSetId=${periodSetId}&setOfBooksId=${setOfBooksId}&page=${page}&size=${size}`)
  },

  //根据账套id和期间id获取打开期间列表
  getOpenPeriod(page, size, periodSetId, setOfBooksId) {
    return httpFetch.get(`${config.baseUrl}/api/periods/query/open?periodSetId=${periodSetId}&setOfBooksId=${setOfBooksId}&page=${page}&size=${size}`)
  },

  //修改期间状态,method: open(打开)、close(关闭)
  operaPeriodStatus(method, periodId, periodSetId, setOfBooksId) {
    return httpFetch.post( `${config.baseUrl}/api/periods/${method}/periods?periodId=${periodId}&periodSetId=${periodSetId}&setOfBooksId=${setOfBooksId}`)
  },

}
