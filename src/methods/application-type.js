import httpFetch from "share/httpFetch"
import config from "config"
import { message } from "antd"


const permissionsType = {
  all: '101',
  department: '102',
  group: '103',
};

export default {
  newApplicationType(values, cb) {

    console.log(values);

    values = {
      applicationType: {
        ...values,
        allFlag: values.types.radioValue,
        applyEmployee: permissionsType[values.userInfo.type]
      },
      userInfos: permissionsType[values.userInfo.type] != "101" ? values.userInfo.values.map(o => ({ userTypeId: o.value })) : [],
      expenseTypeInfos: values.types.radioValue ? [] : values.types.chooserValue.map(o => ({ id: o.id }))
    }

    delete values.applicationType.types;
    delete values.applicationType.userInfo;

    httpFetch.post(`${config.expenseUrl}/api/expense/application/type`, values).then(res => {
      message.success("创建成功！");
      cb(true);
    }).catch(err => {
      message.error(err.response.data.message);
      cb(false);
    })
  }
}