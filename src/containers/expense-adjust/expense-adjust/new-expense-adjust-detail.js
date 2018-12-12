import React from 'react';
import { connect } from 'dva';
import { injectIntl } from 'react-intl';
import {
  Button,
  Row,
  Badge,
  Form,
  Affix,
  InputNumber,
  Switch,
  Popconfirm,
  Input,
  message,
  Popover,
  Tooltip,
  Icon,
  Select,
  Table,
  Spin,
  Col,
} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import Importer from 'widget/Template/importer';
import Chooser from 'widget/chooser';
import config from 'config';
import 'styles/expense-adjust/new-expense-adjust-detail.scss';
import expenseAdjustService from 'containers/expense-adjust/expense-adjust/expense-adjust.service';
import Upload from 'widget/upload-button';
const TextArea = Input.TextArea;
import ImporterNew from 'widget/Template/importer-new';
class NewExpenseAdjustDetail extends React.Component {
  constructor(props) {
    super(props);
    const type = this.props.params.adjustLineCategory === '1001';
    this.state = {
      params: {},
      num: 0,
      addData: false,
      updateParams: {}, //编辑数据
      dimensionData: [], //维度数据
      lineHeaderData: {},
      attachmentOid: [],
      fileList: [],
      timestampLine: new Date().valueOf(),
      data: [],
      _data: [],
      scrollX: false,
      opt: {},
      defaultValue: [],
      deleteIds: [],
      headerData: {},
      record: {},
      lastData: {},
      isEdit: false,
      againLoading: false,
      loading: false,
      tableLoading: false,
      showImportFrame: false, //导入行标志
      visible: false,
      isNewLine: false,
      adjustLineCategory: this.props.params.adjustLineCategory,
      style: type ? { height: '39px' } : {},
      validator: {
        companyId: this.$t('acp.company'), //公司
        unitId: this.$t('acp.unitName'), //部门
        expenseTypeId: this.$t('exp.adjust.type'), //费用类型
        amount: this.$t('common.amount'), //金额
      },
      formItems: [
        {
          //公司
          type: 'chooser',
          label: this.$t('acp.company'),
          key: 'companyId',
          required: true,
          listType: 'company',
          single: true,
          labelKey: 'name',
          valueKey: 'id',
          span: type ? 12 : 30,
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
        },
        {
          //部门
          type: 'chooser',
          label: this.$t('acp.unitName'),
          key: 'unitId',
          required: true,
          listType: 'department',
          single: true,
          labelKey: 'name',
          valueKey: 'departmentId',
          span: type ? 12 : 30,
          listExtraParams: { setOfBooksId: this.props.company.setOfBooksId },
        },
        {
          //费用类型
          type: 'chooser',
          listType: 'adjust_expense_type',
          label: this.$t('common.expense.type'),
          key: 'expenseTypeId',
          required: true,
          labelKey: 'name',
          valueKey: 'id',
          span: type ? 12 : 30,
          single: true,
          className: 'expenseType',
          listExtraParams: { id: this.props.params.expenseAdjustTypeId },
        },
        {
          type: 'input',
          label: false,
          key: 'amount',
          disabled: this.props.params.adjustLineCategory === '1001',
          span: type ? 12 : 30,
          required: !type,
        },
        {
          type: 'upload',
          label: this.$t('common.attachments'),
          key: 'apportion',
          span: 24,
          className: type ? 'apportion-1' : 'apportion-2',
          formItemLayout: {
            labelCol: { span: type ? 3 : 6 },
            wrapperCol: { span: type ? 20 : 12 },
          },
        },
        {
          //备注
          type: 'textArea',
          label: this.$t('common.comment'),
          key: type ? 'description' : 'desc',
          span: 24,
          className: type ? 'new-adjust-description-1' : 'new-adjust-description-2',
          formItemLayout: {
            labelCol: { span: type ? 3 : 6 },
            wrapperCol: { span: type ? 20 : 12 },
          },
        },
      ],
      columns: [
        {
          //公司
          title: this.$t('acp.company'),
          key: 'companyId',
          valueKey: 'id',
          dataIndex: 'companyId',
          width: '150px',
          align: 'center',
          render: (desc, record, index) =>
            this.renderCol(desc, record, index, 'companyId', {
              type: 'company',
              labelKey: 'name',
              valueKey: 'id',
            }),
        },
        {
          //部门
          title: this.$t('acp.unitName'),
          key: 'unitId',
          dataIndex: 'unitId',
          valueKey: 'departmentId',
          align: 'center',
          width: '130px',
          render: (desc, record, index) =>
            this.renderCol(desc, record, index, 'unitId', {
              type: 'department',
              labelKey: 'name',
              valueKey: 'departmentId',
            }),
        },
        {
          //费用类型
          title: this.$t('common.expense.type'),
          key: 'expenseTypeId',
          dataIndex: 'expenseTypeId',
          align: 'center',
          width: '130px',
          render: (desc, record, index) =>
            this.renderCol(desc, record, index, 'expenseTypeId', {
              type: 'adjust_expense_type',
              labelKey: 'name',
              valueKey: 'id',
            }),
        },
        {
          //分摊金额
          title: this.$t('exp.detail.amount'),
          key: 'amount',
          width: '120px',
          dataIndex: 'amount',
          align: 'center',
          render: (desc, record, index) => this.renderCol(desc, record, index, 'amount'),
        },
        {
          //操作
          title: this.$t('common.operation'),
          key: 'operation',
          dataIndex: 'operation',
          width: '100px',
          align: 'center',
          render: (text, record, index) => (
            <span>
              <a
                onClick={
                  record.isEdit
                    ? e => this.saveItem(e, record, index)
                    : e => this.operateItem(e, record, index, true)
                }
              >
                {this.$t(record.isEdit ? 'common.save' : 'common.edit')}
              </a>
              {record.isEdit ? (
                <a
                  style={{ marginLeft: 12 }}
                  onClick={e => this.operateItem(e, record, index, false)}
                >
                  {this.$t('common.cancel')}
                </a>
              ) : (
                <Popconfirm
                  onConfirm={e => this.deleteItem(e, record, index)}
                  title={this.$t('budget.are.you.sure.to.delete.rule', {
                    controlRule: record.controlRuleName,
                  })}
                >
                  {/* 你确定要删除organizationName吗 */}
                  <a style={{ marginLeft: 12 }}>{this.$t('common.delete')}</a>
                </Popconfirm>
              )}
            </span>
          ),
        },
      ],
    };
  }

