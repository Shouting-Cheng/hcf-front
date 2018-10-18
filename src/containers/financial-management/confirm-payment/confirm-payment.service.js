import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  confirmPayment(status, params) {
    return httpFetch.post(
      `${config.baseUrl}/api/reimbursement/batch/pay/${
        status === 'prending_pay' ? 'processing' : 'finished'
      }/confirm`,
      params
    );
  },
  importOfferFile(file) {
    return httpFetch.postFile(
      `${config.baseUrl}/api/reimbursement/batch/pay/finished/confirm/by/nacha`,
      file
    );
  },
};
