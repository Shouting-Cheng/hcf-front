import config from 'config';
import httpFetch from 'share/httpFetch';
import errorMessage from 'share/errorMessage';

export default {
    newAccount(account) {
        return new Promise((resolve, reject) => {
            httpFetch.post(config.baseUrl + '/api/account/set', account)
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    errorMessage(err.response);
                    reject(err);
                })
        })
    },
    editAccount(account) {
        return new Promise((resolve, reject) => {
            httpFetch.put(config.baseUrl + '/api/account/set', account)
                .then((res) => {
                    resolve(res)
                })
                .catch((err) => {
                    errorMessage(err.response);
                    reject(err);
                })
        })
    },
}