  operateItem = (e, record, index, flag) => {
    e.preventDefault();
    e.stopPropagation();
    const { data, lineData, isEdit, _data } = this.state;
    if (!flag) {
      //取消
      if (data[index].id || data[index].saved) {
        data[index] = { ..._data[index] };
        data[index].isEdit = false;
      } else {
        data.splice(index, 1);
      }
    } else {
      //编辑
      data[index].isEdit = flag;
      data[index].status = 'edit';
    }
    this.setState({
      isEdit: flag,
      data,
    });
  };

  deleteItem = (e, record, index) => {
    e.preventDefault();
    e.stopPropagation();
    const { data, lineData, deleteIds } = this.state;
    data.splice(index, 1);
    deleteIds.push(record.id);
    lineData && lineData.infoList && lineData.infoList.splice(index, 1);
    this.setState({ data });
  };

  saveItem = (e, record, index) => {
    e.preventDefault();
    e.stopPropagation();
    const { columns, lineData, data, opt } = this.state;
    let flag = true;
    for (let name in record) {
      if (
        name !== 'operation' &&
        name !== 'rowKey' &&
        name !== 'isEdit' &&
        name !== 'status' &&
        !record[name] &&
        this.state.validator[name]
      ) {
        message.error(`${this.state.validator[name]}${this.$t('exp.can.not.null')}`);
        flag = false;
      }
    }
    if (flag) {
      data[index].isEdit = false;
      data[index].saved = true;
      let _data = [];
      _data[index] = { ...data[index] };
      this.setState(
        {
          lineData,
          data,
          _data,
        },
        () => {}
      );
    }
  };

  handleChange = (key, value, record, index) => {
    const { amount, defaultValue, data } = this.state;
    if (key === 'companyId' || key === 'unitId' || key === 'expenseTypeId') {
      if (value.length > 0) {
        key === 'companyId' && (data[index][key] = value[0].id);
        key === 'unitId' && (data[index][key] = value[0].departmentId);
        key === 'expenseTypeId' && (data[index][key] = value[0].id);
        data[index][key + '_table'] = value;
      }
    } else if (key === 'amount') {
      data[index][key] = value.target.value;
      //联动设置表单里的金额
      let amount = 0;
      data.map(item => (amount -= parseFloat(item.amount)));
      this.props.form.setFieldsValue({ amount: amount });
    } else {
      data[index][key] = value;
    }

    this.setState(
      {
        defaultValue,
        data,
      },
      () => {}
    );
  };

