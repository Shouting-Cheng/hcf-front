/**
 * Created by zhouli on 18/3/19
 * Email li.zhou@huilianyi.com
 */
import { deepCopy } from 'utils/extend';

//默认的人员信息
const personObjDefaultWithoutExtend = {
  companyOid: null,
  companyName: '',

  departmentOid: null,
  departmentName: '',
  departmentPath: '',

  directManager: null, //是oid，直属领导
  directManagerId: null, //工号
  directManagerName: '',

  duty: null,
  employeeType: null,
  rank: null,
  title: '',

  email: '',
  mobile: '', //手机
  mobileCode: '86', //手机前缀:默认86
  countryCode: 'CN', //手机号来来自哪个国家

  dutyCode: null, //职务编码
  employeeTypeCode: null, //员工类型编码
  rankCode: null, //级别编码

  userOid: null,
  employeeId: '',
  fullName: '',
  status: 1001, //不传代表只查询在职，1001也是在职，1002待离职员工，1003离职员工
  manager: false, //是不是部门领导
  leavingDate: new Date('3018-01-31T16:00:00Z'), //离职时间
  gender: '', //性别1女0男，其他未知
  genderCode: '', //性别1女0男，其他未知

  birthday: new Date(), //生日
  entryDate: new Date(), //入职时间
};
//默认的人员信息+扩展字段
const personObjDefault = deepCopy(personObjDefaultWithoutExtend);
personObjDefault.customFormValues = []; //自定义值列表
//默认的银行卡信息
const bankAccountDefault = {
  contactBankAccountOid: null,
  userOid: null, //这个userOid在创建的时候必须的，
  bankAccountNo: null, //卡号
  bankAccountName: null, //开户名
  bankName: null, //银行名称
  branchName: null, //银行支行名称，默认，新增的时候需要默认
  accountLocation: null, //开户地
  isPrimary: false, //是否默认
  bankCode: null, //银行代码，默认，新增的时候需要默认，不然只有单独处理了
  enable: true, //是否启用
};
//默认的证件信息
const contactCardDefault = {
  cardType: 101, //证件类型:默认身份证
  cardTypeName: '', //证件名称：护照，身份证
  contactCardOid: null, //证件oid
  firstName: null, //名
  lastName: null, //姓
  nationality: null, //国家
  nationalityCode: '', //国籍编码
  default: false,
  enable: true,
  cardNo: '', //证件号加密显示的,上传的时候，也要上传这个字段
  cardExpiredTime: '', //过期时间
  originalCardNo: '', //证件号没加密
  userOid: null, //这个userOid在创建的时候必须的，
};
//默认的供应商信息
const vendorInfoDefault = {
  enable: false, //默认不启用
  subAccountName: '',
  userOid: '',
};
//默认的供应商信息
const vendorInfoDefaultWithPerson = {
  //授权人
  confirmUser: {
    userOid: null,
    fullName: '',
    email: '',
    employeeID: '',
  },
  confirmUserOid: '',

  //二次授权人
  confirm2User: {
    userOid: null,
    fullName: '',
    email: '',
    employeeID: '',
  },
  confirm2UserOid: '',

  //抄送授权人
  confirmCCUser: {
    userOid: null,
    fullName: '',
    email: '',
    employeeID: '',
  },
  confirmCCUserOid: '',

  //二次抄送授权人
  confirm2CCUser: {
    userOid: null,
    fullName: '',
    email: '',
    employeeID: '',
  },
  confirm2CCUserOid: '',

  enable: false, //默认不启用
  subAccountName: '',
  subAccountCode: '',
  userOid: '',
  confirmPassword: '', //授权密码加密的
  confirmPasswordView: '', //授权密码没加密，用来显示
};
export {
  personObjDefaultWithoutExtend,
  personObjDefault,
  bankAccountDefault,
  contactCardDefault,
  vendorInfoDefault,
  vendorInfoDefaultWithPerson,
};
