import { messages } from "utils/utils";
/**
 * Created by zaranengap on 2017/7/5.
 */
import React from 'react'
import PropTypes from 'prop-types';

import {
  Form,
  Row,
  Col,
  Input,
  InputNumber,
  Button,
  Icon,
  DatePicker,
  Radio,
  Checkbox,
  Select,
  Switch,
  Cascader,
  message,
  Spin
} from 'antd';
import LanguageInput from 'widget/Template/language-input/language-input';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { MonthPicker, RangePicker } = DatePicker;
// import {ImageUpload} from 'components/index';
import Chooser from 'widget/chooser'
// import Selput from 'components/selput'
import moment from 'moment'
import TagSelect from 'components/TagSelect';

import debounce from 'lodash.debounce';
import httpFetch from 'share/httpFetch'



import 'styles/components/search-area.scss'
let searchAreaThis;

/**
 * 搜索区域组件
 * @params searchForm   渲染表单所需要的配置项，见底端注释
 * @params checkboxListForm   渲染checkbox表单列表所需要的配置项，见底端注释
 * @params submitHandle  点击搜索时的回调
 * @params clearHandle  点击重置时的回调
 * @params eventHandle  表单项onChange事件，于searchForm内的event有联动，见底端注释
 * @params okText  搜索按钮的文字
 * @params clearText  重置按钮的文字
 * @params maxLength  最大项数，如果超过则隐藏支展开菜单中
 * @params loading  搜索按钮的loading状态
 * TODO: 选项render函数、searchUrl和getUrl的method区分
 */
class SearchArea extends React.Component {
  constructor(props) {
    super(props);
    searchAreaThis = this;
    this.state = {
      expand: this.props.searchForm.expand,
      searchForm: [],
      checkboxListForm: []
    };
    this.setOptionsToFormItem = debounce(this.setOptionsToFormItem, 250);
  }

