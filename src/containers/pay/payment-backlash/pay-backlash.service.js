import httpFetch from 'share/httpFetch'
import config from 'config'
export default {

  /**
   * 获取可反冲列表
   * @param {*} params
   */
  getCanBacklashList(params){
    return httpFetch.get(`${config.payUrl}/api/cash/backlash`,params);
  },



  /**
   * 生成反冲单据
   * @param {*} param
   */
  getReadyByDetailId(param){
    return httpFetch.get(`${config.payUrl}/api/cash/backlash/get/ready/by/detail/id?id=`+param);
  },



  /**
   * 更新反冲单据
   * @param {*} param
   */
  updateByDetailId(params){
    return httpFetch.post(`${config.payUrl}/api/cash/backlash/update/backlash`,params)
  },


  /**
   * 根据id删除反冲的单据
   * @param {*} param
   */
  deleteBacklashDetailById(param){
    return httpFetch.delete(`${config.payUrl}/api/cash/backlash/delete/backlash?id=`+param)
  },


  /**
   * 根据单据明细生成反冲单据信息
   * @param {*} param
   */
  getBacklashByDetailId(param){
    return httpFetch.get(`${config.payUrl}/api/cash/backlash/to/backlash?detailId=`+param);
  },



  /**
   * 根据反冲id进行反冲提交
   * @param {*} param
   */
  submitBacklash(param){
    return httpFetch.post(`${config.payUrl}/api/cash/backlash/submit/backlash?id=`+param);
  },

  /**
   * 条件查询我发起的带反冲单据
   * @param {*} params
   */
  queryMyBacklashList(params){
    return httpFetch.get(`${config.payUrl}/api/cash/backlash/get/backlash/by/user`,params);

  },


  /**
   * 根据明细id获取详情
   * @param {*} param
   */
  getBacklashDTOBybacklashDetailId(param){
    return httpFetch.get(`${config.payUrl}/api/cash/backlash/get/by/backlash/detail/id?id=`+param)
  },


  /**
   * 根据反冲明细id获取反冲明细审批历史
   * @param param
   */
  getBacklashHistory(param){
    return httpFetch.get(`${config.payUrl}/api/detail/log/get/by/detail/id?detailId=`+param)
  }


}
