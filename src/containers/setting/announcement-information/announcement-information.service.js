import config from 'config'
import httpFetch from 'share/httpFetch'

export default {

  //获取公告信息列表，enabled: true(查询启用的)，false(查询启用及禁用的)，默认false
  getAnnouncementList(enabled = false) {
    return httpFetch.get(`${config.baseUrl}/api/carousels/all`)
  },

  //根据公告信息OID删除公告信息
  deleteAnnouncement(carouselOID) {
    return httpFetch.delete(`${config.baseUrl}/api/carousels/${carouselOID}`)
  },

  //新建公告信息
  newAnnouncement(params) {
    return httpFetch.post(`${config.baseUrl}/api/carousels`, params)
  },

  //更新公告信息
  updateAnnouncement(params) {
    return httpFetch.put(`${config.baseUrl}/api/carousels`, params)
  },

  //获取公告信息详情
  getAnnouncementDetail(OID) {
    return httpFetch.get(`${config.baseUrl}/api/carousels/${OID}`)
  },
  //获取公告图片模板
  getAnnouncementTemp() {
    return httpFetch.get(`${config.baseUrl}/api/carousel/template?type=TEMPLATE&page=0&size=1000`)
  },
  //获取分配公司列表
  getCompanyList(page, size, OID) {
    return httpFetch.get(`${config.baseUrl}/api/carousels/company/find/distribution?page=${page}&size=${size}&carouselOID=${OID}`)
  },

  //分配公司，carouselOIDs 和 companyOIDs 都是数组格式
  handleCompanyDistribute(carouselOIDs, companyOIDs) {
    let url = `${config.baseUrl}/api/carousels/relevance/company`;
    carouselOIDs.map((OID, index) => {
      if (index === 0) {
        url += `?carouselOIDs=${OID}`
      } else {
        url += `&carouselOIDs=${OID}`
      }
    });
    companyOIDs.map(OID => {
      url += `&companyOIDs=${OID}`
    });
    return httpFetch.put(url)
  },

  //上传图片
  handleImageUpload(formData) {
    return httpFetch.post(`${config.baseUrl}/api/upload/static/attachment`, formData)
  },

}