  componentWillMount() {
    this.props.searchForm.map(item => {
      if (item.type === 'select' && item.defaultValue && item.defaultValue.key) {
        item.options = [{
          label: item.defaultValue.label,
          value: item.defaultValue.key,
          temp: true
        }];
      }
    });
    this.setState({
      searchForm: this.props.searchForm,
      checkboxListForm: this.props.checkboxListForm
    })
  };

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this)
    }
  };

  componentWillReceiveProps = (nextProps) => {
    let { searchForm } = this.state;
    nextProps.searchForm.map(item => {
      if (item.type === 'select') {
        searchForm.map(form => {
          if (form.id === item.id) {
            if (form.options.length === 0 && item.defaultValue && item.defaultValue.key) {
              item.options = [{
                label: item.defaultValue.label,
                value: item.defaultValue.key,
                temp: true
              }];
            } else {
              item.options = form.options;
            }
          }
        });
      }
    });
    this.setState({
      searchForm: nextProps.searchForm,
      expand: nextProps.searchForm.expand ? true : this.state.expand
    }, () => {
      nextProps.searchForm.expand = false;
      let tags = document.getElementsByClassName('antd-pro-tag-select-tagSelect');
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].getElementsByClassName('ant-tag')[0].innerHTML !== messages('common.all'))
          tags[i].getElementsByClassName('ant-tag')[0].innerHTML = messages('common.all')
      }
    })
  };

  //收起下拉
  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  };

  //checkbox收起下拉
  checkboxToggle = (item) => {
    let checkboxListForm = this.state.checkboxListForm;
    checkboxListForm.map(list => {
      list.items.map(listItem => {
        listItem.key === item.key && (listItem.expand = !listItem.expand);
      });
    });
    this.setState({ checkboxListForm });
  };

  //checkbox改变
  onCheckChange = (id, key, checked) => {
    let checkboxListForm = this.state.checkboxListForm;
    let checkedList = [];
    checkboxListForm.map(list => {
      if (list.id === id) {
        list.items.map(item => {
          if (item.key === key) {
            item.checked = checked
          }
          checkedList.push(item)
        })
      }
    });
    this.props.checkboxChange(id, checkedList);
    this.setState({ checkboxListForm })
  };

  /**
   * 搜索区域点击确认时的事件
   * 返回为form包装形成的格式，
   * 其中如果type为 combobox、multiple、list时返回的单项格式为
   * {
   *   label: '',  //数据显示值，与传入的labelKey挂钩
   *   key: '',    //数据需要值，与传入的valueKey挂钩
   *   value: {}   //数据整体值
   * }
   * @param e
   */
  handleSearch = (e) => {
    if (e) e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let searchForm = [].concat(this.state.searchForm);
        searchForm.map(item => {
          if (values[item.id] && item.entity) {
            if (item.type === 'combobox' || item.type === 'select' || item.type === 'value_list') {
              //解决预算日志记账类型bug添加
              values[item.id] = item.bgt ? values[item.id].key : JSON.parse(values[item.id].title);
            } else if (item.type === 'multiple') {
              let result = [];
              values[item.id].map(value => {
                result.push(JSON.parse(value.title));
              });
              values[item.id] = result;
            }
          }
          //把上传的图片，赋值给value
          if (item.type.toLowerCase() === 'img' || item.type.toLowerCase() === 'image') {
            //如果有上传
            if (item._file && item._file.id) {
              values[item.id] = item._file;
            }
          }
          if (item.type === 'list' && values[item.id]) {
            if (item.entity) {
              let result = [];
              values[item.id].map(value => {
                result.push(value);
              });
              values[item.id] = result;
            } else {
              let result = [];
              values[item.id].map(value => {
                result.push(value[item.valueKey]);
              });
              values[item.id] = result;
            }
          }
          if (this.props.isReturnLabel && (values[item.id] || values[item.id] === false || values[item.id] === 0)) {
            if (item.type === 'combobox' || item.type === 'select' || item.type === 'value_list') {
              item.options.map(option => {
                if ((option.value + '') == values[item.id] || option.value == values[item.id]) {
                  values[`${item.id}Lable`] = option.value;
                  values[`${item.id}Option`] = [{ label: option.label, value: option.value }];
                }
              })
            } else if (item.type === 'multiple') {
              let result = [];
              let options = [];
              item.options.map(option => {
                values[item.id].map(id => {
                  if (option.value === id) {
                    result.push(option.value);
                    options.push({ label: option.label, value: option.value });
                  }
                })
              })
              values[`${item.id}Lable`] = result;
              values[`${item.id}Option`] = options;
            } else {
              values[`${item.id}Lable`] = values[item.id];
            }
          }
        });
        this.state.checkboxListForm && this.state.checkboxListForm.map(list => {
          if (!list.single) {
            values[list.id] = [];
            list.items && list.items.map(item => {
              if (this.props.isReturnLabel) values[`${list.id}Lable`] = [];
              if (this.props.isReturnLabel) values[`${list.id}Expand`] = item.expand;
              item.checked && item.checked.map(value => {
                values[list.id].push(value)
                if (this.props.isReturnLabel) values[`${list.id}Lable`].push(value)
              })
            })
          }
        });
        if (this.props.isReturnLabel) values['expand'] = this.state.expand;
        this.props.submitHandle(values)
      }else {
        console.log(err)
        err.name&&this.setState({validateStatus: true})
      }
    })
  };

  //点击重置的事件，清空值为初始值
  handleReset = () => {
    this.clearSearchAreaSelectData();
    this.props.clearHandle && this.props.clearHandle();
  };

  //清除searchArea选择数据
  clearSearchAreaSelectData = () => {
    this.props.form.resetFields();
    this.state.checkboxListForm && this.state.checkboxListForm.map(list => {
      if (!list.single) {
        list.items.map(item => {
          item.checked = []
        })
      }
    });
  }

  //区域点击事件，返回事件给父级进行处理
  handleEvent = (e, item) => {
    let result = null;
    if (e) {
      if (item.entity && (item.type === 'value_list' || item.type === 'select' || item.type === 'combobox')) {
        item.options.map(option => {
          if (option.data[item.type === 'value_list' ? 'code' : item.valueKey] === e.key)
            result = option.data
        })
      } else if (item.entity && item.type === 'multiple') {
        result = [];
        e.map(value => {
          item.options.map(option => {
            if (option.data[item.type === 'value_list' ? 'code' : item.valueKey] === value.key)
              result.push(option.data);
          })
        })
      } else {
        if (item.type === 'switch')
          result = e.target.checked;
        else
          result = e ? (e.target ? e.target.value : e) : null;
      }
    }
    let valuesTmp;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let searchForm = [].concat(this.state.searchForm);
        searchForm.map(item => {
          if (values[item.id] && item.entity) {
            if (item.type === 'combobox' || item.type === 'select' || item.type === 'value_list') {
              values[item.id] = JSON.parse(values[item.id].title);
            } else if (item.type === 'multiple') {
              let result = [];
              values[item.id].map(value => {
                result.push(JSON.parse(value.title));
              });
              values[item.id] = result;
            }
          }
          //把上传的图片，赋值给value
          if (item.type.toLowerCase() === 'img' || item.type.toLowerCase() === 'image') {
            //如果有上传
            if (item._file && item._file.id) {
              values[item.id] = item._file;
            }
          }
          if (item.type === 'list' && values[item.id]) {
            if (item.entity) {
              let result = [];
              values[item.id].map(value => {
                result.push(value);
              });
              values[item.id] = result;
            } else {
              let result = [];
              values[item.id].map(value => {
                result.push(value[item.valueKey]);
              });
              values[item.id] = result;
            }
          }

          if (values[item.id] && this.props.isReturnLabel) {
            if (item.type === 'combobox' || item.type === 'select' || item.type === 'value_list') {
              item.options.map(option => {
                if (option.value === values[item.id]) {
                  values[`${item.id}Lable`] = option.label;
                }
              })
            } else if (item.type === 'multiple') {
              let result = [];
              item.options.map(option => {
                values[item.id].map(id => {
                  if (option.value === id) {
                    result.push(option.label);
                  }
                })
              })
              values[`${item.id}Lable`] = result;
            } else {
              values[`${item.id}Lable`] = values[item.id];
            }
          }
        });
        this.state.checkboxListForm && this.state.checkboxListForm.map(list => {
          if (!list.single) {
            values[list.id] = [];
            list.items && list.items.map(item => {
              if (this.props.isReturnLabel) values[`${list.id}Lable`] = [];
              item.checked && item.checked.map(value => {
                values[list.id].push(value)
                if (this.props.isReturnLabel) values[`${list.id}Lable`].push(value)
              })
            })
          }
        });
        valuesTmp = values;
      }
    })
    this.props.eventHandle(item.event, result, valuesTmp)
  };

  getDataLabel(data, keys) {
    let lenth = keys.split('.').length;
    keys && keys.split('.').map((key, index) => {
      if (lenth - 1 !== index) {
        data = data[key];
      }
    })
    return data;
  }

  getLastKey(key) {
    return key.split('.')[key.split('.').length - 1];
  }

  //给select增加options
  getOptions = (item) => {
    if (item.options.length === 0 || (item.options.length === 1 && item.options[0].temp)) {
      let url = item.getUrl;
      let tempForm = this.state.searchForm;
      tempForm = tempForm.map(searchItem => {
        if (searchItem.id === item.id){
          searchItem.fetching = true;
        }
        if (searchItem.type === 'items')
          searchItem.items.map(subItem => {
            if (subItem.id === item.id){
              subItem.fetching = true;
            }
          });
        return searchItem;
      });
      this.setState({searchForm: tempForm});
      httpFetch[item.method](url, item.getParams).then((res) => {
        let options = [];
        let data = res.data;
        item.listKey && item.listKey.split('.').map(key => {
          data = data[key]
        });
        data.map(data => {
          data = this.getDataLabel(data, item.labelKey)
          options.push({
            label: item.renderOption ? item.renderOption(data) : data[this.getLastKey(item.labelKey)],
            value: data[this.getLastKey(item.valueKey)],
            data: data
          })
        });
        let searchForm = this.state.searchForm;
        searchForm = searchForm.map(searchItem => {
          if (searchItem.id === item.id){
            searchItem.options = options;
            searchItem.fetching = false;
          }
          if (searchItem.type === 'items')
            searchItem.items.map(subItem => {
              if (subItem.id === item.id){
                subItem.fetching = false;
                subItem.options = options;
              }
            });
          return searchItem;
        });
        this.setState({searchForm});
      })
    }
  };



  //得到值列表的值增加options
  getValueListOptions = (item) => {
    if (item.options.length === 0 || (item.options.length === 1 && item.options[0].temp)) {
      this.getSystemValueList(item.valueListCode).then(res => {
        let options = [];
        res.data.values.map(data => {
          options.push({ label: data.messageKey, value: data.code, data: data })
        });
        let searchForm = this.state.searchForm;
        searchForm = searchForm.map(searchItem => {
          if (searchItem.id === item.id)
            searchItem.options = options;
          if (searchItem.type === 'items')
            searchItem.items.map(subItem => {
              if (subItem.id === item.id)
                subItem.options = options;
            });
          return searchItem;
        });
        this.setState({ searchForm });
      })
    }
  };

  //根据接口返回数据重新设置options
  setOptionsToFormItem = (item, url, key) => {
    let params = item.getParams ? item.getParams : {};
    if (key) {
      params[item.searchKey] = key;
    }

    if ((key !== undefined && key !== '') || key === undefined) {
      httpFetch[item.method](url, params).then((res) => {
        let options = [];
        let dealData = (dataList) => {
          item.listKey && item.listKey.split('.').map(key => {
            dataList = dataList[key]
          });
          dataList.map(data => {
            data = this.getDataLabel(data, item.labelKey)
            options.push({
              label: item.renderOption ? item.renderOption(data) : data[this.getLastKey(item.labelKey)],
              value: data[this.getLastKey(item.valueKey)],
              data: data
            })
            if (data.hasOwnProperty(item.childrenMultipleKey)) {
              dealData(data[item.childrenMultipleKey]);
            }
          })
        };
        dealData(res.data);
        let searchForm = this.state.searchForm;
        searchForm = searchForm.map(searchItem => {
          if (searchItem.id === item.id)
            searchItem.options = options;
          return searchItem;
        });
        this.setState({ searchForm });
      })
    }
  };

  /**
   * 如果是select的设置值，如果options内没有值时应先增加一个默认的对应option
   * @param item  对应searchForm的表单项
   * @param value 需要设置的值 {label: '', value: ''}
   * @param index 当type为items时的序列
   */
  onSetSelectValue = (item, value, index) => {
    if (!value.value) return;
    let valueWillSet = {};
    let searchForm = this.state.searchForm;
    if (index === undefined)
      searchForm = searchForm.map(searchItem => {
        if (searchItem.id === item.id) {
          valueWillSet[searchItem.id] = item.entity ? { key: value.value, label: value.label } : (value.value + '');
          if (searchItem.options.length === 0 || (searchItem.options.length === 1 && searchItem.options[0].temp)) {
            let dataOption = {};
            searchItem.options = [];
            dataOption[item.type === 'value_list' ? 'code' : this.getLastKey(item.valueKey)] = value.value;
            dataOption[item.type === 'value_list' ? 'messageKey' : this.getLastKey(item.labelKey)] = value.label;
            searchItem.options.push({ label: value.label, value: value.value, data: dataOption, temp: true })
          }
        }
        return searchItem;
      });
    else
      searchForm[index].items = searchForm[index].items.map((searchItem, index) => {
        if (searchItem.id === item.id) {
          valueWillSet[searchItem.id] = searchItem.entity ? {
            key: value[index].value,
            label: value[index].label
          } : (value[index].value + '');
          if (searchItem.options.length === 0 || (searchItem.options.length === 1 && searchItem.options[0].temp)) {
            let dataOption = {};
            searchItem.options = [];
            dataOption[item.type === 'value_list' ? 'code' : this.getLastKey(searchItem.valueKey)] = value[index].value;
            dataOption[item.type === 'value_list' ? 'messageKey' : this.getLastKey(searchItem.labelKey)] = value[index].label;
            searchItem.options.push({
              label: value[index].label,
              value: value[index].value,
              data: dataOption,
              temp: true
            })
          }
        }
        return searchItem;
      });
    this.setState({ searchForm }, () => {
      this.props.form.setFieldsValue(valueWillSet);
    });
  };

  /**
   * 设置searchForm的值
   * @param options 需要设置的值，与form.setFieldsValue值格式一致
   * input、switch、data、radio、big_radio、checkbox直接传入对应字符串value即可
   * select、value_list 所需的默认值需要哦为 {label: '', value: ''}
   * list 所需格式为包含显示值与数据值的对象数组，根据valueKey与labelKey对应
   * TODO: combobox 与 multiple 模式待开发
   *
   * @example：
   *
   * <SearchArea wrappedComponentRef={(inst) => this.formRef = inst} {...props} />
   *
   * this.formRef.setValues({
      listId: [{user: '', userOID: ''}, ...],
      selectId: {label: '', value: ''},
      inputId: 'value',
      value_listId: {label: '', value: ''}
    });
   *
   */
  setValues = (options) => {
    Object.keys(options).map(key => {
      let searchForm = [].concat(this.state.searchForm);
      searchForm.map((searchItem, index) => {
        if (searchItem.id === key) {
          if ((searchItem.type === 'select' || searchItem.type === 'value_list') && (typeof options[key] === 'object' || options[key].splice))
            this.onSetSelectValue(searchItem, options[key]);
          else if (searchItem.type === 'list') {
            let value = {};
            value[key] = options[key];
            this.props.form.setFieldsValue(value)
          } else if (searchItem.type === 'date') {
            let value = {};
            value[key] = options[key] ? moment(options[key]) : undefined;
            this.props.form.setFieldsValue(value)
          } else if (searchItem.type === 'switch') {
            let value = {};
            value[key] = options[key];
            this.props.form.setFieldsValue(value)
          } else {
            let value = {};
            value[key] = options[key] ? options[key] + '' : undefined;
            this.props.form.setFieldsValue(value)
          }
        } else if (searchItem.type === 'items') {
          searchItem.items.map(subItem => {
            if (subItem.id === key) {
              if ((subItem.type === 'select' || subItem.type === 'value_list') && typeof options[key] === 'object')
                this.onSetSelectValue(subItem, options[key], index);
              else if (subItem.type === 'list') {
                let value = {};
                value[key] = options[key];
                this.props.form.setFieldsValue(value)
              } else if (subItem.type === 'date') {
                let value = {};
                value[key] = options[key] ? moment(options[key]) : undefined;
                this.props.form.setFieldsValue(value)
              } else if (subItem.type === 'switch') {
                let value = {};
                value[key] = options[key];
                this.props.form.setFieldsValue(value)
              } else {
                let value = {};
                value[key] = options[key] ? options[key] + '' : undefined;
                this.props.form.setFieldsValue(value)
              }
            }
          })
        }
      })
    });
  };

  //把上传的图片，绑定到对应的字段上
  handleUploadImageChange = (file, id) => {
    let searchForm = this.state.searchForm;
    let _file = file[0];
    for (let i = 0; i < searchForm.length; i++) {
      if (id === searchForm[i].id) {
        searchForm[i]._file = _file;
      }
    }
  }

  //渲染搜索表单组件
  renderFormItem(item) {
    let handle = item.event ? (event) => this.handleEvent(event, item) : () => {
    };
    if (item.type.toLowerCase() === 'img' || item.type.toLowerCase() === 'image') {
      item.type = 'img';
    }
    switch (item.type) {
      case 'img': {
        return <div>
          <ImageUpload attachmentType="INVOICE_IMAGES"
            defaultFileList={[]}
            onChange={(file) => {
              this.handleUploadImageChange(file, item.id)
            }}
            maxNum={1} />
        </div>
      }
      //输入组件
      case 'input': {
        if(item.language)
          return <LanguageInput name={name}
                                i18nName={item.nameI18n}
                                nameChange={handle}
                                disabled={item.disabled} />;

        return <Input placeholder={item.placeholder || messages('common.please.enter')}
          onChange={handle} disabled={item.disabled} />
      }
      //输入金额组件组件
      case 'inputNumber': {
        let min = item.min? {}:{min: 0};
        return <InputNumber style={{ width: '100%' }} precision={2} {...min} step={0.01}
          placeholder={item.placeholder || messages('common.please.enter')}
          onChange={handle} disabled={item.disabled} />
      }
      //选择组件
      case 'select': {
        return (
          <Select placeholder={item.placeholder || messages('common.please.select')}
            onChange={handle}
            allowClear
            disabled={item.disabled}
            labelInValue={!!item.entity}
            onFocus={item.getUrl ? () => this.getOptions(item) : () => {
            }}
            notFoundContent={item.fetching ? <Spin size="small" /> : messages('agency.setting.no.result')}
          >
            {item.options.map((option) => {
              return <Option key={option.value}
                title={option.data && !!item.entity ? JSON.stringify(option.data) : ''}>{option.label}</Option>
            })}
          </Select>
        )
      }
      //级联选择
      case 'cascader': {
        return (
          <Cascader placeholder={item.placeholder || messages('common.please.select')}
            onChange={handle}
            options={item.options}
            allowClear
            showSearch
            disabled={item.disabled}>
          </Cascader>
        )
      }
      //值列表选择组件
      case 'value_list': {
        return (
          <Select placeholder={item.placeholder || messages('common.please.select')}
            onChange={handle}
            allowClear={!item.clear}
            disabled={item.disabled}
            labelInValue={!!item.entity}
            onFocus={() => this.getValueListOptions(item)}
          >
            {item.options.map((option) => {
              return <Option key={option.value}
                title={option.data && !!item.entity ? JSON.stringify(option.data) : ''}>{option.label}</Option>
            })}
          </Select>
        )
      }
      //日期组件
      case 'date': {
        let formatValue = item.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
        return <DatePicker format={formatValue} onChange={handle} disabled={item.disabled} showTime={item.showTime}
          placeholder={item.placeholder || messages('common.please.select')} />
      }
      //日期
      case 'datePicker': {
        return <RangePicker format="YYYY-MM-DD" onChange={handle} disabled={item.disabled}
          // disabledDate={date => { return date && date.valueOf() > new Date().getTime()}}
         />
      }
      // 日期范围选择
      // noRange 是否有范围限制
      case 'rangePicker': {
        return <RangePicker format="YYYY-MM-DD" onChange={handle} disabled={item.disabled}
          disabledDate={date => {
            return !item.noRange && date && date.valueOf() > new Date().getTime()
          }}
        />
      }
      // 单日期组成的日期选择框
      case 'rangePickerInput': {
        return null;
      }
      // 日期范围组件，可选时分秒
      case 'rangeDateTimePicker': {
        return <RangePicker
          showTime={{
            hideDisabledOptions: true,
            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
          }}
          format="YYYY-MM-DD HH:mm:ss" onChange={handle} disabled={item.disabled}
        />
      }
      //单选组件
      case 'radio': {
        return (
          <RadioGroup onChange={handle} disabled={item.disabled}>
            {item.options.map((option) => {
              return <Radio value={option.value} key={option.value}>{option.label}</Radio>
            })}
          </RadioGroup>
        )
      }
      //单选组件（大）
      case 'big_radio': {
        return (
          <RadioGroup size="large" onChange={handle} disabled={item.disabled}>
            {item.options.map((option) => {
              return <RadioButton value={option.value} key={option.value}>{option.label}</RadioButton>
            })}
          </RadioGroup>
        )
      }
      //选择框
      case 'checkbox': {
        return <CheckboxGroup options={item.options} onChange={handle} disabled={item.disabled} />
      }
      //带搜索的选择组件
      case 'combobox': {
        return <Select
          labelInValue={!!item.entity}
          showSearch
          allowClear
          placeholder={item.placeholder || messages('common.please.enter')}
          onChange={handle}
          onFocus={item.getUrl ? () => this.setOptionsToFormItem(item, item.getUrl) : () => {
          }}
          onSearch={item.searchUrl ? (key) => this.setOptionsToFormItem(item, item.searchUrl, key) : () => {
          }}
          disabled={item.disabled}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {item.options.map((option) => {
            return <Option key={option.value}
              title={option.data && !!item.entity ? JSON.stringify(option.data) : ''}>{option.label}</Option>
          })}
        </Select>
      }
      //带搜索的多选组件
      case 'multiple': {
        return <Select
          mode="multiple"
          labelInValue={!!item.entity}
          placeholder={item.placeholder || messages('common.please.select')}
          filterOption={!item.searchUrl}
          optionFilterProp='children'
          onChange={handle}
          onFocus={item.getUrl ? () => this.setOptionsToFormItem(item, item.getUrl) : () => {
          }}
          onSearch={item.searchUrl ? (key) => this.setOptionsToFormItem(item, item.searchUrl, key) : () => {
          }}
          disabled={item.disabled}
        >
          {item.options.map((option) => {
            return <Option key={option.value}
              title={option.data && !!item.entity ? JSON.stringify(option.data) : ''}>{option.label}</Option>
          })}
        </Select>
      }
      //弹出框列表选择组件
      case 'list': {
        return <Chooser placeholder={item.placeholder || messages('common.please.select')}
          disabled={item.disabled}
          type={item.listType}
          showClear={item.clear}
          onChange={handle}
          labelKey={this.getLastKey(item.labelKey)}
          valueKey={this.getLastKey(item.valueKey)}
          listExtraParams={item.listExtraParams}
          selectorItem={item.selectorItem}
          single={item.single} />
      }
      //switch状态切换组件
      case 'switch': {
        return <Switch checkedChildren={<Icon type="check" />}
          unCheckedChildren={<Icon type="cross" />}
          onChange={handle}
          disabled={item.disabled} />
      }
      case 'selput': {
        return <Selput onChange={handle}
          placeholder={item.placeholder}
          type={item.listType}
          listExtraParams={item.listExtraParams}
          selectorItem={item.selectorItem}
          valueKey={item.valueKey}
          disabled={item.disabled} />
      }
      //同一单元格下多个表单项组件
      case 'items': {
        let colSpan = this.getItemCol(item);
        return (
          <Row gutter={10} key={item.id}>
            {item.label ? (
              <Col span={item.labelCol || 4}>
                <label className="item-label">{item.label}</label>
              </Col>) : ''}
            {item.items.map(searchItem => {
              return (
                <Col span={colSpan} key={searchItem.id}>
                  <FormItem label={searchItem.label} colon={false}>
                    {this.props.form.getFieldDecorator(searchItem.id, {
                      initialValue: this.getDefaultValue(searchItem),
                      rules: [{
                        required: searchItem.isRequired,
                        message: messages('common.can.not.be.empty', { name: searchItem.label }),  //name 不可为空
                      }]
                    })(
                      this.renderFormItem(searchItem)
                      )}
                  </FormItem>
                </Col>
              )
            }
            )}
          </Row>
        )
      }
    }
  }
  getItemCol = (item) => {
    let length = +item.items.length;
    return item.label ? parseInt(`${(24 - item.labelCol) / length}`) : parseInt(`${24 / length}`)

  };
  //关联组件选择值改变处理
  formItemChange(value) {
    let timeObj = [
      { from: 'startDate', to: 'endDate' },
      { from: 'dateFrom', to: 'dateTo' },
      { from: 'approvalStartDate', to: 'approvalEndDate' },
      { from: 'paymentStartDate', to: 'paymentEndDate' },
      { from: 'beginDate', to: 'endDate' },
      { from: 'approvalStartDate', to: 'approvalEndDate' },
      { from: 'auditedApprovalStartDate', to: 'auditedApprovalEndDate' },
      { from: 'flyStartDate', to: 'flyEndDate' }
    ];/*items的id值*/
    let { getFieldValue, setFieldsValue } = this.props.form;
    timeObj.map(item => {
      if (value[item.from] && getFieldValue(item.to) && getFieldValue(item.to).isBefore(value[item.from], 'day')) {
        message.error(messages('components.search.timeMoreLimit'));
        setFieldsValue({ [item.from]: null });
      }
      if (value[item.to] && getFieldValue(item.from) && value[item.to].isBefore(getFieldValue(item.from), 'day')) {
        message.error(messages('components.search.timeLessLimit'));
        setFieldsValue({ [item.to]: null });
      }
    });
  };

  getFields() {
    const count = this.state.expand ? this.state.searchForm.length : this.props.maxLength;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {};
    const children = [];
    this.state.searchForm.map((item, i) => {
      children.push(
        <Col span={item.colSpan || 8} key={item.id} style={{ display: i < count ? 'block' : 'none' }}>
          {item.type === 'items' ? this.renderFormItem(item) :
            <FormItem {...formItemLayout} label={item.label}>
              {getFieldDecorator(item.id, {
                valuePropName: item.type === 'switch' ? 'checked' : 'value',
                initialValue: this.getDefaultValue(item),
                rules: [{
                  required: item.isRequired,
                  message: messages('common.can.not.be.empty', { name: item.label }),  //name 不可为空
                }]
              })(
                this.renderFormItem(item)
                )}
            </FormItem>
          }
        </Col>
      );
    });
    children.push(this.getExtraFields());
    return children;
  }

  getDefaultValue = item => {
    if (item.type === 'select' && item.defaultValue && item.defaultValue.key)
      return item.defaultValue.key;
    else
      return item.defaultValue;
  };

  getExtraFields() {
    //要使用extraFields，<Col span={8}设置为8,不然无法对齐
    const children = [];
    if (this.props.isExtraFields && this.props.extraFields && this.props.extraFields.length > 0) {
      this.props.extraFields.map((item, i) => {
        children.push(
          <Col span={8} key={i + "extraFields"}>
            {this.props.extraFields[i]}
          </Col>
        )
      });
      return children;
    } else {
      return (
        <div key="extraFields" />
      )
    }
  }

  getCheckboxList() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div className="checkbox-list-form">
        {this.state.checkboxListForm.map(list => {
          let checked;
          if (list.single) {
            list.items.map(item => {
              item.checked && item.checked.map(value => {
                checked = value;
              });
            });
          } else {
            checked = [];
            list.items.map(item => {
              item.checked && item.checked.map(value => {
                checked.push(value)
              });
            });
          }
          return (
            <FormItem key={list.id}>
              {getFieldDecorator(list.id, {
                initialValue: checked
              })(
                list.single ?
                  <RadioGroup onChange={e => {
                    this.props.checkboxChange({[list.id]: e.target.value})
                  }}>
                    {list.items.map(item => {
                      return (
                        <Row className="list-row" key={item.key}>
                          <Col span={3} className="list-col-header">{item.label} :</Col>
                          <Col span={2} className="list-col-content" onClick={() => this.checkboxToggle(item)}>
                            {/*折叠:展开*/}
                            <a>{item.expand ? messages("components.search.upload.fold") : messages("components.search.upload.more")}
                              <Icon type={item.expand ? 'up' : 'down'} style={{marginLeft: '10px'}}/>
                            </a>
                          </Col>
                          <Col span={19} className="list-col-content" style={{height: item.expand ? 'auto' : '42px'}}>
                            {item.options.map(option => {
                              return (
                                <Radio value={option.value}
                                       key={option.value}>{messages(option.label)}</Radio>)
                            })}
                          </Col>
                        </Row>)
                    })}
                  </RadioGroup>
                  :
                  <div>
                    {list.items.map(item => {
                      item.expand = list[`${list.id}Expand`] ? true : item.expand;
                      list[`${list.id}Expand`] = false;
                      return (
                        <Row className="list-row" key={item.key}>
                          <Col span={3} className="list-col-header"><span>{item.label} :</span></Col>
                          {/*TODO: 由于 ant design pro 没有做国际化，所以暂时将【展开／折叠】及【全部】单独处理。*/}
                          <Col span={2} className="list-col-content" onClick={() => this.checkboxToggle(item)}>
                            {/*折叠:展开*/}
                            <a>{item.expand ? messages("components.search.upload.fold") : messages("components.search.upload.more")}
                              <Icon type={item.expand ? 'up' : 'down'} style={{marginLeft: '10px'}}/>
                            </a>
                          </Col>
                          <Col span={19} className="list-col-content" style={{height: item.expand ? 'auto' : '42px'}}>
                            <TagSelect key={item.key}
                                       value={item.checked}
                                       onChange={(checked) => this.onCheckChange(list.id, item.key, checked)}>
                              {item.options.map(option => {
                                return <TagSelect.Option key={option.value}
                                                         value={option.value}>{option.label}</TagSelect.Option>
                              })}
                            </TagSelect>
                          </Col>
                        </Row>)
                    })}
                  </div>
              )}
            </FormItem>)
        })}
      </div>
    )

    // return null;
  }

  render() {
    return (
      <div style={{ position: 'relative', clear: 'both' }} id="search-area">
        <Form
          className="ant-advanced-search-form search-area"
          // onSubmit={this.handleSearch}
          layout="vertical"
        >
          {this.props.checkboxListForm && this.getCheckboxList()}
          <div className="common-top-area">
            <Row gutter={40} type="flex" align="top">{this.getFields()}</Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                {this.state.searchForm.length > this.props.maxLength ? (
                  <a className="toggle-button" onClick={this.toggle}>
                    {this.state.expand ? messages('common.fold') : messages('common.more')}
                    <Icon type={this.state.expand ? 'up' : 'down'} />
                  </a>
                ) : null}
                {
                  this.props.isHideOkTextText ? "" :
                    <Button type="primary" onClick={this.handleSearch} loading={this.props.loading}>
                      {this.$t(this.props.okText)}</Button>
                }

                {
                  this.props.isHideClearText ? "" : <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                    {this.$t(this.props.clearText)}
                  </Button>
                }

              </Col>
            </Row>
          </div>
        </Form>
      </div>
    )
  }
}