  renderCol(desc, record, index, key, params) {
    const { getFieldDecorator } = this.props.form;
    const { isEdit, opt, data } = this.state;
    if (record.isEdit) {
      if (key === 'companyId' || key === 'unitId' || key === 'expenseTypeId') {
        let defaultValue =
          data.length > 0 && data[index] && data[index][key] ? data[index][key + '_table'] : [];
        return (
          <Chooser
            type={params.type}
            single={true}
            onChange={value => this.handleChange(key, value, record, index)}
            value={defaultValue}
            labelKey={params.labelKey}
            valueKey={params.valueKey}
            listExtraParams={
              key === 'expenseTypeId'
                ? { id: this.props.params.expenseAdjustTypeId }
                : { setOfBooksId: this.props.company.setOfBooksId }
            }
          />
        );
      } else if (key === 'amount') {
        let defaultValue =
          data.length > 0 && data[index] && data[index][key] ? data[index][key] : null;
        record.status === 'create' && (defaultValue = '');
        return (
            <InputNumber
              style={{width: 90}}
              step={0.01}
              defaultValue={defaultValue}
              onBlur={e => this.handleChange(key, e, record, index)}
            />
        );
      } else {
        let defaultValue =
          data.length > 0 && data[index] && data[index][key] ? data[index][key] : null;
        return (
          <Select
            selectedIndex={defaultValue}
            defaultValue={defaultValue}
            onChange={value => this.handleChange(key, value, record, index)}
          >
            {opt[key].map(item => <Option key={item.value}>{item.label}</Option>)}
          </Select>
        );
      }
    } else {
      if (key === 'companyId' || key === 'unitId' || key === 'expenseTypeId') {
        desc = record[key + '_table'] && record[key + '_table'][0].name;
      } else if (key === 'amount') {
        desc = this.formatMoney(desc);
      } else {
        desc &&
          opt[key].map(item => {
            if (item.value.toString() === desc.toString()) desc = item.label;
          });
      }
      return <Popover content={desc}>{desc ? desc : ''}</Popover>;
    }
  }

  componentDidMount() {
    const { formItems, columns, column, opt, defaultValue, validator } = this.state;
    if (
      this.props.params.flag &&
      this.props.params.costCenterData.length &&
      columns.length === 5 &&
      this.props.params.flag
    ) {
      this.props.params.costCenterData.reverse().map(item => {
        if (item) {
          let options = [];
          item.itemDTOList.map(item => options.push({ label: item.itemName, value: item.itemId }));
          formItems.splice(4, 0, {
            type: 'select',
            label: item.name,
            required: true,
            key: 'dimension' + item.sequenceNumber + 'Id',
            span: this.props.params.adjustLineCategory === '1001' ? 12 : 30,
            options: options,
          });
          columns.splice(3, 0, {
            title: item.name,
            dataIndex: 'dimension' + item.sequenceNumber + 'Id',
            key: 'dimension' + item.sequenceNumber + 'Id',
            align: 'center',
            render: (desc, record, index) =>
              this.renderCol(desc, record, index, 'dimension' + item.sequenceNumber + 'Id'),
          });
          opt['dimension' + item.sequenceNumber + 'Id'] = options;
          validator['dimension' + item.sequenceNumber + 'Id'] = item.name;
        }
      });
    }
    //公司和部门设置默认值
    if (!this.props.params.record) {
      //新建
      let defaultValue = [];
      defaultValue['companyId'] = [
        {
          id: this.props.params.expenseHeader.companyId,
          name: this.props.params.expenseHeader.companyName,
        },
      ];
      defaultValue['unitId'] = [
        {
          departmentId: this.props.params.expenseHeader.unitId,
          name: this.props.params.expenseHeader.unitName,
        },
      ];
      this.setState({ defaultValue });
    } else {
      //编辑 ,复制
      let value = {
        ...this.props.params.record,
        companyId: [
          { id: this.props.params.record.companyId, name: this.props.params.record.companyName },
        ],
        unitId: [
          {
            departmentId: this.props.params.record.unitId,
            name: this.props.params.record.unitName,
          },
        ],
        expenseTypeId: [
          {
            id: this.props.params.record.expenseTypeId,
            name: this.props.params.record.expenseTypeName,
          },
        ],
      };
      value.copy && delete value.id;
      let data = [];
      let fileList = [];
      this.props.params.record.attachments &&
        this.props.params.record.attachments.map(o =>
          fileList.push({
            ...o,
            uid: o.attachmentOID,
            name: o.fileName,
          })
        );
      this.props.params.record.linesDTOList.length &&
        this.props.params.record.linesDTOList.map(item => {
          item['companyId' + '_table'] = [{ id: item.companyId, name: item.companyName }];
          item['unitId' + '_table'] = [{ departmentId: item.unitId, name: item.unitName }];
          item['expenseTypeId_table'] = [{ id: item.expenseTypeId, name: item.expenseTypeName }];
          for (let name in item) {
            !item[name] && delete item[name];
          }
          data.push(item);
        });
      let _data = [];
      data.map(item => _data.push({ ...item }));
      this.state.formItems[this.state.formItems.length - 1].key === 'desc'
        ? (value['desc'] = this.props.params.record.description)
        : (value['description'] = this.props.params.record.description);
      this.setState({
        attachmentOid: this.props.params.record.attachmentOids,
        defaultValue: value,
        type: this.props.params.type,
        data,
        _data,
        fileList,
        record: this.props.params.record,
      });
    }
    if (this.props.params.costCenterData.length > 0) {
      columns[columns.length - 1].fixed = 'right';
    }

    this.setState({
      formItems,
      costCenterData: this.props.params.costCenterData,
      headerData: this.props.params.expenseHeader,
      columns,
      addData: false,
      deleteIds: [],
      opt,
      scrollX:
        this.props.params.costCenterData.length > 0
          ? 620 + this.props.params.costCenterData.length * 120
          : false,
    });
    // this.getDimension(this.props.params.expenseAdjustTypeId);
  }

