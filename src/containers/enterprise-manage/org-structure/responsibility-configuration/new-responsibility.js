import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import { Form, Input, Button, message, Select, Switch, Icon, Radio } from 'antd';
import 'styles/setting/params-setting/params-setting.scss';
import service from './responsibility-service';
import ListSelector from 'components/Widget/list-selector';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option=Select.Option;

class Responsibility extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      paramsTypeList: [],
      usableList: [],
      scenarios: {},
      section: {},
      dimensionIdList: [],
      allResiponsibilityCenter: 'N',
      selectorItem: {key: 'id' },
      companyVisible: false,
      defaultVisible:false,
      usableVisible:false,
      companySelectOption: {},
      defaultSelectOption: {},
      usableSelectOption:{},
      responsibilityCenterId:"1081475244784463873",
      setOfBooksId:props.company.setOfBooksId,
    };
  }

  // 生命周期
  componentDidMount() {
  }

  //公司选择弹框
  handleSelectCompany = () => {
    const {responsibilityCenterId} = this.state;
    const selectItem = {
      title: '公司选择',
      url: `${config.baseUrl}/api/responsibilityCenter/company/assign/filter?responsibilityCenterId=${responsibilityCenterId}`,
      searchForm: [
        { type: 'input', id: 'companyName', label: '公司' },
        { type: 'input', id: 'companyCodeFrom', label: '公司代码从' },
        { type: 'input', id: 'companyCodeTo', label: '公司代码至' },
      ],
      columns: [
        { title: '公司代码', dataIndex: 'companyCode' },
        { title: '公司名称', dataIndex: 'name' },
      ],
    };
    this.setState({companyVisible:true});
    this.handleCommonSelect(selectItem);
  };

  //默认责任中心弹框
  handleSelectDefaultCenter = ()=>{
    const {setOfBooksId} = this.state;
    const selectItem = {
      title: '默认责任中心',
      url: `${config.baseUrl}/api/responsibilityCenter/query/default?setOfBooksId=${setOfBooksId}`,
      searchForm: [
        { type: 'input', id: 'info', label: '责任中心' },
        { type: 'input', id: 'codeFrom', label: '责任中心代码从' },
        { type: 'input', id: 'codeTo', label: '责任中心代码至' },
      ],
      columns: [
        { title: '责任中心代码', dataIndex: 'responsibilityCenterCode' },
        { title: '责任中心名称', dataIndex: 'responsibilityCenterName' },
      ],
    };
    this.setState({defaultVisible:true});
    this.handleCommonSelect(selectItem);
  }

  //可用责任中心弹框
  handleSelectCenter = ()=>{
    const {setOfBooksId} = this.state;
    const selectItem = {
      title: '可用责任中心',
      url: `${config.baseUrl}/api/responsibilityCenter/query?setOfBooksId=${setOfBooksId}`,
      searchForm: [
        { type: 'input', id: 'info', label: '责任中心' },
        { type: 'input', id: 'codeFrom', label: '责任中心代码从' },
        { type: 'input', id: 'codeTo', label: '责任中心代码至' },
      ],
      columns: [
        { title: '责任中心代码', dataIndex: 'responsibilityCenterCode' },
        { title: '责任中心名称', dataIndex: 'responsibilityCenterName' },
      ],
    };
    this.setState({usableVisible:true});
    this.handleCommonSelect(selectItem);
  }

  //公用的选择配置
  handleCommonSelect = selectItem =>{
    const { getFieldValue } = this.props.form;
    const {selectorItem}=this.state;
    if (getFieldValue('setOfBooksId')) {
      this.setState({
        selectorItem:{...selectorItem,...selectItem},
      });
    } else {
      alert('请选择账套');
    }
  }

  //保存&&编辑
  handleSubmit = e => {
    e.preventDefault();
    let { params } = this.props;
    this.props.form.validateFields((err, values, record) => {
      let data = Object.assign({}, params, values);
      console.log(data,'data');
      console.log(params,'params');
      if (err) return;
      this.setState({
        saveLoading: true,
      });
      if (!params.id) {
        service
          .addResponsibility(values)
          .then(res => {
            message.success('新增成功！');
            this.setState({ saveLoading: false });
            this.props.close && this.props.close(true);
          })
          .catch(err => {
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      } else {
        service
          .addResponsibility(data)
          .then(res => {
            message.success('编辑成功！');
            this.setState({ saveLoading: false });
            this.props.close && this.props.close(true);
          })
          .catch(err => {
            message.error(err.response.data.message);
            this.setState({ saveLoading: false });
          });
      }
    });
   };

  //取消
  handleCancel = () => {
    this.props.close && this.props.close();
  };

  // 切换默认责任中心全选或部分
  onDimensionChange = e => {
    this.setState({
      allResiponsibilityCenter: e.target.value,
      dimensionIdList: [],
    });
  };

  // 默认责任中心弹框
  // onDimensionClick = () => {
  //   this.refs.SelectDimension.blur();
  //   this.setState({
  //     dimensionVisible: true,
  //   });
  // };

  //选择公司模态框点击确定
  onCompanyOk = (values) =>{
    // console.log(result,'res');
    // const temp={};
    // result.result.map(item=>{
    //   temp.key=item.key;
    //   temp.label=item.name;
    //   temp.value=item.id;

    // }),
    this.setState({
      companySelectOption:values.result,
      companyVisible:false
    });
  }

  // 选择默认责任中心模态框点击确定
  onDefaultOk = (values) => {
    // console.log(result,'des');
    // const defaults={};
    // result.result.map(item=>{
    //   defaults.key=item.key;
    //   defaults.label=item.responsibilityCenterName;
    //   defaults.value=item.responsibilityCenterCode;

    // }),
    this.setState({
      defaultSelectOption:values.result,
      defaultVisible:false
    });
  }

  // 选择可用责任中心模态框点击确定
   onUsableOk = (result) => {
    this.setState({
      usableList:result.result,
      usableVisible:false
    });
  }

  // 可用责任中心选择数据

  // 模态框提交
  // handleSubmit = ()=>{
  //   e.preventDefault();

  // }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { params,allSetBooks,company } = this.props;
    const {
      saveLoading,
      usableList,
      allResiponsibilityCenter,
      selectorItem,
      companyVisible,
      defaultVisible,
      usableVisible,
      companySelectOption,
      defaultSelectOption,
      usableSelectOption,
    } = this.state;
    const formItemLayout = {
      labelCol: {span: 10,},
      wrapperCol: {span: 12,},
    };
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...formItemLayout} label={'账套' /** 账套*/}>
            {getFieldDecorator('setOfBooksId', {
              rules: [
                {
                  required: true,
                  message: '请选择',
                },
              ],
              // initialValue:JSON.stringify(params) === '{}' ?this.props.set: params.setOfBooksName,
              initialValue:company.setOfBooksId?company.setOfBooksId:'',
            })
            (<Select>
              {
                allSetBooks.map(item=><Option key={item.value} value={item.value}>{item.label}</Option>)
              }
            </Select>)}
          </FormItem>
          <FormItem {...formItemLayout} label="公司" hasFeedback>
            {getFieldDecorator('companyId', {
              rules: [
                {
                  required: false,
                  message: '请选择',
                },
              ],
              initialValue: companySelectOption ? companySelectOption.label : '',
            })
            (<Select placeholder="请选择" onDropdownVisibleChange={this.handleSelectCompany}>
                <Option key={companySelectOption.value} value={companySelectOption.value}>{companySelectOption.label}</Option>
            </Select>)}
          </FormItem>
          <FormItem {...formItemLayout} label="默认责任中心">
            {getFieldDecorator('defaultResiponsibilityCenterName', {
              rules: [
                {
                  required: false,
                  message: '请输入',
                },
              ],
              initialValue:defaultSelectOption ?defaultSelectOption.label: '',
            })
            (<Select placeholder="请选择" onDropdownVisibleChange={this.handleSelectDefaultCenter}>
              <Option key={defaultSelectOption.value} value={defaultSelectOption.value}>{defaultSelectOption.label}</Option>
            </Select>)}
          </FormItem>
          <FormItem {...formItemLayout} label="可用责任中心">
            <RadioGroup value={allResiponsibilityCenter} onChange={this.onDimensionChange}>
              <Radio value="Y">全部</Radio>
              <Radio value="N">部分</Radio>
            </RadioGroup>
            <Select
              ref="SelectDimension"
              // onFocus={this.onDimensionClick}
              disabled={allResiponsibilityCenter === 'Y' ? true : false}
              value={allResiponsibilityCenter === 'Y' ? '全部' : `已选择了${usableList.length}个`}
              onDropdownVisibleChange={this.handleSelectCenter}
            />
          </FormItem>
          <FormItem />
          <div className="slide-footer">
            <Button className="btn" type="primary" htmlType="submit" loading={saveLoading}>
              {this.$t('common.save')}
            </Button>
            <Button className="btn" onClick={this.handleCancel}>
              {this.$t('common.cancel')}
            </Button>
          </div>
        </Form>
        {/* 公司选择 */}
        <ListSelector
          visible={companyVisible}
          onCancel={() => {this.setState({ companyVisible: false });}}
          onOk={this.onCompanyOk}
          selectorItem={selectorItem}
          extraParams={{}}
          single={true}
          showSelectTotal={true}
        />
        {/* 默认责任中心 */}
         <ListSelector
          visible={defaultVisible}
          onCancel={() => {this.setState({ defaultVisible: false });}}
          onOk={this.onDefaultOk}
          selectorItem={selectorItem}
          extraParams={{}}
          single={true}
          showSelectTotal={false}
        />
        {/* 可用责任中心 */}
         <ListSelector
          visible={usableVisible}
          onCancel={() => {this.setState({ usableVisible: false });}}
          onOk={this.onUsableOk}
          selectorItem={selectorItem}
          extraParams={{}}
          selectedData={usableList}
          single={false}
          showSelectTotal={true}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
  };
}

const WrappedResponsibility = Form.create()(Responsibility);
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedResponsibility);