/**
 *
 * @type searchForm 表单列表，如果项数 > maxLength 则自动隐藏多余选项到下拉部分，每一项的格式如下：
 * {
          type: '',  //必填，类型,为input、inputNumber、select、cascader、 date、radio、big_radio、checkbox、combobox、multiple、 list、 items、 value_list、 selput中的一种
          id: '',  //必填，表单id，搜索后返回的数据key
          placeholder: '',  //可选，表单placeholder
          label: '',  //必填，界面显示名称label
          listType: '',  //可选，当type为list、selput，listSelector的type类型
          listExtraParams: '',  //可选，当type为list、selput时有效，listSelector的extraParams
          disabled: false  //可选，是否可用
          isRequired: false,  //可选，是否必填
          options: [{label: '',  value: ''}],  //可选，如果不为input、date时必填，为该表单选项数组，因为不能下拉刷新，所以如果可以搜索type请选择combobox或multiple，否则一次性传入所有值
          selectorItem: {},  //可选，当type为list、selput时有效，当listType满足不了一些需求时，可以使用次参数传入listSelector的配置项
          event: '',   //可选，自定的onChange事件ID，将会在eventHandle回调内返回
          defaultValue: '',  //可选，默认值，如果type为select且options为空时，可传入string或object({label, key})的初始值
          searchUrl: '',  //可选，当类型为combobox和multiple有效，搜索需要的接口，
          getUrl: '',  //可选，初始显示的值需要的接口,适用与select、multiple、combobox
          method: '',   //可选，getUrl接口所需要的接口类型get/post
          searchKey: '',  //可选，搜索参数名
          labelKey: '',  //可选，接口返回或list返回的数据内所需要页面options显示名称label的参数名，
          valueKey: '',  //可选，接口返回或list返回的数据内所需要options值key的参数名, 或selput内回填的参数名
          items: [],  //可选，当type为items时必填，type为items时代表在一个单元格内显示多个表单项，数组元素属性与以上一致
          entity: false,  //已禁用，select、combobox、multiple、list选项下是否返回实体类，如果为true则返回整个选项的对象，否则返回valueKey对应的值
          getParams: {},  //可选,getUrl所需要的参数
          single: false,  //可选,当type为list时是否为单选
          valueListCode: '',  //可选，当type为value_list时的值列表code
          colSpan: '',  //可选，自定义搜索项的宽度
          renderOption: (option) => {},  //可选，当类型为select、coombobox、multiple、value_list时选项option的渲染规则
          listKey: '',  //可选，getUrl接口返回值内的变量名，如果接口直接返回数组则置空
          childrenMultipleKey: '' //可选，是否递归遍历子对象
          showTime: false, //可选，当type为date时，控制是否需要选择时间
        }
 */

