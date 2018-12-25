/**
 * Created by zhouli on 18/3/8
 * Email li.zhou@huilianyi.com
 */
//个人基本信息
//传入个人基本信息
//组件里面负责更新
//   重构值列表多语言，加几个code
//如果没有值，就传null，后端根据这个code值决定使用值列表的值
//   duty_code: null,  //职务编码
//   employeeType_code: "null,//员工类型编码
//   rank_code: null",//级别编码
import React from 'react';
import {
  Button,
  Form,
  Select,
  Input,
  Col,
  Row,
  message,
  Tooltip,
  DatePicker,
  Icon,
  TimePicker,
} from 'antd';
import PDService from 'containers/enterprise-manage/person-manage/person-detail/person-detail.service';
import moment from 'moment';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Chooser from 'components/Widget/chooser';
import { deepCopy, fitText } from 'utils/extend';
import { personObjDefaultWithoutExtend } from 'containers/enterprise-manage/person-manage/person-detail/person-detail.model';
import 'styles/enterprise-manage/person-manage/person-detail/person-detail-components/basic-info.scss';
import { ImageUpload } from 'components/Widget/index';
import PropTypes from 'prop-types';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

class PersonBasicInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      personObj: {
        customFormValues: [],
      },
      data: [],
      genderData: [],
      preFixList: [],
    };
  }

  componentWillMount() {
    this.setState({ personObj: this.props.basicInfoData });
  }
  componentDidMount() {
    //手机号前缀
    this.getMobilevalidateList();
    //性别
    this.getSystemValueList(1007).then(res => {
      this.setState({
        genderData: res.data.values,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    let personObj = nextProps.basicInfoData;
    this.setState({ personObj });
  }

  getMobilevalidateList = () => {
    PDService.getMobilevalidateList().then(res => {
      this.setState({
        preFixList: res.data,
      });
    });
  };

  // 把表单的值设置到人员信息扩展字段里面去
  setFromToCustomFormValues = values => {
    if (this.state.personObj.customFormValues) {
      let customFormValues = this.state.personObj.customFormValues;
      for (let key in values) {
        for (let i = 0; i < customFormValues.length; i++) {
          if (customFormValues[i].fieldOid === key) {
            if (customFormValues[i].messageKey === 'common.date') {
              customFormValues[i].value = values[key]
                ? new Date(moment(values[key]).format('YYYY-MM-DD'))
                : '';
            } else if (customFormValues[i].messageKey === 'time') {
              if (values[key]) {
                customFormValues[i].value = moment(values[key]).format('HH:mm');
              } else {
                customFormValues[i].value = '';
              }
            } else if (customFormValues[i].messageKey === 'image') {
              //把attachmentImages赋值，只是为了前端展示
              customFormValues[i].attachmentImages = values[key];
              //这个地方要注意一下 服务端返回的图片字段是attachmentImages
              //但是上传的时候是attachments
              customFormValues[i].attachments = values[key];
              //还需要把value设置一下
              if (customFormValues[i].attachments) {
                let _values = [];
                for (let j = 0; j < customFormValues[i].attachments.length; j++) {
                  _values.push(customFormValues[i].attachments[j].attachmentOid);
                }
                customFormValues[i].value = JSON.stringify(_values);
              }
            } else {
              customFormValues[i].value = values[key];
            }
          }
        }
      }
    }
  };

  //点击保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setFromToCustomFormValues(values);
        if (values.gender + '' === '0' || values.gender === '男') {
          values.gender = 0;
        } else if (values.gender + '' === '1' || values.gender === '女') {
          values.gender = 1;
        } else {
          //2代表未知
          values.gender = 2;
        }
        let originPersonObj = deepCopy(this.state.personObj);
        console.log(originPersonObj);
        console.log(values);
        if (this.state.personObj.userOid) {
          //更新用户信息
          let personObj = Object.assign(
            {},
            {
              userOid: this.state.personObj.userOid,

              companyOid: values.companyOid[0]
                ? values.companyOid[0].companyOid
                : this.state.personObj.companyOid,
              companyName: values.companyOid[0]
                ? values.companyOid[0].name
                : this.state.personObj.companyName,
              //
              departmentOid: values.departmentName[0]
                ? values.departmentName[0].departmentOid
                : this.state.personObj.departmentOid,
              departmentName: values.departmentName[0]
                ? values.departmentName[0].name
                : this.state.personObj.departmentName,
              //
              directManager: values.directManager[0] ? values.directManager[0].userOid : '',
              //
              // duty: values.duty[0] ? values.duty[0].messageKey : this.state.personObj.duty,
              dutyCode: values.duty[0] ? values.duty[0].value : null,
              // employeeType: values.employeeType[0] ? values.employeeType[0].messageKey : this.state.personObj.employeeType,
              employeeTypeCode: values.employeeType[0] ? values.employeeType[0].value : null,
              // rank: values.rank[0] ? values.rank[0].messageKey : this.state.personObj.rank,
              rankCode: values.rank[0] ? values.rank[0].value : null,
              title: values.title,
              //
              email: values.email,
              mobile: values.mobile,
              countryCode:
                values.mobilePrefix.split('$$').length > 1
                  ? values.mobilePrefix.split('$$')[0]
                  : this.state.personObj.countryCode,
              mobileCode:
                values.mobilePrefix.split('$$').length > 1
                  ? values.mobilePrefix.split('$$')[1]
                  : this.state.personObj.mobileCode, //手机前缀:默认86
              //
              employeeID: values.employeeID,
              fullName: values.fullName,
              //男
              // gender: values.gender,//必须是int类型不然报错,可以不传，后端用的是genderCode
              genderCode: values.gender,
              birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
              entryTime: values.entryTime ? values.entryTime.format('YYYY-MM-DD') : null,
            }
          );
          this.setState({
            loading: true,
          });
          personObj.customFormValues = originPersonObj.customFormValues;
          //这个接口报错信息注意，
          //邮箱格式传的不对：email，报错说传的不是json
          //性别字段传的不对：gender，报错说传的不是json
          PDService.updatePersonDetail(personObj).then(res => {
            //操作成功
            message.success(this.$t('common.operate.success'));
            this.setState({
              loading: false,
            });
            this.props.savedData(res.data);
          });
        } else {
          let personObj = Object.assign(personObjDefaultWithoutExtend, {
            companyOid: values.companyOid[0]
              ? values.companyOid[0].companyOid
              : this.state.personObj.companyOid,
            companyName: values.companyOid[0]
              ? values.companyOid[0].name
              : this.state.personObj.companyName,
            //
            departmentOid: values.departmentName[0]
              ? values.departmentName[0].departmentOid
              : this.state.personObj.departmentOid,
            departmentName: values.departmentName[0]
              ? values.departmentName[0].name
              : this.state.personObj.departmentName,
            //
            directManager: values.directManager[0] ? values.directManager[0].userOid : '',
            //
            // duty: values.duty[0] ? values.duty[0].messageKey : this.state.personObj.duty,
            dutyCode: values.duty[0] ? values.duty[0].value : this.state.personObj.dutyCode,
            // employeeType: values.employeeType[0] ? values.employeeType[0].messageKey : this.state.personObj.employeeType,
            employeeTypeCode: values.employeeType[0]
              ? values.employeeType[0].value
              : this.state.personObj.employeeTypeCode,
            // rank: values.rank[0] ? values.rank[0].messageKey : this.state.personObj.rank,
            rankCode: values.rank[0] ? values.rank[0].value : this.state.personObj.rankCode,
            title: values.title,
            //
            email: values.email,
            mobile: values.mobile,
            countryCode:
              values.mobilePrefix.split('$$').length > 1
                ? values.mobilePrefix.split('$$')[0]
                : this.state.personObj.countryCode,
            mobileCode:
              values.mobilePrefix.split('$$').length > 1
                ? values.mobilePrefix.split('$$')[1]
                : this.state.personObj.mobileCode, //手机前缀:默认86
            //
            employeeID: values.employeeID,
            fullName: values.fullName,
            //
            // gender: values.gender,//必须是int类型不然报错，可以不传，后端用的是genderCode
            genderCode: values.gender,
            birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
            entryTime: values.entryTime ? values.entryTime.format('YYYY-MM-DD') : null,
          });

          this.setState({
            loading: true,
          });
          personObj.customFormValues = originPersonObj.customFormValues;
          PDService.createPersonDetail(personObj).then(res => {
            // 操作成功
            message.success(this.$t('common.operate.success'));
            this.setState({
              loading: false,
            });
            this.props.savedData(res.data);
            let record = res.data;
            this.props.dispatch(
              routerRedux.push({
                pathname: `/setting/employee/person-detail/person-detail/${record.userOid}`,
              })
            );
          });
        }
      }
    });
  };

  handleChange = val => {
    if (this.state.loading) {
      this.setState({
        loading: false,
      });
    }
  };

  //点击取消
  handleCancel = e => {
    e.preventDefault();
    this.props.form.resetFields();
    this.props.toNoEditing();
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/setting/employee`,
      })
    );
  };
  //渲染手机前缀
  renderMobilePrefix = preFixList => {
    if (preFixList.length > 1) {
      let preFixListDom = preFixList.map(item => {
        return (
          // CN + 86 + 中国
          <Option
            value={item.shortName + '$$' + item.countryCode + '$$' + item.countryName}
            key={item.countryCode}
          >
            {item.countryName + '(' + item.countryCode + ')'}
          </Option>
        );
      });
      return (
        <Select style={{ width: 150 }} showSearch>
          {preFixListDom}
        </Select>
      );
    } else {
      return (
        <Select style={{ width: 150 }}>
          <Option value="86">+86</Option>
        </Select>
      );
    }
  };

  //渲染字段的内容，根据情况进行截取，鼠标浮动有提示
  renderNoEditingText = text => {
    let _text = fitText(text, 12);
    if (_text.text) {
      return (
        <Tooltip title={_text.origin}>
          <span>{_text.text}</span>
        </Tooltip>
      );
    } else {
      return text;
    }
  };
  renderNoEditingTextTime = date => {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    } else {
      return '';
    }
  };
  //渲染非编辑状态
  renderNoEditing = () => {
    //这个显示也可以尝试弄成3列
    let person = this.state.personObj;
    return (
      <div className="info-item-wrap">
        <div className="info-item f-left">
          <div className="info-item-title">
            {/*工号：*/}
            {this.$t('pdc.basic.info.employeeId')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.employeeID)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*姓名：*/}
            {this.$t('pdc.basic.info.name')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.fullName)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*公司：*/}
            {/*这地方原本老公司是线上法人实体*/}
            {/*今天与产品共同商量，达成一致，无论新老公司，都显示为  公司*/}
            {this.$t('pdc.basic.info.company')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.companyName)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*部门：*/}
            {this.$t('pdc.basic.info.dep')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.departmentName)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*邮箱：*/}
            {this.$t('pdc.basic.info.email')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.email)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*手机：*/}
            {this.$t('pdc.basic.info.mobile')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.mobile)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*直属领导：*/}
            {this.$t('pdc.basic.info.direct.manager')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.directManagerName)}</div>
        </div>
        <div className="info-item f-left">
          <div className="info-item-title">
            {/*职务：*/}
            {this.$t('pdc.basic.info.duty')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.duty)}</div>
        </div>
        <div className="info-item f-left">
          <div className="info-item-title">
            {/*职位：*/}
            {this.$t('pdc.basic.info.title')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.title)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*人员类型：*/}
            {this.$t('pdc.basic.info.person.type')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.employeeType)}</div>
        </div>
        <div className="info-item f-left">
          <div className="info-item-title">
            {/*级别：*/}
            {this.$t('pdc.basic.info.level')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingText(person.rank)}</div>
        </div>

        <div className="info-item f-left">
          <div className="info-item-title">
            {/*性别：*/}
            {this.$t('pdc.basic.info.sex')}：
          </div>
          <div className="info-item-text">{person.gender}</div>
        </div>
        <div className="info-item f-left">
          <div className="info-item-title">
            {/*生日：*/}
            {this.$t('pdc.basic.info.bird')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingTextTime(person.birthday)}</div>
        </div>
        <div className="info-item f-left">
          <div className="info-item-title">
            {/*入职时间：*/}
            {this.$t('pdc.basic.info.enter.time')}：
          </div>
          <div className="info-item-text">{this.renderNoEditingTextTime(person.entryTime)}</div>
        </div>

        <div className="clear" />
       {/* <div>{this.renderExtendTitle()}</div>
        {this.renderNoEditingForExtend()}*/}
      </div>
    );
  };

  //渲染非编辑状态
  renderNoEditingForExtend = () => {
    let person = this.state.personObj;
    let values = person.customFormValues ? person.customFormValues : [];

    let dom = [];
    for (let i = 0; i < values.length; i++) {
      dom.push(this.renderContentByMessageKey(values[i]));
    }
    return (
      <div>
        {dom}
        <div className="clear" />
      </div>
    );
  };
  // -----扩展字段-非编辑状态---start
  renderContentByMessageKey = field => {
    let messageKey = field.messageKey;
    //分为：单行输入框，多行输入框，值列表，日期，数字，时间，图片
    switch (messageKey) {
      case 'input': {
        return this.renderFiled_input(field);
        break;
      }
      case 'text_area': {
        return this.renderFiled_text_area(field);
        break;
      }
      case 'cust_list': {
        return this.renderFiled_cust_list(field);
        break;
      }
      case 'date': {
        return this.renderFiled_date(field);
        break;
      }
      case 'common.date': {
        return this.renderFiled_date(field);
        break;
      }
      case 'number': {
        return this.renderFiled_number(field);
        break;
      }
      case 'time': {
        return this.renderFiled_time(field);
        break;
      }
      case 'image': {
        return this.renderFiled_image(field);
        break;
      }
    }
  };
  renderFiled_input = field => {
    let messageKey = field.messageKey;
    //后端可能返回的是值列表值对应的code（value），不是messageKey，需要找一下
    //参见bug13014
    if (
      messageKey === 'cust_list' &&
      field.customEnumerationList &&
      field.customEnumerationList.values &&
      field.customEnumerationList.values.length &&
      field.customEnumerationList.values.length > 0
    ) {
      let customEnumerationList = field.customEnumerationList.values;
      for (let i = 0; i < customEnumerationList.length; i++) {
        if (field.value === customEnumerationList[i].value) {
          field.value = customEnumerationList[i].messageKey;
        }
      }
    }

    return (
      <div className="info-item f-left" key={field.fieldOid}>
        <div className="info-item-title">{field.fieldName}：</div>
        <div className="info-item-text">{this.renderNoEditingText(field.value)}</div>
      </div>
    );
  };
  renderFiled_text_area = field => {
    return this.renderFiled_input(field);
  };
  renderFiled_cust_list = field => {
    return this.renderFiled_input(field);
  };
  renderFiled_date = field => {
    let date = field.value ? new Date(field.value).format('yyyy-MM-dd') : '';
    return (
      <div className="info-item f-left" key={field.fieldOid}>
        <div className="info-item-title">{field.fieldName}：</div>
        <div className="info-item-text">{date}</div>
      </div>
    );
  };
  renderFiled_number = field => {
    field.unit = '';
    if (field.fieldContent) {
      let content = JSON.parse(field.fieldContent);
      field.unit = content.unit;
    }
    return (
      <div className="info-item f-left" key={field.fieldOid}>
        <div className="info-item-title">{field.fieldName}：</div>
        <div className="info-item-text">
          {field.value}&nbsp;{field.value ? field.unit : ''}
        </div>
      </div>
    );
  };
  renderFiled_time = field => {
    let val = moment(field.value, 'HH:mm').format('HH:mm');
    if (field.value === null || field.value === '') {
      val = '';
    }
    if (field.value && field.value.length > 5) {
      //兼容以前的
      val = moment(field.value).format('HH:mm');
    }
    return (
      <div className="info-item f-left" key={field.fieldOid}>
        <div className="info-item-title">{field.fieldName}：</div>
        <div className="info-item-text">{val}</div>
      </div>
    );
  };
  renderFiled_image = field => {
    //可能需要渲染多张图片（1-3张）
    function _getTooltipImages(imgs) {
      let imgsDom = [];
      if (imgs && imgs.length > 0) {
        imgs.map(item => {
          imgsDom.push(
            <Tooltip title={<img className="info-item-img-tip" src={item.thumbnailUrl} />}>
              <img src={item.thumbnailUrl} />
            </Tooltip>
          );
        });
        return imgsDom;
      } else {
        return <div />;
      }
    }

    return (
      <div className="info-item f-left" key={field.fieldOid}>
        <div className="info-item-title">{field.fieldName}：</div>
        <div className="info-item-text">{_getTooltipImages(field.attachmentImages)}</div>
      </div>
    );
  };
  // -----扩展字段-非编辑状态---end

  // -----扩展字段 编辑状态---start
  renderEditingField = values => {
    let dom = [];
    for (let i = 0; i < values.length; i++) {
      dom.push(this.renderEditingContentByMessageKey(values[i]));
    }
    return dom;
  };
  renderEditingContentByMessageKey = field => {
    let messageKey = field.messageKey;
    //分为：单行输入框，多行输入框，值列表，日期，数字，时间，图片
    switch (messageKey) {
      case 'input': {
        return this.renderEditingFiled_input(field);
        break;
      }
      case 'text_area': {
        return this.renderEditingFiled_text_area(field);
        break;
      }
      case 'cust_list': {
        return this.renderEditingFiled_cust_list(field);
        break;
      }
      case 'date': {
        return this.renderEditingFiled_date(field);
        break;
      }
      case 'common.date': {
        return this.renderEditingFiled_date(field);
        break;
      }
      case 'number': {
        return this.renderEditingFiled_number(field);
        break;
      }
      case 'time': {
        return this.renderEditingFiled_time(field);
        break;
      }
      case 'image': {
        return this.renderEditingFiled_image(field);
        break;
      }
    }
  };
  renderEditingFiled_input = field => {
    const { getFieldDecorator } = this.props.form;

    return (
      <FormItem key={field.fieldOid} label={field.fieldName} colon={true}>
        {getFieldDecorator(field.fieldOid, {
          initialValue: field.value,
          rules: [
            {
              max: 50,
              message: this.$t('pdc.basic.e.info.max.inp.50'), //"最多50个"
            },
            {
              required: field.required,
              message: this.$t('common.please.enter'),
            },
          ],
        })(<Input placeholder={this.$t('common.please.enter')} />)}
      </FormItem>
    );
  };
  renderEditingFiled_text_area = field => {
    const { getFieldDecorator } = this.props.form;

    return (
      <FormItem key={field.fieldOid} label={field.fieldName} colon={true}>
        {getFieldDecorator(field.fieldOid, {
          initialValue: field.value,
          rules: [
            {
              max: 200,
              message: this.$t('pdc.basic.e.info.max.inp.200'), //"最多输入200个字符"
            },
            {
              required: field.required,
              message: this.$t('common.please.enter'),
            },
          ],
        })(<TextArea placeholder={this.$t('common.please.enter')} />)}
      </FormItem>
    );
  };
  renderEditingFiled_cust_list = field => {
    const { getFieldDecorator } = this.props.form;

    //如果是值列表类型，在返回的数据上，前端多挂了一个customEnumerationList属性，
    //这个选择列表就从这个属性上拿了
    return (
      <FormItem key={field.fieldOid} label={field.fieldName} colon={true}>
        {getFieldDecorator(field.fieldOid, {
          initialValue: field.value,
          rules: [
            {
              required: field.required,
              message: this.$t('common.please.enter'),
            },
          ],
        })(<Select>{_renderCustomEnumerationList(field.customEnumerationList.values)}</Select>)}
      </FormItem>
    );

    //渲染值列表
    function _renderCustomEnumerationList(list) {
      let dom = [];
      if (list.length > 0) {
        list.map(function(item) {
          //要做多语言，这个地方上传code，后端返回的时候，任然是messageKey，所以显示的时候用messageKey去查value显示
          //code值是null，所以传value，值列表的value就是code
          dom.push(
            <Option key={item.id} value={item.value}>
              {item.messageKey}
            </Option>
          );
          //之前上传的是messageKey
          // dom.push(<Option key={item.id} value={item.messageKey}>{item.messageKey}</Option>)
        });
        return dom;
      } else {
        return '';
      }
    }
  };
  renderEditingFiled_date = field => {
    const { getFieldDecorator } = this.props.form;

    let val = field.value ? moment(field.value).format('YYYY-MM-DD') : new Date();
    return (
      <FormItem key={field.fieldOid} label={field.fieldName} colon={true}>
        {getFieldDecorator(field.fieldOid, {
          initialValue: moment(val, 'YYYY-MM-DD'),
          rules: [
            {
              required: field.required,
              message: this.$t('common.please.enter'),
            },
          ],
        })(<DatePicker format={'YYYY-MM-DD'} />)}
      </FormItem>
    );
  };
  renderEditingFiled_number = field => {
    const { getFieldDecorator } = this.props.form;

    field.unit = null;
    if (field.fieldContent) {
      let content = JSON.parse(field.fieldContent);
      field.unit = content.unit;
      if (field.unit && field.unit.length > 0) {
        field.unit = '(' + field.unit + ')';
      } else {
        field.unit = '';
      }
    }
    // 要根据限制条件进行校验
    let fieldConstraint = {
      integerMaxLength: '',
      decimalMaxLength: '',
    };
    if (field.fieldConstraint) {
      let _fieldConstraint = JSON.parse(field.fieldConstraint);
      fieldConstraint.integerMaxLength = _fieldConstraint.integerMaxLength;
      fieldConstraint.decimalMaxLength = _fieldConstraint.decimalMaxLength;
      field._fieldConstraint = fieldConstraint;
    }

    return (
      <FormItem key={field.fieldOid} label={field.fieldName + field.unit} colon={true}>
        {getFieldDecorator(field.fieldOid, {
          initialValue: field.value,
          rules: [
            {
              required: field.required,
              message: this.$t('common.please.enter'),
            },
            {
              // 整数位数最多
              // 小数位最多
              message:
                this.$t('pdc.basic.e.info.max.int') +
                fieldConstraint.integerMaxLength +
                ',' +
                this.$t('pdc.basic.e.info.max.deci') +
                fieldConstraint.decimalMaxLength,
              validator: (fieldConstraint, value, cb) => {
                //必须是必填的才有校验
                if (field.fieldConstraint && field.required && value) {
                  let fieldConstraint = field._fieldConstraint;
                  if (
                    value.split('.')[0].length > fieldConstraint.integerMaxLength ||
                    (value.split('.')[1] &&
                      value.split('.')[1].length > fieldConstraint.decimalMaxLength)
                  ) {
                    cb(false);
                    return;
                  } else {
                    cb();
                  }
                } else {
                  cb();
                }
              },
            },
          ],
        })(<Input type="number" placeholder={this.$t('common.please.enter')} />)}
      </FormItem>
    );
  };
  onChangeTime = time => {};
  renderEditingFiled_time = field => {
    const { getFieldDecorator } = this.props.form;

    //周宗云说，这个  field.value就直接显示，正式环境没有这种数据
    //其他环境不管
    let val = moment(field.value, 'HH:mm');
    if (field.value === null || field.value === '') {
      val = '';
    }
    if (field.value && field.value.length > 5) {
      //兼容以前的
      val = moment(field.value).format('HH:mm');
      val = moment(val, 'HH:mm');
    }
    return (
      <FormItem key={field.fieldOid} label={field.fieldName} colon={true}>
        {getFieldDecorator(field.fieldOid, {
          initialValue: val,
          rules: [
            {
              required: field.required,
              message: this.$t('common.please.enter'),
            },
          ],
        })(<TimePicker onChange={this.onChangeTime} format={'HH:mm'} />)}
      </FormItem>
    );
  };
  renderEditingFiled_image = field => {
    const { getFieldDecorator } = this.props.form;

    //上传之后，图片对象直接就绑定到field.attachmentImages里面了
    const fileList = field.attachmentImages;
    function handleUploadImageChange(fileList) {}

    return (
      <FormItem key={field.fieldOid} label={field.fieldName} colon={true}>
        {getFieldDecorator(field.fieldOid, {
          initialValue: fileList,
          rules: [{ required: field.required, message: this.$t('common.please.enter') }],
        })(
          <ImageUpload
            attachmentType="INVOICE_IMAGES"
            fileType={['PNG', 'png', 'jpeg', 'jpeg', 'jpg', 'JPG', 'bmp', 'BMP']}
            defaultFileList={fileList}
            isShowDefault={true}
            onChange={handleUploadImageChange}
            maxNum={field.fieldConstraint ? JSON.parse(field.fieldConstraint).maxNumber : 9}
          />
        )}
      </FormItem>
    );
  };
  // -----扩展字段 编辑状态---end

  //渲染性别
  renderGenderOption = data => {
    if (data && data.length) {
      return data.map(item => {
        return (
          <Option value={item.value} key={item.value}>
            {item.messageKey}
          </Option>
        );
      });
    } else {
      return (
        <Option value={1} key={1}>
          {this.$t('pdc.basic.info.female')
          // "女"
          }
        </Option>
      );
    }
  };
  handleGenderChange = value => {
    //性别的值
  };
  //渲染编辑状态
  renderEditing = () => {
    const { getFieldDecorator } = this.props.form;
    const { loading, genderData, personObj } = this.state;
    let fields = personObj.customFormValues ? personObj.customFormValues : [];
    return (
      <div className="info-item-edit-wrap">
        <Form onSubmit={this.handleSave} onChange={this.handleChange}>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.employeeId')} //工号
                colon={true}
              >
                {getFieldDecorator('employeeID', {
                  initialValue: personObj.employeeID,
                  rules: [
                    {
                      max: 40,
                      message: this.$t('pdc.basic.info.max.inp.40'), //"最多输入40个字符"
                    },
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.name')} //姓名
                colon={true}
              >
                {getFieldDecorator('fullName', {
                  initialValue: personObj.fullName,
                  rules: [
                    {
                      max: 40,
                      message: this.$t('pdc.basic.info.max.inp.40'), //"最多输入40个字符"
                    },
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.company')} //公司
                colon={true}
              >
                {getFieldDecorator('companyOid', {
                  initialValue: personObj.companyOid
                    ? [
                        {
                          companyName: personObj.companyName,
                          companyOid: personObj.companyOid,
                        },
                      ]
                    : [],
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.select'),
                    },
                  ],
                })(
                  <Chooser
                    single={true}
                    type="all_company_with_legal_entity"
                    labelKey="companyName"
                    valueKey="companyOid"
                    onChange={this.handleChange}
                    listExtraParams={{}}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.dep')} //部门
                colon={true}
              >
                {getFieldDecorator('departmentName', {
                  initialValue: personObj.departmentOid
                    ? [
                        {
                          name: personObj.departmentName,
                          departmentOid: personObj.departmentOid,
                        },
                      ]
                    : [],
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.select'),
                    },
                  ],
                })(
                  <Chooser
                    single={true}
                    type="department"
                    labelKey="name"
                    valueKey="departmentOid"
                    onChange={this.handleChange}
                    listExtraParams={{}}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.email')} //邮箱
                colon={true}
              >
                {getFieldDecorator('email', {
                  initialValue: personObj.email,
                  rules: [
                    {
                      type: 'email',
                      message: this.$t('pdc.basic.info.email.error'), //"邮箱格式不对"
                    },
                    {
                      required: true,
                      message: this.$t('common.please.enter'),
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.mobile')} //手机
                colon={true}
              >
                {getFieldDecorator('mobile', {
                  initialValue: personObj.mobile,
                  rules: [
                    {
                      max: 30,
                      message: this.$t('pdc.basic.info.max.inp.30'), //"最多输入30个字符"
                    },
                    {
                      message: this.$t('org.role.type-number'), //"必须是数字
                      validator: (personObj, value, cb) => {
                        if (value === '' || value === undefined || value === null) {
                          cb();
                          return;
                        }
                        let reg = new RegExp('^[0-9]*$');
                        if (!reg.test(value)) {
                          cb(false);
                        } else {
                          cb();
                        }
                      },
                    },
                  ],
                })(
                  <Input
                    addonBefore={this.props.form.getFieldDecorator('mobilePrefix', {
                      initialValue: personObj.mobileCode,
                    })(this.renderMobilePrefix(this.state.preFixList))}
                    placeholder={this.$t('common.please.enter')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.direct.manager')} //直属领导
                colon={true}
              >
                {getFieldDecorator('directManager', {
                  initialValue: personObj.directManagerName
                    ? [
                        {
                          fullName: personObj.directManagerName,
                          userOid: personObj.directManager,
                        },
                      ]
                    : [],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    placeholder={this.$t('common.please.select')}
                    labelKey="fullName"
                    valueKey="userOid"
                    onChange={this.handleChange}
                    type="user"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.duty')} //职务
                colon={true}
              >
                {getFieldDecorator('duty', {
                  initialValue: personObj.duty
                    ? [
                        {
                          value: personObj.dutyCode,
                          messageKey: personObj.duty,
                        },
                      ]
                    : [],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    type="personDutyModel"
                    labelKey="messageKey"
                    valueKey="value"
                    onChange={this.handleChange}
                    placeholder={this.$t('common.please.select')}
                    listExtraParams={{ systemCustomEnumerationType: '1002' }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.title')} //职位
                colon={true}
              >
                {getFieldDecorator('title', {
                  initialValue: personObj.title,
                  rules: [
                    {
                      max: 40,
                      message: this.$t('pdc.basic.info.max.inp.40'), //"最多输入40个字符"
                    },
                  ],
                })(<Input placeholder={this.$t('common.please.enter')} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.person.type')} //人员类型
                colon={true}
              >
                {getFieldDecorator('employeeType', {
                  initialValue: personObj.employeeType
                    ? [
                        {
                          value: personObj.employeeTypeCode,
                          messageKey: personObj.employeeType,
                        },
                      ]
                    : [],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    type="personTypeModel"
                    labelKey="messageKey"
                    valueKey="value"
                    placeholder={this.$t('common.please.select')}
                    onChange={this.handleChange}
                    listExtraParams={{ systemCustomEnumerationType: '1001' }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.level')} //级别
                colon={true}
              >
                {getFieldDecorator('rank', {
                  initialValue: personObj.rank
                    ? [
                        {
                          value: personObj.rankCode,
                          messageKey: personObj.rank,
                        },
                      ]
                    : [],
                  rules: [],
                })(
                  <Chooser
                    single={true}
                    type="personRankModel"
                    labelKey="messageKey"
                    valueKey="value"
                    onChange={this.handleChange}
                    placeholder={this.$t('common.please.select')}
                    listExtraParams={{ systemCustomEnumerationType: '1008' }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.sex')} //性别
                colon={true}
              >
                {getFieldDecorator('gender', {
                  initialValue: personObj.genderCode,
                  rules: [],
                })(
                  <Select
                    className="select-country"
                    showSearch
                    placeholder={this.$t('common.please.select')}
                    optionFilterProp="children"
                    onChange={this.handleGenderChange}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {this.renderGenderOption(genderData)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.bird')} //生日
                colon={true}
              >
                {getFieldDecorator('birthday', {
                  initialValue: personObj.birthday ? moment(personObj.birthday) : '',
                  rules: [],
                })(<DatePicker format={'YYYY-MM-DD'} onChange={this.handleChange} />)}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                label={this.$t('pdc.basic.info.enter.time')} //入职时间
                colon={true}
              >
                {getFieldDecorator('entryTime', {
                  initialValue: personObj.entryTime ? moment(personObj.entryTime) : '',
                  rules: [],
                })(<DatePicker format={'YYYY-MM-DD'} onChange={this.handleChange} />)}
              </FormItem>
            </Col>
          </Row>

          {/*<div>{this.renderExtendTitle()}</div>*/}
          <div style={{ width: 500 }}>{this.renderEditingField(fields)}</div>
          <Button type="primary" loading={loading} htmlType="submit">
            {this.$t('common.save') /*保存*/}
          </Button>
          <Button onClick={this.handleCancel} style={{ marginLeft: 8 }}>
            {this.$t('common.cancel') /*取消*/}
          </Button>
        </Form>
      </div>
    );
  };

  renderExtendTitle = () => {
    return (
      <p>
        {/*个人信息扩展字段*/}
        {this.$t('pm.detail.person.info.field')}
        &nbsp;&nbsp;<Tooltip title={this.$t('pm.detail.tips')}>
          {/*可以在企业管理-扩展字段进行编辑扩展字段*/}
          <Icon type="question-circle-o" />
        </Tooltip>
      </p>
    );
  };

  //渲染入口
  renderEnter = () => {
    if (this.props.originEditingStatus) {
      return this.renderEditing();
    } else {
      return this.renderNoEditing();
    }
  };

  render() {
    return <div className="person-basic-info-wrap">{this.renderEnter()}</div>;
  }
}

PersonBasicInfo.propTypes = {
  savedData: PropTypes.func.isRequired, //点击保存
  toEditing: PropTypes.func.isRequired, //设置编辑
  toNoEditing: PropTypes.func.isRequired, //设置显示
  basicInfoData: PropTypes.object.isRequired, //基础信息数据对象
  originEditingStatus: PropTypes.bool, //初始化是否是编辑:默认非编辑
};
PersonBasicInfo.defaultProps = {
  originEditingStatus: false,
};

function mapStateToProps(state) {
  return {
    isOldCompany: state.user.isOldCompany,
  };
}
const WrappedPersonBasicInfo = Form.create()(PersonBasicInfo);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedPersonBasicInfo);