  // getDimension = expenseAdjustTypeId => {
  //   const { columns } = this.state;
  //   expenseAdjustService.getDimensionAndValue(expenseAdjustTypeId).then(response => {
  //     response.data.reverse().map(
  //       item =>
  //         item &&
  //         columns.splice(4, 0, {
  //           title: item.name,
  //           dataIndex: 'dimension' + item.sequenceNumber + 'Name',
  //           align: 'center',
  //           render: desc => (
  //             <span>
  //               <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
  //             </span>
  //           ),
  //         })
  //     );
  //     this.setState({ columns, costCenterData: response.data });
  //   });
  // };

  /*componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    const { formItems, columns, column, opt, defaultValue, validator } = this.state;
    if (!this.props.params.flag && nextProps.params.flag) {
      if (
        !this.props.params.flag &&
        nextProps.params.costCenterData.length &&
        columns.length === 5 &&
        nextProps.params.flag
      ) {
        nextProps.params.costCenterData.reverse().map(item => {
          if (item) {
            let options = [];
            item.itemDTOList.map(item =>
              options.push({ label: item.itemName, value: item.itemId })
            );
            formItems.splice(4, 0, {
              type: 'select',
              label: item.name,
              required: true,
              key: 'dimension' + item.sequenceNumber + 'Id',
              span: nextProps.params.adjustLineCategory === '1001' ? 12 : 30,
              options: options,
            });
            columns.splice(3, 0, {
              title: item.name,
              dataIndex: 'dimension' + item.sequenceNumber + 'Id',
              key: 'dimension' + item.sequenceNumber + 'Id',
              align: 'center',
              render: (desc, record, index) =>
                this.renderCol(desc, record, index, 'dimension' + item.sequenceNumber + 'Id'),
            });
            opt['dimension' + item.sequenceNumber + 'Id'] = options;
            validator['dimension' + item.sequenceNumber + 'Id'] = item.name;
          }
        });
      }
      //公司和部门设置默认值
      if (!nextProps.params.record) {
        //新建
        let defaultValue = [];
        defaultValue['companyId'] = [
          { id: nextProps.expenseHeader.companyId, name: nextProps.expenseHeader.companyName },
        ];
        defaultValue['unitId'] = [
          { departmentId: nextProps.expenseHeader.unitId, name: nextProps.expenseHeader.unitName },
        ];
        this.setState({ defaultValue });
      } else {
        //编辑 ,复制
        let value = {
          ...nextProps.params.record,
          companyId: [
            { id: nextProps.params.record.companyId, name: nextProps.params.record.companyName },
          ],
          unitId: [
            {
              departmentId: nextProps.params.record.unitId,
              name: nextProps.params.record.unitName,
            },
          ],
          expenseTypeId: [
            {
              id: nextProps.params.record.expenseTypeId,
              name: nextProps.params.record.expenseTypeName,
            },
          ],
        };
        value.copy && delete value.id;
        let data = [];
        let fileList = [];
        nextProps.params.record.attachments &&
          nextProps.params.record.attachments.map(o =>
            fileList.push({
              ...o,
              uid: o.attachmentOID,
              name: o.fileName,
            })
          );
        nextProps.params.record.linesDTOList.length &&
          nextProps.params.record.linesDTOList.map(item => {
            item['companyId' + '_table'] = [{ id: item.companyId, name: item.companyName }];
            item['unitId' + '_table'] = [{ departmentId: item.unitId, name: item.unitName }];
            item['expenseTypeId_table'] = [{ id: item.expenseTypeId, name: item.expenseTypeName }];
            for (let name in item) {
              !item[name] && delete item[name];
            }
            data.push(item);
          });
        this.state.formItems[this.state.formItems.length - 1].key === 'desc'
          ? (value['desc'] = nextProps.params.record.description)
          : (value['description'] = nextProps.params.record.description);
        this.setState({
          attachmentOid: nextProps.params.record.attachmentOids,
          defaultValue: value,
          type: nextProps.params.type,
          data,
          fileList,
          record: nextProps.params.record,
        });
      }
      if (nextProps.params.costCenterData.length > 0) {
        columns[columns.length - 1].fixed = 'right';
      }
      this.setState({
        formItems,
        costCenterData: nextProps.params.costCenterData,
        headerData: nextProps.params.expenseHeader,
        columns,
        addData: false,
        opt,
        scrollX:
          nextProps.params.costCenterData.length > 0
            ? 620 + nextProps.params.costCenterData.length * 120
            : false,
      });
    }
    if (!nextProps.params.flag && this.props.params.flag) {
      this.upload && this.upload.reset();
      this.props.form.resetFields();
      this.setState({ fileList: [], data: [] });
    }
  }
*/
  //上传附件
  handleUpload = values => {
    this.setState({ attachmentOid: values });
  };