/**
 *
 * @type checkboxListForm checkbox表单列表，每一项的格式如下：
 * {
      id: '',     //必填，表单id，搜索后返回的数据key
      single: false,  //可选，是否单选
      items: [{label: '', key: '', options: [{label: '',  value: '', disabled: false}]}], //必填，详见下
   }
 *
 * @param items
 * {
      label: '',   //必填，每行列表的label显示
      key: '',    //必填，唯一，每行的标识
      checked: [],    //可选，默认选中的value值
      options: [{label: '',  value: '', disabled: false}]  //必填，checkbox可选项
   }
 */
SearchArea.propTypes = {
  searchForm: PropTypes.array.isRequired,  //传入的表单列表
  checkboxListForm: PropTypes.array,  //传入的checkbox表单列表
  submitHandle: PropTypes.func.isRequired,  //搜索事件
  eventHandle: PropTypes.func,  //表单项点击事件
  clearHandle: PropTypes.func,  //重置事件
  okText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),  //左侧ok按钮的文本
  clearText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),  //右侧重置按钮的文本
  maxLength: PropTypes.number,  //搜索区域最大表单数量
  loading: PropTypes.bool, //用于base-info组件的保存按钮
  checkboxChange: PropTypes.func, //checkbox表单列表修改时返回选中value事件
  isExtraFields: PropTypes.bool,//是否添加额外的自定义搜索参数
  extraFields: PropTypes.array,//额外的搜索配置:自己传入节点，不过加了额外的搜索，主要在外面的submitHandle函数里面进行接收
  //extraFields类型传数组为了适应样式
  isHideClearText: PropTypes.bool,//是否隐藏清空按钮
  isHideOkTextText: PropTypes.bool,//是否隐藏搜索按钮
  onRef: PropTypes.func, //ref调用子组件函数或者值
  isReturnLabel: PropTypes.bool, //用于数据缓存
};

SearchArea.defaultProps = {
  maxLength: 6,
  eventHandle: () => { },
  okText: 'common.search',  //搜索
  clearText: 'common.clear',  //重置
  loading: false,
  isHideClearText: false,
  isHideOkTextText: false,
  checkboxChange: () => { },
};

const WrappedSearchArea = Form.create(
  {
    onValuesChange(props, values) {
      searchAreaThis.formItemChange(values);
    },
  }
)(SearchArea);

export default WrappedSearchArea;
