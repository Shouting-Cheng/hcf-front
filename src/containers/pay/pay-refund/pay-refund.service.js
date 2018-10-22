import config from 'config'
import httpFetch from 'share/httpFetch'

export default {
    /**
     * @Author: bin.xie
     * @Description: 获取待退款数据
     * @Date: Created in 2018/4/4 11:34
     * @Modified by
     */
    queryUnRefundList(searchParams,page, size){
        let url = `${config.payUrl}/api/cash/refund/query?page=${page}&size=${size}`;
        for(let searchName in searchParams){
            url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
        }
        return httpFetch.get(url)
    },
    /**
     * @Author: bin.xie
     * @Description: 根据ID查询明细数据
     * @Date: Created in 2018/4/4 16:03
     * @Modified by
     */
    queryById(id){
        let url = `${config.payUrl}/api/cash/refund/query/${id}`;
        return httpFetch.get(url);
    },
    /**
     * @Author: bin.xie
     * @Description: 新建退款数据
     * @Date: Created in 2018/4/9 16:36
     * @Modified by
     */
    saveFunction(params){
        let url = `${config.payUrl}/api/cash/refund/save`;
        return httpFetch.post(url,params);
    },
    /**
     * @Author: bin.xie
     * @Description: 更新退款数据
     * @Date: Created in 2018/4/9 16:37
     * @Modified by
     */
    updateFunction(params){
        let url = `${config.payUrl}/api/cash/refund/save`;
        return httpFetch.put(url,params);
    },

    /**
     * @Author: bin.xie
     * @Description: 查询我的退款数据
     * @Date: Created in 2018/4/9 16:38
     * @Modified by
     */
    queryMyRefundList(searchParams,page, size){
        let url = `${config.payUrl}/api/cash/refund/query/myRefund?page=${page}&size=${size}`;
        for(let searchName in searchParams){
            url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
        }
        return httpFetch.get(url)
    },
    /**
     * @Author: bin.xie
     * @Description: 查询退款数据及其来源支付数据
     * @Date: Created in 2018/4/9 16:38
     * @Modified by
     */
    queryMyRefundById(id){
        let url = `${config.payUrl}/api/cash/refund/query/myRefund/${id}`;
        return httpFetch.get(url);
    },
    /**
     * @Author: bin.xie
     * @Description: 删除退款数据
     * @Date: Created in 2018/4/9 16:39
     * @Modified by
     */
    deleteById(id){
        let url = `${config.payUrl}/api/cash/refund/delete/${id}`;
        return httpFetch.delete(url);
    },
    /**
     * @Author: bin.xie
     * @Description: 退款数据提交、复核、拒绝操作
     * @Date: Created in 2018/4/9 16:39
     * @Modified by
     */
    operateFunction(params){
        let url = `${config.payUrl}/api/cash/refund/operate`;
        return httpFetch.post(url,params);
    },
    /**
     * @Author: bin.xie
     * @Description: 查询待审核的退款数据
     * @Date: Created in 2018/4/16 9:47
     * @Modified by
     */
    getUncheckData(searchParams,page, size){
        let url = `${config.payUrl}/api/cash/refund/uncheck/query?page=${page}&size=${size}`;
        for(let searchName in searchParams){
            url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
        }
        return httpFetch.get(url)
    },
    /**
     * @Author: bin.xie
     * @Description: 审核通过
     * @Date: Created in 2018/4/16 10:11
     * @Modified by
     */
    approvedFunction(params){
        let url = `${config.payUrl}/api/cash/refund/approved`;
        return httpFetch.post(url,params);
    },
    /**
     * @Author: bin.xie
     * @Description: 退款驳回
     * @Date: Created in 2018/4/16 10:13
     * @Modified by
     */
    rejectFunction(params){
        let url = `${config.payUrl}/api/cash/refund/rejected`;
        return httpFetch.post(url,params);
    },
    /**
     * @Author: bin.xie
     * @Description: 获取已复核的数据
     * @Date: Created in 2018/4/16 10:43
     * @Modified by
     */
    getCheckedData(searchParams,page, size){
        let url = `${config.payUrl}/api/cash/refund/checked/query?page=${page}&size=${size}`;
        for(let searchName in searchParams){
            url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
        }
        return httpFetch.get(url)
    },
    /**
     * 根据id获取反冲明细审批历史
     * @param param
     */
    getHistory(param){
        return httpFetch.get(`${config.payUrl}/api/detail/log/get/by/detail/id?detailId=`+param)
    }
}
