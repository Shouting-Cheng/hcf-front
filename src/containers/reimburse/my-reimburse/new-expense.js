import React from 'react';
import { connect } from 'dva';
import baseService from 'share/base.service';
import moment from 'moment';

import {
  Alert,
  Form,
  Switch,
  Icon,
  Input,
  Select,
  Button,
  Row,
  Col,
  message,
  Card,
  Popover,
  InputNumber,
  DatePicker,
  Spin,
  Popconfirm,
  Affix,
  Badge,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
import 'styles/my-account/new-expense.scss';

import InvoiceInfo from 'containers/reimburse/my-reimburse/invoice-info';
import NewShare from 'containers/reimburse/my-reimburse/new-share';
import reimburseService from 'containers/reimburse/my-reimburse/reimburse.service';
import Upload from 'widget/upload-button';
import config from 'config';
import SelectApplication from 'containers/reimburse/my-reimburse/select-application';
import Chooser from 'widget/chooser';

class NewExpense extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      businessCardConsumptions: [],
      nowBusinessCardConsumptionIndex: 0,
      expenseType: {},
      loading: false,
      saving: false,
      nowPage: 'type', //type-费用类型选择、发票录入、商务卡消费选择页  form-费用表单页
      attachments: [],
      nowExpense: {},
      currencyList: [],
      nowCurrency: {},
      isShowInvoice: false,
      shareVisible: false,
      isCreateByApplication: false,
      currentRate: '',
      applicationData: [],
      typeSource: 'expenseType', //expenseType invoice businessCard,
      saveLoading: false,
      shareModel: {},
      visible: false,
      headerData: {},
      editModel: {},
      defaultApportion: {},
      isCopy: false,
      againLoading: false,
      copyLoading: false,
      applicationList: [],
      attachmentOID: [],
      isRefreshShareTabel: false,
      shareParams: {},
      invoiceData: {},
      fileList: [],
      isRefresh: false,
      isCalculation: true, //是否需要计算费用金额
      shareList: [],
      showSelectApplication: false,
      applincationParams: {},
      selectedData: [],
      expenseTypeItem: {
        title: this.$t({ id: 'itemMap.expenseType' }),
        url: `${
          config.baseUrl
          }/api/v2/custom/forms/fa94050f-3fba-475a-ae04-8a4291efd957/selected/expense/types`,
        searchForm: [
          { type: 'input', id: 'name', label: this.$t({ id: 'itemMap.expenseTypeName' }) },
        ],
        columns: [
          {
            title: this.$t({ id: 'itemMap.icon' }),
            dataIndex: 'iconURL',
            render: value => {
              return <img src={value} height="20" width="20" />;
            },
          },
          { title: this.$t({ id: 'itemMap.expenseTypeName' }), dataIndex: 'name' },
          {
            title: this.$t({ id: 'common.column.status' }),
            dataIndex: 'enable',
            render: isEnabled => (
              <Badge
                status={isEnabled ? 'success' : 'error'}
                text={
                  isEnabled
                    ? this.$t({ id: 'common.status.enable' })
                    : this.$t({ id: 'common.status.disable' })
                }
              />
            ),
          },
        ],
        listKey: 'expenseTypes',
        key: 'id',
      },
    };
  }

  onCancel = () => {
    this.props.close(false);
    this.resetForm();
  };

  getCurrencyFromList = currencyCode => {
    let result = false;
    this.state.currencyList.map(item => {
      if (item.currency === currencyCode) {
        result = item;
      }
    });
    return result;
  };

  componentWillMount() {
    baseService.getCurrencyList(this.props.company.baseCurrency).then(res => {
      this.setState({ currencyList: res.data });
    });
  }
  componentDidMount() {
    let params = this.props.params;
    if (!params.record.id) {
      let shareParams = {
        relatedApplication: params.headerData.relatedApplication,
        defaultApportion: params.defaultApportion,
      };
      // this.refs.invoice.resetForm();
      let expenseTypeItem = this.state.expenseTypeItem;
      expenseTypeItem.url = `${config.baseUrl}/api/v2/custom/forms/${
        params.headerData.formOid
        }/selected/expense/types`;

      this.setState(
        {
          isCopy: false,
          defaultApportion: params.defaultApportion,
          headerData: params.headerData,
          isShowInvoice: false,
          editModel: {},
          expenseType: {},
          nowPage: 'type',
          shareParams,
          expenseTypeItem,
        },
        () => {
          if (this.state.headerData.relatedApplication === false) {
            this.setDefaultApplication();
          }
        }
      );
    }
    //显示并且是编辑
    else if (params.record.id) {
      let shareParams = {
        applincationParams: {},
        relatedApplication: params.headerData.relatedApplication,
        defaultApportion: params.defaultApportion,
      };

      let expenseTypeItem = this.state.expenseTypeItem;
      expenseTypeItem.url = `${config.baseUrl}/api/v2/custom/forms/${
        params.headerData.formOid
        }/selected/expense/types`;

      this.setState(
        {
          nowPage: 'form',
          isCopy: params.isCopy,
          defaultApportion: params.defaultApportion,
          headerData: params.headerData,
          isShowInvoice: params.record.vatInvoice,
          loading: true,
          shareParams,
          expenseTypeItem,
        },
        () => {
          reimburseService.getCostDetail(params.record.id).then(res => {
            if (this.state.isShowInvoice) {
              this.setState({
                invoiceData: res.data,
                currentRate: res.data.taxRate,
                isCalculation: !(res.data.receiptTypeNo == '10' || res.data.receiptTypeNo == '04'),
              });
            }
            let attachments = res.data.attachments.map(o => {
              return {
                ...o,
                uid: o.attachmentOID,
                name: o.fileName,
              };
            });
            this.setState(
              {
                editModel: res.data,
                loading: false,
                fileList: attachments,
                attachmentOID: res.data.attachments.map(o => o.attachmentOID),
                expenseType: {
                  name: res.data.expenseTypeName,
                  iconURL: res.data.expenseTypeIconURL,
                  id: res.data.expenseTypeId,
                  expenseTypeOID: res.data.expenseTypeOID,
                },
              },
              () => {
                this.setShareTableData();
              }
            );
          });
        }
      );
    }
  }

  //重置表单
  resetForm = flag => {

    if (this.state.isShowInvoice) {
      this.refs.invoice.resetFields();
    }

    this.props.form.resetFields();

    var editModel = this.state.editModel.id
      ? {
        id: this.state.editModel.id,
        invoiceOID: this.state.editModel.invoiceOID,
        receiptGoodsID: this.state.editModel.receiptGoodsID,
        receiptID: this.state.editModel.receiptID,
      }
      : {};

    // this.props.form.setFieldsValue({costType: [], vatInvoice: false, amount: 0, actualAmount: 0, comment: ""});
    this.upload.reset();

    this.setState({
      applicationData: [],
      isShowInvoice: false,
      editModel: flag ? editModel : {},
      expenseType: {},
      nowPage: 'type',
      currentRate: '',
      isRefreshShareTabel: !this.state.isRefreshShareTabel,
      invoiceData: {},
      attachmentOID: [],
      fileList: [],
    });
  };

  //编辑时设置分摊行
  setShareTableData = () => {
    let applicationData = [];
    let defaultApportion = this.state.defaultApportion;

    this.state.editModel.expenseApportionDTOList &&
      this.state.editModel.expenseApportionDTOList.map((o, index) => {
        let obj = {
          company: {
            id: o.companyId,
            name: o.companyName,
          },
          department: {
            departmentId: o.departmentId,
            name: o.departmentName,
          },
        };

        defaultApportion.costCenterItems &&
          defaultApportion.costCenterItems.map((item, i) => {
            obj[item.costCenterOID] = {
              key: o.costCenterItems[i].costCenterItemId,
              label: o.costCenterItems[i].costCenterItemName,
            };
          });

        obj.defaultApportion = o.defaultApportion;

        obj.cost = o.amount;

        obj.rowKey = index + 1;

        obj.application = {
          id: o.sourceDocumentLineId,
          businessCode: o.sourceDocumentCode,
        };

        // data.applicationId = o.sourceDocumentLineId;
        // obj.applicationId = o.sourceDocumentLineId;

        // data.applicationCode = o.sourceDocumentCode;
        // obj.applicationCode = o.sourceDocumentCode;

        if (o.sourceDocumentLineId) {
          obj.isCreateByApplication = true;
        } else {
          obj.isCreateByApplication = false;
        }

        applicationData.push(obj);
      });
    this.setState({ applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel });
  };

  //获取默认分摊行
  setDefaultApplication = () => {
    let applicationData = [];
    let defaultApportion = this.state.defaultApportion;

    let obj = {
      company: {
        id: defaultApportion.companyId,
        name: defaultApportion.companyName,
      },
      department: {
        departmentId: defaultApportion.departmentId,
        name: defaultApportion.departmentName,
      },
    };
    defaultApportion.costCenterItems &&
      defaultApportion.costCenterItems.map(o => {
        obj[o.costCenterOID] = {
          key: o.costCenterItemId,
          label: o.costCenterItemName,
        };
      });
    obj.defaultApportion = true;
    obj.rowKey = 1;
    obj.isEdit = false;
    applicationData.push(obj);
    this.setState({ applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel });
  };

  //再记一笔
  againSave = e => {
    this.setState({ againLoading: true });

    this.save(() => {
      message.success('保存成功！');
      this.setState({ againLoading: false });
      this.props.params.refresh && this.props.params.refresh();
      this.resetForm();
      this.props.form.setFieldsValue({ costType: '' });
      if (this.state.headerData.relatedApplication === false) {
        this.setDefaultApplication();
      }
    });
  };

  //复制
  copy = e => {
    this.setState({ copyLoading: true });

    this.save(() => {
      message.success('保存成功！');
      this.props.params.refresh && this.props.params.refresh();
      this.setState({ copyLoading: false, isCopy: true });
    });
  };

  //提交
  handleSave = e => {
    e.preventDefault();

    this.setState({ saveLoading: true });

    this.save(() => {
      message.success('保存成功！');
      this.props.close(true);
      this.setState({ saveLoading: false });
    });
  };

  //保存
  save = callback => {
    let data = {};

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
      }
      values.receiptGoodsID = null;
      values.receiptID = null;
      values.createTime && (values.createTime = values.createTime.format('YYYY-MM-DD'));

      let isError = false;
      if (values.vatInvoice) {
        this.refs.invoice.validateFieldsAndScroll((error, model) => {
          if (error) {
            isError = true;
            this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
            return;
          }

          data = model;

          if (parseFloat(data.priceTaxAmount) < parseFloat(values.amount)) {
            message.error('报账金额不能大于价税合计！');
            this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
            isError = true;
            return;
          }
        });
      }

      if (isError) return;

      let totalAmount = 0;

      let applicationData = this.state.applicationData.map((o, index) => {
        if (!o.company || !o.company.id) {
          this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
          message.error('公司不能为空！');
          isError = true;
        }
        if (!o.department || !o.department.departmentId) {
          message.error('部门不能为空！');
          this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
          isError = true;
        }
        if (!o.cost || parseFloat(o.cost) <= 0) {
          this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
          message.error('分摊金额不能为空或小于等于0');
          isError = true;
        }

        let costCenterItems = [];

        if (this.state.defaultApportion && this.state.defaultApportion.costCenterItems) {
          costCenterItems = this.state.defaultApportion.costCenterItems.map(item => {
            if (!o[item.costCenterOID] || !o[item.costCenterOID].key) {
              message.error('成本中心不能为空！');
              this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
              isError = true;
            } else {
              return {
                costCenterItemId: o[item.costCenterOID].key,
                costCenterItemName: o[item.costCenterOID].label,
              };
            }
          });
        }

        if (isError) return;

        let cost = parseFloat(this.state.applicationData[index].cost);
        if (cost > 0) {
          totalAmount += parseFloat(cost);
        } else {
          message.error('分摊金额必须大于0！');
          this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
          isError = true;
        }
        return {
          invoiceId: 0,
          amount: this.state.applicationData[index].cost,
          companyId: o.company.id,
          companyName: o.company.name,
          departmentId: o.department.departmentId,
          departmentName: o.department.name,
          defaultApportion: o.defaultApportion,
          costCenterItems: costCenterItems,
          sourceDocumentLineId: o.application ? o.application.id : '',
        };
      });

      if (isError) return;

      if (parseFloat(totalAmount).toFixed(2) != parseFloat(values.actualAmount).toFixed(2)) {
        message.error('费用金额不等于分摊金额！');
        this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
        return;
      }

      data = {
        ...this.state.editModel,
        ...values,
        ...data,
        createTime: values.createdDate,
        expenseTypeId: this.state.expenseType.id,
        expenseTypeCategoryDTO: {},
        expenseTypeOID: this.state.expenseType.expenseTypeOID,
        expenseApportionDTOList: applicationData,
        expenseReportOID: this.state.headerData.expenseReportOID,
        attachments: this.state.attachmentOID.map(item => {
          return {
            attachmentOID: item,
          };
        }),
      };
      if (this.state.isCopy) {
        delete data.id;
        delete data.invoiceOID;
        delete data.receiptGoodsID;
        delete data.receiptID;
      }

      reimburseService
        .newReportLine(data)
        .then(res => {
          callback();
        })
        .catch(err => {
          message.error('保存失败：' + err.response.data.message);
          this.setState({ saveLoading: false, copyLoading: false, againLoading: false });
        });
    });
  };

  handleSelectExpenseType = value => {
    if (!value[0]) return;
    if (this.state.headerData.relatedApplication === true) {
      this.setState({ applicationData: [], isRefreshShareTabel: !this.state.isRefreshShareTabel });
    }

    this.setState({ expenseType: value[0] || {} });
  };

  //录入发票事件
  isInputInvoiceChange = value => {
    if (!value) {
      this.refs.invoice.resetFields();
    }
    this.props.form.setFieldsValue({ actualAmount: '', amount: '' });
    this.setState({ isShowInvoice: value, currentRate: '' }, () => {
      if (this.state.headerData.relatedApplication === false) {
        this.setDefaultApplication();
      }
    });
  };

  //新建分摊按钮事件
  // newShare = (value) => {
  //     this.setState({ shareVisible: true, isCreateByApplication: value, shareModel: {} });
  // }

  //编辑分摊
  editShare = index => {
    this.setState({
      shareVisible: true,
      isCreateByApplication: this.state.applicationData[index].isCreateByApplication,
      shareModel: this.state.applicationData[index],
    });
  };

  //设置默认分摊行金额
  setDefaultAmount = (value, flag) => {
    //关联申请单不需要计算默认分摊行金额
    if (this.state.headerData.relatedApplication === true) return;

    if (!flag) {
      value = this.props.form.getFieldValue('actualAmount');
    }

    let applicationData = this.state.applicationData;

    if (applicationData && applicationData.length) {
      let amount = 0;

      applicationData.map(o => {
        if (!o.defaultApportion) {
          amount += parseFloat(o.cost);
        }
      });

      let temp = applicationData[0];

      value = parseFloat(value);

      if (value || value === 0) {
        temp.cost = value - amount;
        temp.cost = this.toDecimal2(temp.cost);
      } else {
        temp.cost = '';
      }

      this.setState({ applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel });
    }
  };

  //从申请单新建分摊
  newShareByApplication = () => {
    let costType = this.props.form.getFieldValue('costType');
    if (!costType || !costType.length) {
      message.warning('请先选择费用类型！');
      return;
    }
    this.setState({
      showSelectApplication: true,
      applincationParams: this.props.headerData,
      selectedData: [],
    });
  };

  //添加分摊
  newShare = value => {
    let applicationData = this.state.applicationData;
    let values = { cost: 0 };
    let headerData = this.state.headerData;
    if (value) {
      values = {
        company: { id: value.companyId, name: value.companyName },
        department: { departmentId: value.departmentId, name: value.departmentName },
        cost: value.usableAmount,
        isCreateByApplication: true,
        application: { id: value.id, businessCode: value.businessCode },
      };

      if (this.state.headerData.defaultApportionInfo.costCenterItems) {
        this.state.headerData.defaultApportionInfo.costCenterItems.map(o => {
          values[o.costCenterOID] = { key: o.costCenterItemId, label: o.costCenterItemName };
        });
      }
    } else {
      values = {
        company: { id: headerData.companyId, name: headerData.companyName },
        department: { departmentId: headerData.unitId, name: headerData.unitName },
        cost: 0,
        isCreateByApplication: false,
        application: null,
      };

      if (this.state.headerData.defaultApportionInfo.costCenterItems) {
        this.state.headerData.defaultApportionInfo.costCenterItems.map(o => {
          values[o.costCenterOID] = { key: o.costCenterItemId, label: o.costCenterItemName };
        });
      }
    }

    values.rowKey = 1;

    if (applicationData.length) {
      values.rowKey = applicationData[applicationData.length - 1].rowKey + 1;
    }
    values.status = 'new';
    applicationData.push(values);

    this.setState({
      applicationData,
      shareVisible: false,
      isRefreshShareTabel: !this.state.isRefreshShareTabel,
    });
  };

  //删除分摊
  deleteShare = index => {
    let applicationData = this.state.applicationData;
    applicationData.splice(index, 1);
    this.setState({ applicationData, isRefreshShareTabel: !this.state.isRefreshShareTabel }, () => {
      this.setDefaultAmount();
    });
  };

  //报账金额改变
  amountChange = value => {
    this.setDefaultAmount(value, true);
  };

  //报账金额改变
  reimburseAmountChange = value => {
    let { currentRate, isCalculation } = this.state;
    if (!isCalculation) {
      let cost = this.toDecimal2(value);
      this.props.form.setFieldsValue({ actualAmount: cost });
      this.setDefaultAmount(cost, true);
      return;
    }
    let result = '';
    if (value && (currentRate || currentRate == 0)) {
      result = value / (1 + currentRate);
      result = this.toDecimal2(result);
    }
    this.props.form.setFieldsValue({ actualAmount: result });
    this.setDefaultAmount(result, true);
  };

  //报账金额失去焦点
  amountBlur = () => {
    let amount = this.props.form.getFieldValue('amount');
    let value = parseFloat(this.toDecimal2(amount));
    let { currentRate, isCalculation } = this.state;
    if (!isCalculation) {
      let cost = this.toDecimal2(value);
      this.props.form.setFieldsValue({ actualAmount: cost });
      this.setDefaultAmount(cost, true);
      return;
    }
    let result = '';
    if (value && (currentRate || currentRate == 0)) {
      result = value / (1 + currentRate);
      result = this.toDecimal2(result);
    }
    this.props.form.setFieldsValue({ actualAmount: result, amount: this.toDecimal2(value) });
    this.setDefaultAmount(result, true);
  };

  //发票价税合计改变
  invoiceAmountChange = (value, rate, isCalculation) => {
    this.setState({ isCalculation: isCalculation });

    if (!isCalculation || (!rate && rate !== 0)) {
      this.props.form.setFieldsValue({ amount: value });
      this.props.form.setFieldsValue({ actualAmount: value });
      this.setDefaultAmount(value, true);
      return;
    }
    this.props.form.setFieldsValue({ amount: value });

    let result = '';

    if (value && (rate || rate === 0)) {
      result = value / (1 + rate);
      result = this.toDecimal2(result);
    }

    this.props.form.setFieldsValue({ actualAmount: result });

    this.setDefaultAmount(result, true);
  };

  //税率改变
  invoiceRateChange = (rate, isCalculation) => {
    this.setState({ currentRate: rate, isCalculation: isCalculation });
    this.props.form.setFieldsValue({ amount: '', actualAmount: '' });
    this.setDefaultAmount('', true);
  };

  //四舍五入 保留两位小数
  toDecimal2 = x => {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return false;
    }
    var f = Math.round(x * 100) / 100;
    var s = f.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
      rs = s.length;
      s += '.';
    }
    while (s.length <= rs + 2) {
      s += '0';
    }
    return s;
  };

  //上传附件
  handleUpload = values => {
    this.setState({ attachmentOID: values });
  };

  //检查金额
  checkPrice = (rule, value, callback) => {
    if (value > 0) {
      callback();
      return;
    }
    callback('金额不能小于等于0！');
  };

  //切换页面
  changeView = () => {
    this.setState({ nowPage: 'type', typeSource: 'expenseType' }, () => {
      this.resetForm(true);
      this.setDefaultApplication();
    });
  };

  //获取分摊列表
  getShareData = (applicationData, flag) => {
    this.setState({ applicationData }, () => {
      flag && this.setDefaultAmount();
    });
  };

  //分摊金额改变
  costChange = applicationData => {
    this.setState({ applicationData }, () => {
      this.setDefaultAmount();
    });
  };

  //选择申请单的回调
  handleListOk = value => {
    this.newShare(value.result[0]);
    this.setState({ showSelectApplication: false });
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const {
      nowPage,
      expenseType,
      loading,
      saving,
      attachments,
      currencyList,
      nowCurrency,
      attachmentOID,
      businessCardConsumptions,
      nowBusinessCardConsumptionIndex,
      shareVisible,
      isCreateByApplication,
      saveLoading,
      editModel,
      fileList,
      invoiceData,
      applicationData,
      showSelectApplication,
      applincationParams,
      selectedData,
    } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 17 },
    };

    return (
      <div style={{ padding: 20 }}>
        {this.props.params.visible && (
          <Form onSubmit={this.handleSave}>
            <Spin spinning={loading}>
              <div style={{ paddingBottom: 50 }}>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="费用类型">
                      {getFieldDecorator('costType', {
                        initialValue: expenseType.id
                          ? [{ id: expenseType.id, name: expenseType.name }]
                          : [],
                        rules: [{ required: true, message: '请选择' }]
                      })(
                        <Chooser
                          onChange={value => this.handleSelectExpenseType(value)}
                          labelKey="name"
                          valueKey="id"
                          selectorItem={this.state.expenseTypeItem}
                          listExtraParams={{ setOfBooksId: '937515627984846850' }}
                          itemMap={true}
                          single={true}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={11} offset={1}>
                    <FormItem {...formItemLayout} label="发生日期">
                      {getFieldDecorator('createdDate', {
                        initialValue: editModel.id ? moment(editModel.createdDate) : moment(),
                        rules: [{ message: '请输入', required: true }],
                      })(<DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label="录入发票">
                      {getFieldDecorator('vatInvoice', {
                        valuePropName: 'checked',
                        initialValue: this.state.isShowInvoice,
                      })(<Switch onChange={this.isInputInvoiceChange} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    {this.state.isShowInvoice && (
                      <InvoiceInfo
                        onAmountChange={this.invoiceAmountChange}
                        onRateChange={this.invoiceRateChange}
                        headerData={this.state.headerData}
                        params={invoiceData}
                        ref="invoice"
                      />
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    {
                      <FormItem {...formItemLayout} label="报账金额">
                        {getFieldDecorator('amount', {
                          initialValue: editModel.id ? editModel.amount : '',
                          rules: [{ validator: this.checkPrice }],
                        })(
                          <InputNumber
                            step={0.01}
                            onBlur={this.amountBlur}
                            onChange={this.reimburseAmountChange}
                            style={{ width: '100%' }}
                            percision={2}
                          />
                        )}
                      </FormItem>
                    }
                  </Col>
                  <Col span={11} offset={1}>
                    {
                      <FormItem {...formItemLayout} label="费用金额">
                        {getFieldDecorator('actualAmount', {
                          initialValue: editModel.id ? editModel.actualAmount : '',
                        })(
                          <InputNumber
                            disabled
                            onChange={this.amountChange}
                            step={0.01}
                            style={{ width: '100%' }}
                            percision={2}
                          />
                        )}
                      </FormItem>
                    }
                  </Col>
                </Row>
                {this.props.params.visible && (
                  <FormItem label="附件" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                    {getFieldDecorator('attachmentOID')(
                      <Upload
                        wrappedComponentRef={upload => (this.upload = upload)}
                        attachmentType="BUDGET_JOURNAL"
                        uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
                        fileNum={9}
                        uploadHandle={this.handleUpload}
                        defaultFileList={fileList}
                        defaultOIDs={attachmentOID}
                      />
                    )}
                  </FormItem>
                )}
                <FormItem label="备注" labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
                  {getFieldDecorator('comment', {
                    initialValue: editModel.id ? editModel.comment : '',
                  })(<TextArea rows={4} style={{ width: '100%' }} />)}
                </FormItem>
                <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 20 }} label="分摊费用">
                  <div>
                    {this.state.headerData.relatedApplication && (
                      <Button
                        onClick={() => {
                          this.newShareByApplication();
                        }}
                        icon="plus"
                        style={{ marginRight: 10 }}
                      >
                        从申请单新建分摊
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        this.newShare();
                      }}
                      icon="plus"
                    >
                      新建分摊
                    </Button>
                  </div>
                </FormItem>
                {this.state.shareParams.defaultApportion && (
                  <NewShare
                    handleOk={this.getShareData}
                    isRefresh={this.state.isRefreshShareTabel}
                    edit={this.editShare}
                    deleteShare={this.deleteShare}
                    params={this.state.shareParams}
                    data={applicationData}
                  />
                )}
              </div>
              <Affix style={{
                textAlign: 'center',
                position: 'fixed',
                bottom: 0,
                marginLeft: '-35px',
                width: '100%',
                height: '50px',
                boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
                background: '#fff',
                lineHeight: '50px',
                zIndex: 5,
              }}>
                <Button type="primary" htmlType="submit" loading={saveLoading}>
                  保存
                </Button>
                <Button
                  onClick={this.againSave}
                  loading={this.state.againLoading}
                  style={{ margin: '0 10px' }}
                >
                  再记一笔
                </Button>
                <Button
                  onClick={this.copy}
                  loading={this.state.copyLoading}
                  style={{ margin: '0 10px', marginLeft: 0 }}
                >
                  复制
                </Button>
                <Button onClick={this.onCancel}>取消</Button>
              </Affix>
            </Spin>
          </Form>
        )}
        {/* <ShareForm
                    handleCancel={() => { this.setState({ shareVisible: false }) }}
                    handleOk={this.shareOk}
                    visible={shareVisible}
                    defaultApportion={this.state.defaultApportion}
                    typeList={this.state.defaultApportion.costCenterItems}
                    flag={isCreateByApplication}
                    model={this.state.shareModel}
                    applicationList={this.state.applicationList}
                    headerData={this.state.headerData}
                    type={this.state.expenseType.id}
                >
                </ShareForm> */}
        <SelectApplication
          visible={showSelectApplication}
          onCancel={() => {
            this.setState({ showSelectApplication: false, applincationParams: {} });
          }}
          onOk={this.handleListOk}
          single={true}
          params={{
            applincationParams: this.state.applincationParams,
            show: showSelectApplication,
            type: expenseType.id,
          }}
          selectedData={selectedData}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    companyConfiguration: state.user.companyConfiguration,
    profile: state.user.profile,
  };
}

const WrappedNewExpense = Form.create()(NewExpense);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedNewExpense);
