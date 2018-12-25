
import httpFetch from 'share/httpFetch';
import config from 'config';

export default {
   getDimensionList(params) {
      return httpFetch.post(`${config.authUrl}/api/dimension/item/page/by/cond`,params);
   }
}
