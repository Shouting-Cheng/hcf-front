/**
 * 错误信息统一后端处理，
 * 如果后端返回的错误对象里面有message字段
 * 就直接提示，多语言也是后端统一维护
 */
import { message } from 'antd';
const errorMessage = function (repspone, defaultError) {
  if(getErrorMessage(repspone)){
    message.error(getErrorMessage(repspone));
    return;
  }
  if(defaultError){
    message.error(defaultError)
  }
};
export default errorMessage;

//获取错误信息
//这个需要在组件里面导入进行使用
export function getErrorMessage(repspone) {
  const error = repspone && repspone.data ? repspone.data:'';
  //目前发现后端返回有两种错误对象
  //第一种
  if(error && error.validationErrors && error.validationErrors.length > 0){
    if(error.validationErrors[0].externalPropertyName){
      return error.validationErrors[0].externalPropertyName + " " + error.validationErrors[0].message;
    }else {
      return error.validationErrors[0].message;
    }
  }
  //第二种
  if(error && error.message){
    return repspone.data.message;
  }
  return false;
}
