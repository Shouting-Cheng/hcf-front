/**
 * Created by zhouli on 18/2/26
 * Email li.zhou@huilianyi.com
 */
import { isEmptyObj, deepCopy } from 'utils/extend';

export default {
  /**
   * 根据当前语言环境获取要显示的name
   * @param currentUseLanguage    当前语言类型
   * @param i18nName    多语言对象列表
   * @return name 要显示的值
   */
  getNameForShow(currentUseLanguage, i18nName) {
    for (let j = 0; j < i18nName.length; j++) {
      if (currentUseLanguage === i18nName[j].language.toLowerCase()) {
        return i18nName[j].value;
      }
    }
  },
  /**
   * 把主语言放最开始:一般只是初始化的时候调用
   * @param i18nName    源语言列表
   * @param sysLanguageDefault    主表语言类型
   * @return i18nName 排序好的语言列表
   */
  sortI18nList(i18nName, sysLanguageDefault) {
    if (i18nName[0].language.toLowerCase() === sysLanguageDefault) {
      return i18nName;
    } else {
      var c = i18nName[0];
      for (let i = 0; i < i18nName.length; i++) {
        if (i18nName[i].language.toLowerCase() === sysLanguageDefault) {
          i18nName[0] = i18nName[i];
          i18nName[i] = c;
          break;
        }
      }
      return i18nName;
    }
  },
  /**
   * 检查传入的多语言对象格式是否正确
   * @param list   多语言对象列表
   * @return bool
   */
  checkI18nObj(list) {
    for (let i = 0; i < list.length; i++) {
      for (let key in list[i]) {
        if (key != 'language' && key != 'value') {
          return false;
        }
      }
    }
    return true;
  },
  /**
   * 更新：初始化多语言对象:返回多语言对象
   * @param name   显示的字段
   * @param i18nName   多语言对象列表
   * @param languageListLocal   用户的可用的语言列表
   * @param sysLanguageDefault   用户主表语言
   * @return bool
   */
  initLanguageListForEdit(name, i18nName, languageListLocal, sysLanguageDefault) {
    //如果传入的数据长度大于等于本地列表，但是格式正确
    if (
      i18nName &&
      i18nName.length &&
      i18nName.length >= languageListLocal.length &&
      this.checkI18nObj(i18nName)
    ) {
      //排序
      var res = this.sortI18nList(i18nName, sysLanguageDefault);
      return res;
    }

    //编辑的时候，多语言对象，
    // 1可能为空，是历史数据:历史数据有主表语言，需要把主语言设置上(修复老数据)
    if (
      i18nName == null ||
      i18nName == undefined ||
      isEmptyObj(i18nName) ||
      (i18nName.length && i18nName.length === 0)
    ) {
      var languageList = this.initLanguageListForCreate(languageListLocal);
      for (let i = 0; i < languageList.length; i++) {
        if (languageList[i].language === sysLanguageDefault) {
          languageList[i].value = name;
        }
      }
      return languageList;
    }

    // 2可能不为空，但是有新增了语言列表，比如之前是中英，后来有了中英法:要把法语加上
    if (i18nName.length < languageListLocal.length && this.checkI18nObj(i18nName)) {
      var languageList = this.initLanguageListForCreate(languageListLocal);
      for (let i = 0; i < languageList.length; i++) {
        for (let j = 0; j < i18nName.length; j++) {
          if (languageList[i].language === i18nName[j].language.toLowerCase()) {
            languageList[i].value = i18nName[j].value;
          }
        }
      }
      return languageList;
    }

    //不是上面两钟情况
    return this.initLanguageListForCreate(languageListLocal);
  },
  /**
   * 新增：初始化多语言对象:返回多语言对象
   * @param langList   用户的可用的语言列表
   * @return i18nName 多语言对象列表
   */
  initLanguageListForCreate(langList) {
    var languageList = [];
    for (let i = 0; i < langList.length; i++) {
      var obj = {
        language: langList[i].code.toLowerCase(),
        value: '',
      };
      languageList.push(obj);
    }
    return languageList;
  },
  /**
   * 检测主表语言是否有填:是空就返回true
   * @param i18nNameForShow   显示的语言列表
   * @param sysLanguageDefault   主表语言
   * @return bool
   */
  mainTableLanguageIsEmpty(i18nNameForShow, sysLanguageDefault) {
    for (let i = 0; i < i18nNameForShow.length; i++) {
      if (
        i18nNameForShow[i].value === '' &&
        i18nNameForShow[i].language.toLowerCase() === sysLanguageDefault
      ) {
        return true;
      }
    }
    return false;
  },
};
