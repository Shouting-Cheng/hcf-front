/**
 * Created by zhouli on 18/2/4
 * Email li.zhou@huilianyi.com
 * 把所有的组件都放在这个文件
 * 方便使用，要使用哪一个就导入哪一个
 */
//导入有业务的组件
import {
  SelectDepOrPerson,
  LanguageInput,
  SelectDepByRole,
  ExternalExpenseImport,
} from './Template/index';
import ImageUpload from './image-upload';
//todo
//无业务的通用组件
import ListSelector from './list-selector';
import Chooser from './chooser';
import ListSort from './list-sort';
import Selector from './selector';
import Selput from './selput';
import SearchArea from './index'
export{
  SelectDepOrPerson,
  LanguageInput,
  SelectDepByRole,
  ImageUpload,
  ListSelector,
  Chooser,
  ListSort,
  ExternalExpenseImport,
  Selector,
  Selput,
  SearchArea,
}
