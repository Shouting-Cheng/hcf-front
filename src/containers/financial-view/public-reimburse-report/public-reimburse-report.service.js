import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     *
     * 查询对公报账单
     * @param searchParams
     * @param page
     * @param pageSize
     * @param setOfBooksId
     */
    getReimburseReport(searchParams,page,pageSize,setOfBooksId){
        let url=`${config.baseUrl}/api/expReportHeader/get/expenseReport/by/query?page=${page}&size=${pageSize}&setOfBooksId=${setOfBooksId}`;
        for(let searchName in searchParams){
            url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
        }
        return httpFetch.get(url)
    },
    /**
     * 导出对公报账单
     * @param params
     */
    exportExcel(params,setOfBooksId,exportParams){
        let url=`${config.baseUrl}/api/export?setOfBooksId=${setOfBooksId}`;
        for(let searchName in exportParams){
            url += exportParams[searchName] ? `&${searchName}=${exportParams[searchName]}` : '';
        }
        return httpFetch.post(url,params,{},{responseType: 'arraybuffer'});
    }
}

