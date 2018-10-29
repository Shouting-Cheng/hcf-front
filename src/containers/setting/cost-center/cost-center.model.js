/**
 * Created by zhouli on 18/4/19
 * Email li.zhou@huilianyi.com
 */
import { deepCopy } from "utils/extend";
import { routerRedux } from 'dva/router';

//默认的成本中心对象
const costCenterDefault = {
    code: "",
    companyName: "",
    companyOID: null,
    costCenterItems: [],
    costCenterOID: null,
    enabled: true,
    i18n: {},
    name: "",
    sequenceNumber: 0,
    setOfBooksCode: "",
    setOfBooksId: "",
    setOfBooksName: "",
}
//默认的成本中心项对象
const costCenterItemDefault = {
    "costCenterItemOID": null,
    "parentCostCenterItemOID": null,
    "name": "",
    "code": "",
    "managerOID": null,
    "managerFullName": null,
    "enabled": true,
    "category": null,
    "group": null,
    "i18n": {},
    "setOfBooksCode": null,
    "primaryDepartmentId": null,
    "primaryDepartmentName": null,
    "secondaryDepartmentIds": null,
    "secondaryDepartmentNames": null,
    "publicFlag": false,
    "customFormValues": [],//成本中心扩展字段
}

export {
    costCenterDefault,
    costCenterItemDefault
}
