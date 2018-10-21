import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Card,
  Input,
  Row,
  Col,
  Affix,
  Button,
  DatePicker,
  Select,
  message,
  Spin,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import { routerRedux } from 'dva/router';
import config from 'config';
import httpFetch from 'share/httpFetch';
import contractService from 'containers/contract/contract-approve/contract.service';
import Upload from 'components/Widget/upload';
import 'styles/contract/my-contract/new-contract.scss';
import Chooser from 'components/Widget/chooser';

class NewContract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageLoading: false,
      record: {},
      contractType: {},
      fileList: [],
      user: {},
      isNew: true, //新建 or 编辑
      contractInfo: {}, //编辑的合同信息
      partnerCategoryOptions: [], //合同方类型选项
      currencyOptions: [], //币种
      companySelectorItem: {
        //公司  ${config.contractUrl}/api/contract/type/${setOfBooksId}/companies/query`
        title: this.$t({ id: 'my.contract.contractCompany' } /*合同公司*/),
        url: `${config.contractUrl}/api/contract/type/${
          this.props.company.setOfBooksId
        }/companies/query?enabled=true`,
        searchForm: [
          {
            type: 'input',
            id: 'companyCode',
            label: this.$t({ id: 'chooser.data.companyCode' } /*公司代码*/),
          },
          {
            type: 'input',
            id: 'companyName',
            label: this.$t({ id: 'chooser.data.companyName' } /*公司名称*/),
          },
        ],
        columns: [
          {
            title: this.$t({ id: 'chooser.data.companyCode' } /*公司代码*/),
            dataIndex: 'companyCode',
          },
          {
            title: this.$t({ id: 'chooser.data.companyName' } /*公司名称*/),
            dataIndex: 'companyName',
          },
          {
            title: this.$t({ id: 'chooser.data.companyType' } /*公司类型*/),
            dataIndex: 'companyTypeName',
            render: value => value || '-',
          },
        ],
        key: 'id',
      },
      contractCategoryOptions: [], //合同大类选项
      uploadOIDs: [], //上传附件的OIDs
      employeeOptions: [], //员工选项
      venderOptions: [], //供应商选项
      contractCategoryValue: 'EMPLOYEE',
      unitIdOptions: [], //责任部门选项
      employeeIdOptions: [], //责任人选项
      currencyLoading: false,
      extraParams: null,
      contractCategory: undefined,
      departmentId: '',
      //myContract: menuRoute.getRouteItem('my-contract', 'key'),    //我的合同
      //contractDetail: menuRoute.getRouteItem('contract-detail', 'key'),    //合同详情
    };
  }

  //根据合同类型id获取合同类型
  getContractType = () => {
    contractService
      .getContractTypeInfo(this.props.company.setOfBooksId, this.props.match.params.contractTypeId)
      .then(response => {
        this.setState({ contractType: response.data });
      });
  };

  /*  //获取合同类型分配过的公司
  getCompanies = () =>{
    let params = {
      page: 0,
      size: 9999,
      contractTypeId: this.props.match.params.contractTypeId
    };
    contractService.getCompanyDistributionByContractType(this.props.company.setOfBooksId,params).then(response=>{
      this.setState({companyIdOptions: response.data})
    })
  };*/

  componentWillMount() {
    this.getContractType();
    Number(this.props.match.params.id) && this.getInfo(); //合同编辑
    this.setState({ user: this.props.user });
    this.getSystemValueList(2107).then(res => {
      //合同方类型
      let partnerCategoryOptions = res.data.values || [];
      this.setState({ partnerCategoryOptions });
    });
    this.getSystemValueList(2202).then(res => {
      //合同大类
      let contractCategoryOptions = res.data.values || [];
      this.setState({ contractCategoryOptions });
    });
    //this.getCompanies();
    // httpFetch.post(`${config.vendorUrl}/api/ven/info`, {}).then(res => {  //获取供应商列表
    //   res.status === 200 && this.setState({ venderOptions: res.data.body.body.venInfoBeans })
    // });
    //获取责任部门列表 flag = 1001全部, 1002启用, 1003未启用
    httpFetch.get(`${config.baseUrl}/api/departments/root/v2?flag=1001`).then(res => {
      res.status === 200 && this.setState({ unitIdOptions: res.data });
    });
    this.getCurrencyOptions();
  }
  // componentDidMount = () => {
  //   Number(this.props.match.params.id) && this.getInfo(); //合同编辑
  // }
  //获取合同信息
  getInfo = () => {
    this.setState({ pageLoading: true });
    contractService.getContractHeaderInfo(this.props.match.params.id).then(res => {
      let fileList = [];
      if (res.data.attachments) {
        res.data.attachments.map(item => {
          fileList.push({
            ...item,
            uid: item.attachmentOID,
            name: item.fileName,
            status: 'done',
          });
        });
      }

      this.setState({
        record: res.data,
        isNew: false,
        uploadOIDs: res.data.attachmentOIDs,
        fileList,
        pageLoading: false,
        contractCategoryValue: res.data.partnerCategory,
        contractCategory: res.data.contractCategory,
        extraParams: res.data.companyId,
        departmentId: res.data.unitId,
      });
      // res.data.unitId && this.changeUnitId(res.data.unitId, true);
    });
  };

  //获取币种
  getCurrencyOptions = () => {
    this.setState({ currencyLoading: true });
    !this.state.currencyOptions.length &&
      this.service.getCurrencyList().then(res => {
        let currencyOptions = res.data;
        this.setState({ currencyOptions, currencyLoading: false });
      });
  };

  //上传附件
  handleUpload = OIDs => {
    let uploadOIDs = OIDs.join(',');
    this.setState({ uploadOIDs: uploadOIDs });
  };

  //保存
  handleSave = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.attachmentOIDs = this.state.uploadOIDs.toString();
        values.contractTypeId = this.props.match.params.contractTypeId;
        values.contractCategory = this.state.contractType.contractCategory;
        values.unitId = this.state.departmentId;
        values.applicantOid = this.props.user.userOID;
        values.companyId = values.companyId && values.companyId[0].companyId;
        values.currency = values.currency && values.currency.key;
        this.setState({ loading: true });
        contractService.newContractHeader(values).then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success(this.$t({ id: 'common.save.success' }, { name: '' } /*保存成功*/));
              //this.context.router.push(this.state.contractDetail.url.replace(':id', res.data.id));
              this.props.dispatch(
                routerRedux.replace({
                  pathname: `/contract-manage/my-contract/contract-detail/${res.data.id}`,
                })
              );
            }
          })
          .catch(e => {
            message.error(
              `${this.$t({ id: 'common.save.filed' } /*保存失败*/)}，${e.response.data.message}`
            );
            this.setState({ loading: false });
          });
      }
    });
  };

  //更新
  handleUpdate = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = {
          id: this.state.record.id,
          versionNumber: this.state.record.versionNumber,
          companyId: values.companyId[0].companyId,
          attachmentOIDs: this.state.uploadOIDs.toString(),
          remark: values.remark,
          contractTypeId: this.props.match.params.contractTypeId,
        };
        //console.log(this.state.uploadOIDs.toString())
        //values.attachmentOIDs = this.state.uploadOIDs.toString();
        //values.signDate && (values.signDate = values.signDate.format('YYYY-MM-DD'));
        //values.startDate && (values.startDate = values.startDate.format('YYYY-MM-DD'));
        //values.endDate && (values.endDate = values.endDate.format('YYYY-MM-DD'));
        //values.contractTypeId = this.props.match.params.contractTypeId;
        values.id = this.state.record.id;
        values.companyId = values.companyId && values.companyId[0].companyId;
        values.currency = values.currency && values.currency.key;
        values.versionNumber = this.state.record.versionNumber;
        //values.unitId = this.state.departmentId;
        //values.employeeId = (values.employeeId && values.employeeId.length) ? values.employeeId[0].userId : "";
        this.setState({ loading: true });
        contractService.updateContractHeader(params).then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
              message.success(this.$t({ id: 'common.update.success' }, { name: '' } /*保存成功*/));
              //this.context.router.push(this.state.contractDetail.url.replace(':id', res.data.id));
              this.props.dispatch(
                routerRedux.replace({
                  pathname: `/contract-manage/my-contract/contract-detail/${res.data.id}`,
                })
              );
            }
          })
          .catch(e => {
            if (!e.response) return;
            message.error(
              `${this.$t({ id: 'common.save.filed' } /*保存失败*/)}，${e.response.data.message}`
            );
            this.setState({ loading: false });
          });
      }
    });
  };

  //取消
  onCancel = () => {
    //this.props.match.params.id ? this.context.router.push(this.state.contractDetail.url.replace(':id', this.props.match.params.id)) :
    //this.context.router.push(this.state.myContract.url)
    this.props.dispatch(
      routerRedux.replace({
        pathname: `/contract-manage/my-contract`,
      })
    );
  };

  //选择公司
  handleCompanyId = value => {
    if (value) {
      this.props.form.setFieldsValue({ contractTypeId: undefined, partnerId: [] });
      this.setState({
        extraParams: value,
        contractCategory: undefined,
      });
    }
  };

  //选择合同类型
  handleChangeContractType = record => {
    this.setState({
      contractCategory: record[0].contractCategory
        ? record[0].contractCategory
        : this.state.contractCategory,
    });
    this.props.form.setFieldsValue({
      contractCategory: record[0].contractCategory
        ? record[0].contractCategory
        : this.state.contractCategory,
    });
  };

  //选择合同方类型
  changePartnerCategory = value => {
    this.props.form.setFieldsValue({ partnerId: undefined });
    this.setState({ contractCategoryValue: value });
  };

  //选择责任部门
  changeUnitId = (value, isInit) => {
    // console.log(this.state.unitIdOptions);
    !isInit && this.props.form.setFieldsValue({ employeeId: [] });
    // httpFetch.get(`${config.baseUrl}/api/departments/users/${value[0].departmentOid}`).then(res => {

    // });

    this.setState({ departmentId: value[0].departmentId });
    // this.state.unitIdOptions.map(option => {
    //   if (option.id === value[0].departmentId) {
    //     httpFetch.get(`${config.baseUrl}/api/departments/users/${option.departmentOID}`).then(res => {
    //       this.setState({ employeeIdOptions: res.data })
    //     })
    //   }
    // })
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { company } = this.props;
    const {
      loading,
      record,
      companySelectorItem,
      pageLoading,
      user,
      contractType,
      fileList,
      isNew,
      contractInfo,
      partnerCategoryOptions,
      currencyOptions,
      companyIdOptions,
      contractCategoryOptions,
      venderOptions,
      contractCategoryValue,
      unitIdOptions,
      employeeIdOptions,
      extraParams,
      currencyLoading,
      contractCategory,
    } = this.state;

    const rowLayout = { type: 'flex', gutter: 24, justify: 'center' };
    const formItemLayout = {
      labelCol: {
        xs: { span: 14 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <div className="new-contract " style={{ marginBottom: '50px' }}>
        <Spin spinning={pageLoading}>
          <Form onSubmit={record.id ? this.handleUpdate : this.handleSave}>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t({ id: 'contract.createdBy' })} {...formItemLayout}>
                  {getFieldDecorator('employeeId', {
                    rules: [
                      {
                        required: true,
                        message: this.$t({ id: 'common.please.select' }),
                      },
                    ],
                    initialValue: this.props.user.fullName,
                  })(<Select disabled placeholder={this.$t({ id: 'common.please.select' })} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t({ id: 'my.contract.type' })} {...formItemLayout}>
                  {' '}
                  {/*合同类型*/}
                  {getFieldDecorator('contractTypeId', {
                    rules: [
                      {
                        required: true,
                        message: this.$t({ id: 'common.please.select' }),
                      },
                    ],
                    initialValue: contractType.contractTypeName,
                  })(
                    <Select
                      style={{ width: '100%' }}
                      disabled
                      placeholder={this.$t({ id: 'common.please.select' })}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t({ id: 'my.contract.category' })} {...formItemLayout}>
                  {' '}
                  {/*合同大类*/}
                  {getFieldDecorator('contractCategory', {
                    rules: [
                      {
                        required: true,
                        message: this.$t({ id: 'common.please.select' }),
                      },
                    ],
                    initialValue: contractType.contractCategoryName,
                  })(
                    <Input
                      style={{ width: '100%' }}
                      disabled
                      placeholder={this.$t({ id: 'common.please.enter' })}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem
                  label={this.$t({ id: 'my.contract.contractCompany' })}
                  {...formItemLayout}
                >
                  {/*合同公司*/}
                  {getFieldDecorator('companyId', {
                    rules: [
                      {
                        required: true,
                        message: this.$t({ id: 'common.please.select' }),
                      },
                    ],
                    initialValue: record.id
                      ? [{ companyId: record.companyId, companyName: record.companyName }]
                      : [],
                  })(
                    <Chooser
                      selectorItem={companySelectorItem}
                      labelKey="companyName"
                      placeholder={this.$t({ id: 'common.please.select' })}
                      valueKey="companyId"
                      single={true}
                      listExtraParams={{ contractTypeId: this.props.match.params.contractTypeId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t({ id: 'common.currency' })} {...formItemLayout}>
                  {getFieldDecorator('currency', {
                    rules: [
                      {
                        required: true,
                        message: this.$t({ id: 'common.please.select' }),
                      },
                    ],
                    initialValue:  { key:  record.id ? record.currency : 'CNY', label: "CNY-人民币"},
                    })(
                    <Select labelInValue
                      disabled={record.id}
                      placeholder={this.$t({ id: 'common.please.select' } /*请选择*/)}
                      onDropdownVisibleChange={this.getCurrencyOptions}
                      notFoundContent={
                        currencyLoading ? (
                          <Spin size="small" />
                        ) : (
                          this.$t({ id: 'my.contract.no.result' } /*无匹配结果*/)
                        )
                      }
                    >
                      {currencyOptions.map(option => {
                        return <Option key={option.currency}>{option.currency}-{option.currencyName}</Option>;
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t({ id: 'request.detail.jd.remark' })} {...formItemLayout}>
                  {getFieldDecorator('remark', {
                    rules: [
                      {
                        required: true,
                        message: this.$t({ id: 'common.please.enter' }),
                      },
                    ],
                    initialValue: record.id ? record.remark : '',
                  })(<Input.TextArea placeholder={this.$t({ id: 'common.please.enter' })} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...rowLayout}>
              <Col span={10}>
                <FormItem label={this.$t({ id: 'acp.fileInfo' })} {...formItemLayout}>
                  {getFieldDecorator('attachmentOIDs')(
                    <Upload
                      attachmentType="CONTRACT"
                      uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                      fileNum={9}
                      uploadHandle={this.handleUpload}
                      defaultFileList={fileList}
                      defaultOIDs={this.state.uploadOIDs}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Affix
              offsetBottom={0}
              style={{
                position: 'fixed',
                bottom: 0,
                marginLeft: '-35px',
                width: '100%',
                height: '50px',
                boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
                background: '#fff',
                lineHeight: '50px',
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ margin: '0 20px' }}
              >
                {this.$t({ id: 'my.contract.next' })}
              </Button>
              <Button onClick={this.onCancel}>{this.$t({ id: 'common.cancel' })}</Button>
            </Affix>
          </Form>
        </Spin>
      </div>
    );
  }
}

const wrappedNewContract = Form.create()(NewContract);

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewContract);
