import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  /**
   * 获取所以执行器
   * @param page
   * @param size
   * @param searchParams
   */
  queryActuatorList() {
    let url = `${config.jobUrl}/api/jobgroup`;
    return httpFetch.get(url);
  },
  saveActuator(param) {
    let url = `${config.jobUrl}/api/jobgroup/save`;
    return httpFetch.post(url, param);
  },
  updateActuator(param) {
    let url = `${config.jobUrl}/api/jobgroup/update`;
    return httpFetch.post(url, param);
  },
  removeActuator(id) {
    let url = `${config.jobUrl}/api/jobgroup/remove/${id}`;
    return httpFetch.post(url);
  },
  queryInfoList(page, size, searchParams) {
    let url = `${config.jobUrl}/api/jobinfo/pageList?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },
  saveJobInfo(param) {
    let url = `${config.jobUrl}/api/jobinfo/add`;
    return httpFetch.post(url, param);
  },
  updateJobInfo(param) {
    let url = `${config.jobUrl}/api/jobinfo/reschedule`;
    return httpFetch.post(url, param);
  },
  runJobInfo(id) {
    let url = `${config.jobUrl}/api/jobinfo/trigger/${id}`;
    return httpFetch.post(url);
  },
  pauseJobInfo(id) {
    let url = `${config.jobUrl}/api/jobinfo/pause/${id}`;
    return httpFetch.post(url);
  },
  deleteJobInfo(id) {
    let url = `${config.jobUrl}/api/jobinfo/remove/${id}`;
    return httpFetch.post(url);
  },
  startJobInfo(id) {
    let url = `${config.jobUrl}/api/jobinfo/resume/${id}`;
    return httpFetch.post(url);
  },
  queryLogList(page, size, searchParams) {
    let url = `${config.jobUrl}/api/joblog/pageList?page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },

  queryJobDetail(searchParams) {
    let url = `${config.jobUrl}/api/joblog/logDetailCat?1=1`;
    for (let searchName in searchParams) {
      url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
    }
    return httpFetch.get(url);
  },
  kill(id) {
    let url = `${config.jobUrl}/api/joblog/logKill/${id}`;
    return httpFetch.post(url);
  },

  queryGlue(id) {
    let url = `${config.jobUrl}/api/jobcode?jobId=${id}`;
    return httpFetch.get(url);
  },
  saveGlue(params) {
    let url = `${config.jobUrl}/api/jobcode/save`;
    return httpFetch.post(url, params);
  },
  deleteLog(params) {
    let url = `${config.jobUrl}/api/joblog/clearLog?1=1`;
    for (let searchName in params) {
      url += params[searchName] ? `&${searchName}=${params[searchName]}` : '';
    }
    return httpFetch.delete(url);
  },
};