  renderItem(item, index) {
    switch (item.type) {
      case 'chooser': {
        return (
          <Chooser
            type={item.listType}
            single={item.single}
            valueKey={item.valueKey}
            labelKey={item.labelKey}
            placeholder={this.$t('common.please.select')}
            listExtraParams={item.listExtraParams}
          />
        );
      }
      case 'select': {
        return (
          <Select
            placeholder={this.$t('common.please.select')}
            onFocus={
              item.options.length === 0 && item.method ? this.handleFocus(item, index) : () => {}
            }
          >
            {item.options.map(item => <Option key={item.value}>{item.label}</Option>)}
          </Select>
        );
      }
      case 'input': {
        return (
          <InputNumber
            step={0.01}
            precision={2}
            placeholder={this.$t('common.please.enter')}
            style={{ width: '100%' }}
            disabled={item.disabled}
          />
        );
      }
      case 'upload': {
        return (
          <Upload
            attachmentType="EXP_ADJUST"
            uploadUrl={`${config.baseUrl}/api/upload/static/attachment`}
            fileNum={9}
            uploadHandle={this.handleUpload}
            wrappedComponentRef={upload => (this.upload = upload)}
            defaultFileList={this.state.fileList}
            defaultOIDs={this.state.attachmentOid}
          />
        );
      }
      case 'textArea': {
        return <TextArea placeholder={this.$t('common.please.enter')} />;
      }
    }
  }

  validate = data => {
    let flag = true;
    if (this.props.params.adjustLineCategory === '1001' && data.length === 0) {
      message.error(this.$t('exp.validate.detail.tips'));
      this.setState({ loading: false });
      this.handleAdd();
      flag = false;
    } else {
      data.map(item => {
        for (let name in item) {
          if (
            name !== 'operation' &&
            name !== 'rowKey' &&
            name !== 'isEdit' &&
            name !== 'status' &&
            !item[name] &&
            this.state.validator[name]
          ) {
            message.error(`${this.state.validator[name]}${this.$t('exp.can.not.null')}`);
            this.setState({ loading: false });
            flag = false;
            break;
          }
        }
      });
    }
    return flag;
  };

  //新建或者修改
  handleSave = (e, key) => {
    e && e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { data, lastData, fileList } = this.state;
        let temp = data;
        if (this.validate(data)) {
          values.amount = values.amount;
          values.companyId =
            typeof values.companyId === 'string' ? values.companyId : values.companyId[0].id;
          values.unitId = values.unitId[0].departmentId;
          values.expenseTypeId =
            typeof values.expenseTypeId === 'string'
              ? lastData.form.expenseTypeId
              : values.expenseTypeId[0].id;
          let lineData = [];
          if (this.props.params.adjustLineCategory === '1001') {
            let option = {
              tenantId: this.props.user.tenantId,
              setOfBooksId: this.props.company.setOfBooksId,
              expAdjustHeaderId: this.props.params.expenseAdjustHeadId,
              adjustLineCategory: '1002',
              currencyCode: this.props.params.expenseHeader.currencyCode,
              description: '',
              exchangeRate: 1.0,
              employeeId: this.props.user.id,
              functionalAmount: 0.0,
            };
            temp.map(item => {
              item = { ...item, ...option };
              delete item.unitId_table;
              delete item.status;
              delete item.rowKey;
              delete item.isEdit;
              delete item.companyId_table;
              delete item.expenseTypeId_table;
              lineData.push(item);
            });
            if (
              (key === 'copy' || this.props.params.type === 'copy') &&
              !this.state.defaultValue.id
            ) {
              lineData.map(item => delete item.id);
            }
          }
          let param = {
            ...values,
            employeeId: this.props.user.id,
            attachmentOid: this.state.attachmentOid && this.state.attachmentOid.toString(),
            expAdjustHeaderId: this.props.params.expenseAdjustHeadId,
            setOfBooksId: this.props.company.setOfBooksId,
            adjustLineCategory: '1001',
            adjustDate: this.props.params.expenseHeader.adjustDate,
            tenantId: this.props.company.tenantId,
            functionalAmount: 0.0,
            exchangeRate: this.props.params.expenseHeader.exchangeRate,
            currencyCode: this.props.params.expenseHeader.currencyCode,
            description: values.description ? values.description : values.desc,
            auditFlag: null,
            auditDate: null,
            sourceAdjustLineId: null,
            jeCreationStatus: null,
            jeCreationDate: null,
            linesList: lineData,
            deleteIds: this.state.deleteIds,
          };
          let method = null;
          let flag = true;
          if (typeof this.state.defaultValue.id !== 'undefined') {
            param.id = this.state.defaultValue.id;
            flag = false;
          }
          expenseAdjustService
            .addExpenseAdjustLine(param)
            .then(response => {
              message.success(this.$t(flag ? 'structure.saveSuccess' : 'common.update.success'));
              this.props.params.query();
              this.setState(
                {
                  defaultValue: {},
                  data: key === 'copy' ? data : [],
                  addData: true,
                  fileList: key === 'copy' ? fileList : [],
                  loading: false,
                  deleteIds: [],
                },
                () => {
                  if (key !== 'copy') {
                    this.props.form.resetFields();
                    this.props.onClose();
                    this.props.params.query();
                  }
                }
              );
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(this.$t(flag ? 'common.save.filed' : 'common.update.filed'));
            });
        }
      } else {
        let style = this.props.params.adjustLineCategory === '1001' ? { height: '60px' } : {};
        this.setState({ loading: false, style });
      }
    });
  };

  onCancel = () => {
    this.setState(
      {
        defaultValue: [],
        data: [],
        fileList: [],
        amount: 0,
      },
      () => {
        this.upload.reset();
        this.props.form.resetFields();
        this.props.onClose(this.state.addData || false);
      }
    );
  };

  getFormItems() {
    const { getFieldDecorator } = this.props.form;

    let formItemLayout =
      this.props.params.adjustLineCategory === '1001'
        ? {
            labelCol: { span: 6 },
            wrapperCol: { span: 17 },
          }
        : {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 },
          };
    let arr = [];
    let style = {};
    this.state.formItems.map((item, index) => {
      item.key === 'expenseTypeId' ? (style = this.state.style) : (style = {});
      formItemLayout = item.formItemLayout || formItemLayout;
      arr.push(
        <Col key={item.key} span={item.span || 12} className={item.className} style={style}>
          {item.key === 'apportion' ? (
            this.props.params.visible && (
              <FormItem
                {...formItemLayout}
                key={item.key + 'item'}
                label={
                  item.label ? (
                    item.label
                  ) : this.props.params.adjustLineCategory === '1002' ? (
                    this.$t('common.amount')
                  ) : (
                    <span>
                      {this.$t('common.amount')}&nbsp;
                      <Tooltip title={this.$t('exp.detail.amount.tips')}>
                        <Icon type="info-circle-o" />
                      </Tooltip>
                    </span>
                  )
                }
              >
                {getFieldDecorator(item.key, {
                  initialValue: this.state.defaultValue[item.key],
                  rules: [
                    {
                      required: item.required,
                      message: this.$t('common.can.not.be.empty', {
                        name: item.label ? item.label : this.$t('common.amount'),
                      }), //name 不可为空
                    },
                  ],
                })(this.renderItem(item, index))}
              </FormItem>
            )
          ) : (
            <FormItem
              {...formItemLayout}
              key={item.key + 'item'}
              label={
                item.label ? (
                  item.label
                ) : this.props.params.adjustLineCategory === '1002' ? (
                  this.$t('common.amount')
                ) : (
                  <span>
                    {this.$t('common.amount')}&nbsp;
                    <Tooltip title={this.$t('exp.detail.amount.tips')}>
                      <Icon type="info-circle-o" />
                    </Tooltip>
                  </span>
                )
              }
            >
              {getFieldDecorator(item.key, {
                initialValue: this.state.defaultValue[item.key],
                rules: [
                  {
                    required: item.required,
                    message: this.$t('common.can.not.be.empty', {
                      name: item.label ? item.label : this.$t('common.amount'),
                    }), //name 不可为空
                  },
                ],
              })(this.renderItem(item, index))}
            </FormItem>
          )}
        </Col>
      );
    });
    return arr;
  }

  handleAgain = () => {
    this.setState({ loading: true });
    let flag = true;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { data } = this.state;
        //values.amount = values.amount;
        if (this.validate(data)) {
          values.companyName = values.companyId[0].name;
          values.companyId = values.companyId[0].id;
          values.unitName = values.unitId[0].name;
          values.unitId = values.unitId[0].departmentId;
          values.expenseTypeName = values.expenseTypeId[0].name;
          values.expenseTypeId =
            typeof values.expenseTypeId === 'string'
              ? lastData.form.expenseTypeId
              : values.expenseTypeId[0].id;
          values.apportion = this.state.attachmentOID;
          let lineData = [];
          if (this.props.params.adjustLineCategory === '1001') {
            let option = {
              tenantId: this.props.user.tenantId,
              employeeId: this.props.user.id,
              setOfBooksId: this.props.company.setOfBooksId,
              expAdjustHeaderId: this.props.params.expenseAdjustHeadId,
              adjustLineCategory: '1002',
              currencyCode: this.props.params.expenseHeader.currencyCode,
              description: '',
            };
            data.map(item => {
              this.props.params.type === 'copy' && delete item.id;
              item = { ...item, ...option };
              lineData.push(item);
            });
          }
          let param = {
            ...values,
            employeeId: this.props.user.id,
            attachmentOid: this.state.attachmentOid.toString(),
            expAdjustHeaderId: this.props.params.expenseAdjustHeadId,
            setOfBooksId: this.props.company.setOfBooksId,
            adjustLineCategory: '1001',
            adjustDate: this.props.params.expenseHeader.adjustDate,
            tenantId: this.props.company.tenantId,
            functionalAmount: 0.0,
            exchangeRate: this.props.params.expenseHeader.exchangeRate,
            currencyCode: this.props.params.expenseHeader.currencyCode,
            description: values.description ? values.description : values.desc,
            auditFlag: null,
            auditDate: null,
            sourceAdjustLineId: null,
            jeCreationStatus: null,
            jeCreationDate: null,
            linesList: lineData,
          };

          if (typeof this.state.defaultValue.id !== 'undefined') {
            param.id = this.state.defaultValue.id;
            flag = false;
          }

          expenseAdjustService
            .addExpenseAdjustLine(param)
            .then(response => {
              message.success(this.$t(flag ? 'structure.saveSuccess' : 'common.update.success'));
              this.props.params.query();
              this.props.form.resetFields();
              this.setState(
                {
                  defaultValue: [],
                  data: [],
                  lastData: { form: values, data: data },
                  fileList: [],
                  addData: true,
                  loading: false,
                  attachmentOid: [],
                },
                () => {
                  this.props.form.resetFields();
                  this.upload.reset();
                  let params = {
                    companyId: [
                      {
                        id: this.props.params.expenseHeader.companyId,
                        name: this.props.params.expenseHeader.companyName,
                      },
                    ],
                    unitId: [
                      {
                        departmentId: this.props.params.expenseHeader.unitId,
                        name: this.props.params.expenseHeader.unitName,
                      },
                    ],
                  };
                  this.props.form.setFieldsValue(params);
                }
              );
            })
            .catch(e => {
              this.setState({ loading: false });
              message.error(this.$t(flag ? 'common.save.filed' : 'common.update.filed'));
            });
        }
      } else {
        let style = this.props.params.adjustLineCategory === '1001' ? { height: '60px' } : {};
        this.setState({ loading: false, style });
      }
    });
  };

  handleCopy = () => {
    const { lastData, type } = this.state;
    this.handleSave(undefined, 'copy');
  };

  handleAdd = () => {
    const { data, num, columns } = this.state;
    let params = {};
    columns.map(item => {
      item.key !== 'operation' && (params[item.key] = undefined);
    });
    data.splice(0, 0, { rowKey: num, isEdit: true, status: 'create', ...params });
    this.setState({
      data,
      num: num + 1,
    });
  };

  onLoadOk = transactionId => {
    this.showImport(false);
    this.getImportDetailData(transactionId);
  };

  showImport = flag => {
    this.setState({ showImportFrame: flag });
  };

  handleImport = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ showImportFrame: true });
      }
    });
  };

  //导入成功获取数据
  getImportDetailData = transactionId => {
    expenseAdjustService.getImportDetailData(transactionId).then(response => {
      let amount = this.props.form.getFieldValue('amount');
      if (undefined === amount || null === amount){
        amount = 0;
      }
      if (response.status === 200) {
        let { data, _data } = this.state;
        response.data.map(item => {
          item.saved = true;
          amount -= item.amount;
          item['companyId' + '_table'] = [{ id: item.companyId, name: item.companyName }];
          item['unitId' + '_table'] = [{ departmentId: item.unitId, name: item.unitName }];
          item['expenseTypeId_table'] = [{ id: item.expenseTypeId, name: item.expenseTypeName }];
          data.push({ ...item });
          _data.push({ ...item });
        });
        this.setState(
          {
            _data,
            data,
          },
          () => {
            this.props.form.setFieldsValue({ amount: amount });
          }
        );
        message.success(this.$t('common.operate.success' /*操作成功*/));
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      updateParams,
      loading,
      scrollX,
      isEdit,
      columns,
      timestampLine,
      showImportFrame,
      tableLoading,
      isNewLine,
      pagination,
      data,
      visible,
      dimensionData,
      headerData,
      defaultData,
      adjustTypeCategory,
    } = this.state;

    const items = this.getFormItems();
    return (
      <div className="new-expense-adjust-detail">
        <Form
          onSubmit={this.handleSave}
          style={this.props.params.adjustLineCategory === '1002' ? { marginLeft: 48 } : {}}
        >
          <div className="common-item-title">
            {this.props.params.adjustLineCategory === '1001'
              ? this.$t('exp.old.expense.detail')
              : this.$t('exp.add.info')}
          </div>

          {items.map(
            (item, index) =>
              index % 2 == 0 && (
                <Row gutter={24}>
                  {item}
                  {items[index + 1]}
                </Row>
              )
          )}

          {this.props.params.adjustLineCategory === '1001' ? (
            <div>
              <div className="new-adjust-table-header">
                <span className="adjust-detail-title">{this.$t('exp.detail.info')}</span>
                <Button onClick={this.handleAdd} className="adjust-detail">
                  +&nbsp; {this.$t('exp.detail.info')}
                </Button>
                <Button onClick={this.handleImport}>{this.$t('exp.import.detail.info')}</Button>
              </div>
              <Table
                rowKey={(record, index) => record.id || record['rowKey'] || index}
                dataSource={data}
                columns={columns}
                loading={tableLoading}
                bordered
                scroll={{ x: scrollX }}
              />
            </div>
          ) : null}

          <Affix
            style={{ textAlign: 'center', width: '98%', left: 35 }}
            offsetBottom={0}
            className="bottom-bar-jsq"
          >
            <Button type="primary" htmlType="submit" style={{ marginLeft: 15 }} loading={loading}>
              {this.$t('common.save')}
            </Button>
            <Button onClick={this.handleAgain} style={{ marginLeft: 15 }} loading={loading}>
              {this.$t('exp.add.again')}
            </Button>
            <Button onClick={this.handleCopy} loading={loading} style={{ marginLeft: 15 }}>
              {this.$t('common.copy')}
            </Button>
            <Button onClick={this.onCancel} style={{ marginLeft: 15 }}>
              {this.$t('common.cancel')}
            </Button>
          </Affix>
        </Form>

        {/* <Importer
          visible={showImportFrame}
          ref={ref => (this.import = ref)}
          templateUrl={`${
            config.baseUrl
            }/api/expense/adjust/lines/export/template?expenseAdjustHeaderId=${
            this.props.params.expenseAdjustHeadId
            }&external=${false}`}
          uploadUrl={`${config.baseUrl}/api/expense/adjust/lines/import?expenseAdjustHeaderId=${
            this.props.params.expenseAdjustHeadId
            }&sourceAdjustLineId=1`}
          listenUrl={`${config.baseUrl}/api/expense/adjust/lines/import/log`}
          errorUrl={`${config.baseUrl}/api/expense/adjust/lines/failed/export`}
          title={this.$t('exp.import.detail.line')}
          fileName={this.$t('exp.import.detail.line')}
          onOk={this.onLoadOk}
          afterClose={() => this.showImport(false)}
        /> */}
        {/*导入*/}
        <ImporterNew
          visible={showImportFrame}
          title={this.$t('exp.import.detail.line')}
          templateUrl={`${
            config.expenseUrl
          }/api/expense/adjust/lines/export/template?expenseAdjustHeaderId=${
            this.props.params.expenseAdjustHeadId
          }&external=${false}`}
          uploadUrl={`${config.expenseUrl}/api/expense/adjust/lines/import?expenseAdjustHeaderId=${
            this.props.params.expenseAdjustHeadId
          }&sourceAdjustLineId=1`}
          errorUrl={`${config.expenseUrl}/api/expense/adjust/lines/import/error/export/${this.props.params.expenseAdjustHeadId}/true`}
          errorDataQueryUrl={`${config.expenseUrl}/api/expense/adjust/lines/import/log`}
          deleteDataUrl={`${config.expenseUrl}/api/expense/adjust/lines/import/delete`}
          fileName={this.$t('exp.import.detail.line')}
          onOk={this.onLoadOk}
          afterClose={() => this.showImport(false)}
        />
      </div>
    );
  }
}

const WrappedNewExpenseAdjustDetail = Form.create()(NewExpenseAdjustDetail);
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
)(WrappedNewExpenseAdjustDetail);
