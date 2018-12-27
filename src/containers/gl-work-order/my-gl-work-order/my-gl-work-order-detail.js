import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import Pagination, {
  Popconfirm,
  Button,
  Affix,
  message,
  Row,
  Col,
  Icon,
  Input,
  Tabs,
  Divider,
  InputNumber,
  Popover,
  Spin,
  Card,
} from 'antd';
import Table from 'widget/table'
const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute'
import myGlWorkOrderService from 'containers/gl-work-order/my-gl-work-order/my-gl-work-order.service';
import moment from 'moment';
import DocumentBasicInfo from 'widget/document-basic-info';
import 'styles/gl-work-order/my-gl-work-order/my-gl-work-order-detail.scss';
import ApproveHistory from 'containers/pre-payment/my-pre-payment/approve-history-work-flow';
import Chooser from 'widget/chooser';
import Importer from 'widget/Template/importer';
import ImporterNew from 'widget/Template/importer-new';
import { routerRedux } from 'dva/router';

class MyGLWorkOrderDetail extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      //传给单据头组件的数据
      headerInfo: {},
      //单据头信息
      docHeadData: {},
      //维度信息
      dimensionData: [],
      //记录当前编辑的行有哪些
      editLines: [],
      /**
       * 审批历史
       */
      historyLoading: true,
      approveHistory: [],
      /**
       * 单据操作
       */
      operationLoading: false,
      /**
       * 保存标志
       */
      saveFlag: false,
      //表格宽度
      tableWidth: 1050,
      /**
       * 导入
       */
      showImportFrame: false,
      templateUrl: '',
      uploadUrl: '',
      errorUrl: '',
      listenUrl: '',
      /**
       * 单据行
       * lineStatus有三种状态：
       * 普通：normal
       * 编辑：edit
       * 新建：insert
       */
      columns: [
        {
          title: '序号',
          dataIndex: 'seq',
          align: 'center',
          width: 60,
          render: (seq, record, index) => {
            return <span>{index + 1}</span>;
          },
        },
        {
          title: (
            <span>
              <span style={{ color: 'red' }}>*</span>&nbsp;备注
            </span>
          ),
          dataIndex: 'description',
          align: 'center',
          width: 140,
          render: (description, record, index) => {
            if (record.lineStatus === 'normal') {
              return (
                <Popover content={description}>
                  <span>{description}</span>
                </Popover>
              );
            } else if (record.lineStatus === 'edit' || record.lineStatus === 'insert') {
              return (
                <Popover content={description}>
                  <Input
                    value={description}
                    onChange={e => this.onDescChange(e, record, index)}
                    size={140}
                    placeholder={'请输入'}
                  />
                </Popover>
              );
            }
          },
        },
        {
          title: (
            <span>
              <span style={{ color: 'red' }}>*</span>&nbsp;公司
            </span>
          ),
          dataIndex: 'companyName',
          align: 'center',
          width: 140,
          render: (companyName, record, index) => {
            if (record.lineStatus === 'normal') {
              return <span>{companyName}</span>;
            } else {
              return (
                <Chooser
                  onChange={value => this.onCompanyChange(value, record, index)}
                  value={
                    record.companyId ? [{ id: record.companyId, name: record.companyName }] : []
                  }
                  type="gl_line_company"
                  labelKey="name"
                  valueKey="id"
                  single={true}
                  listExtraParams={{ workOrderTypeId: record.workOrderTypeId }}
                  showClear={false}
                />
              );
            }
          },
        },
        {
          title: '部门',
          dataIndex: 'unitName',
          align: 'center',
          width: 140,
          render: (unitName, record, index) => {
            if (record.lineStatus === 'normal') {
              return <span>{unitName}</span>;
            } else {
              return (
                <Chooser
                  onChange={value => this.onUnitChange(value, record, index)}
                  value={
                    record.unitOid
                      ? [
                        {
                          departmentOid: record.unitOid,
                          departmentId: record.unitId,
                          name: record.unitName,
                        },
                      ]
                      : []
                  }
                  type="department"
                  labelKey="name"
                  valueKey="departmentOid"
                  single={true}
                  listExtraParams={{ tenantId: this.props.user.tenantId }}
                  showClear={false}
                />
              );
            }
          },
        },
        {
          title: (
            <span>
              <span style={{ color: 'red' }}>*</span>&nbsp;科目
            </span>
          ),
          dataIndex: 'accountName',
          align: 'center',
          width: 140,
          render: (accountName, record, index) => {
            if (record.lineStatus === 'normal') {
              return <span>{accountName}</span>;
            } else {
              return (
                <Chooser
                  onChange={value => this.onAccountChange(value, record, index)}
                  value={
                    record.accountId
                      ? [
                        {
                          id: record.accountId,
                          name: record.accountName,
                          accountName: record.accountName,
                          accountCode: record.accountCode,
                        },
                      ]
                      : []
                  }
                  type="gl_line_account"
                  labelKey="name"
                  valueKey="id"
                  single={true}
                  listExtraParams={{ id: record.workOrderTypeId }}
                  showClear={false}
                />
              );
            }
          },
        },
        {
          title: (
            <span>
              <span style={{ color: 'red' }}>*</span>&nbsp;借方金额
            </span>
          ),
          dataIndex: 'enteredAmountCr',
          align: 'center',
          width: 140,
          fixed: 'right',
          render: (enteredAmountDr, record, index) => {
            if (record.lineStatus === 'normal') {
              return <span>{this.filterMoney(enteredAmountDr, 2)}</span>;
            } else {
              return (
                <InputNumber
                  onChange={value => this.onECAmountChange(value, record, index)}
                  onBlur={value => this.blurCr(value, index)}
                  value={enteredAmountDr}
                  size={140}
                  placeholder={'请输入'}
                />
              );
            }
          },
        },
        {
          title: (
            <span>
              <span style={{ color: 'red' }}>*</span>&nbsp;贷方金额
            </span>
          ),
          dataIndex: 'enteredAmountDr',
          align: 'center',
          width: 140,
          fixed: 'right',
          render: (enteredAmountCr, record, index) => {
            if (record.lineStatus === 'normal') {
              return <span>{this.filterMoney(enteredAmountCr, 2)}</span>;
            } else {
              return (
                <InputNumber
                  onChange={value => this.onDCAmountChange(value, record, index)}
                  value={enteredAmountCr}
                  onBlur={value => this.blurDr(value, index)}
                  //disabled={record.enteredAmountDr ? true : false}
                  size={140}
                  placeholder={'请输入'}
                />
              );
            }
          },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          width: 150,
          fixed: 'right',
          render: (operation, record, index) => {
            if (record.lineStatus === 'normal') {
              return (
                <div>
                  <a onClick={e => this.onEditClick(e, record, index)}>编辑</a>
                  <Divider type="vertical" />
                  <a onClick={e => this.onCopyClick(e, record, index)}>复制</a>
                  <Divider type="vertical" />
                  {/* <a onClick={e => this.onDelLineClick(e, record, index)}>删除</a> */}
                  <Popconfirm
                    title="确认删除？"
                    okText="确认"
                    cancelText="取消"
                    onConfirm={e => this.onDelLineClick(e, record, index)}
                  >
                    <a>删除</a>
                  </Popconfirm>
                </div>
              );
            } else {
              return (
                <div>
                  <a onClick={e => this.onLineCancelClick(e, record, index)}>取消</a>
                </div>
              );
            }
          },
        },
      ],
      loading: true,
      pagination: {
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      data: [],
      page: 0,
      pageSize: 10,
    };
  }

  /**
   * 行删除
   */
  onDelLineClick = (e, record, index) => {
    e.preventDefault();
    myGlWorkOrderService
      .delLineData(record.id)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            loading: true,
            page: parseInt((this.state.pagination.total-2)/this.state.pageSize)
          },()=>this.getDocInfoById());
          message.success('删除成功');

        }
      })
      .catch(e => {
        console.log(`删除失败：${e}`);
        if (e.response) {
          message.error(`删除失败：${e.response.data.message}`);
        }
      });
  };
  /**
   * 行复制
   */
  onCopyClick = (e, record, index) => {
    e.preventDefault();
    this.addDocLine({ ...record });
  };
  /**
   * 行编辑
   */
  onEditClick = (e, record, index) => {
    //把当前编辑的行推入editlines记录原数据
    //再把该条数据的状态变成编辑状态的
    e.preventDefault();
    let { data, editLines } = this.state;
    editLines.push({ ...record });
    data[index].lineStatus = 'edit';
    this.setState({ data, editLines });
  };
  /**
   * 行取消
   */
  onLineCancelClick = (e, record, index) => {
    e.preventDefault();
    let { data, editLines, pagination, pageSize } = this.state;
    //当前行的状态如果是新增的话 ，就直接把该行从data中删除
    if (record.lineStatus === 'insert') {
      data.splice(index, 1);
      this.setState({ data });
      if (data.length >= 10) {
        pagination.pageSize = data.length;
      }
      pagination.total -= 1;
      this.setState({ pagination });
    } else if (record.lineStatus === 'edit') {
      //把正在编辑的行复原成改变之前的
      //再把该条数据从editlines中删除
      let tempRecord = editLines.find(o => o.id === record.id);
      data[index] = tempRecord;
      this.setState({ data });
      editLines.map((item, index, array) => {
        if (item.id === record.id) {
          editLines.splice(index, 1);
          this.setState({ editLines });
        }
      });
    }
  };
  /**
   * 备注变化事件
   */
  onDescChange = (e, record, index) => {
    let { data } = this.state;
    data[index].description = e.target.value;
    this.setState({ data });
  };
  /**
   * 公司变化事件
   */
  onCompanyChange = (value, record, index) => {
    let { data } = this.state;
    data[index].companyId = value[0].id;
    data[index].companyName = value[0].name;
    this.setState({ data });
  };
  /**
   * 部门变化事件
   */
  onUnitChange = (value, record, index) => {
    let { data } = this.state;
    data[index].unitId = value[0].departmentId;
    data[index].unitName = value[0].name;
    data[index].unitOid = value[0].departmentOid;
    this.setState({ data });
  };
  /**
   * 科目变化事件
   */
  onAccountChange = (value, record, index) => {
    let { data } = this.state;
    data[index].accountId = value[0].id;
    data[index].accountName = value[0].accountName;
    data[index].accountCode = value[0].accountCode;
    this.setState({ data });
  };
  /**
   * 借方金额变化事件
   */
  onECAmountChange = (value, record, index) => {
    let { data } = this.state;
    data[index].enteredAmountCr = value;
    data[index].enteredAmountDr = 0;
    this.setState({ data });
  };
  /**
   * 贷方金额变化事件
   */
  onDCAmountChange = (value, record, index) => {
    let { data } = this.state;
    data[index].enteredAmountDr = value;
    data[index].enteredAmountCr = 0;
    this.setState({ data });
  };

  //四舍五入 保留两位小数
  blurCr = (value, index) => {
    let x = value.target.defaultValue;
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
    let { data } = this.state;
    data[index].enteredAmountDr = 0;
    data[index].enteredAmountCr = s;
    this.setState({ data });
  };

  //四舍五入 保留两位小数
  blurDr = (value, index) => {
    let x = value.target.defaultValue;
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
    let { data } = this.state;
    data[index].enteredAmountCr = 0;
    data[index].enteredAmountDr = s;
    this.setState({ data });
  };


  /**
   * 维值变化事件
   */
  onDimensionChange = (value, record, index, dimensionKey, dimensionName) => {
    let { data } = this.state;
    data[index][dimensionKey] = value[0].id;
    data[index][dimensionName] = value[0].name;
    this.setState({ data });
  };
  /**
   * 生命周期函数
   */
  componentWillMount = () => {
    this.getDocInfoById();
    this.getImportUrl();
    this.getHistory();
  };
  /**
   * 获取审批历史
   */
  getHistory = () => {
    let documentOid = this.props.match.params.oid;
    myGlWorkOrderService
      .getHistory(documentOid)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            historyLoading: false,
            approveHistory: res.data,
          });
        }
      })
      .catch(e => {
        console.log(`加载审批历史数据失败：${e}`);
        if (e.response) {
          message.error(`加载审批历史数据失败：${e.response.data.message}`);
        }
        this.setState({ historyLoading: false });
      });
  };
  /**
   * 根据头id获取单据数据-初始化的时候
   */
  getDocInfoById = () => {
    let headId = this.props.match.params.id;
    let page = this.state.page;
    let size = this.state.pageSize;
    myGlWorkOrderService
      .getHeaderData(headId, page, size)
      .then(res => {
        if (res.status === 200) {
          let docHeadData = res.data.head;
          let data = res.data.line;
          //获取到的行数据，全部都给一个index序号，用来作为唯一标识符
          data.map((item, index) => {
            data[index].key = index;
          });
          let dimensionData = res.data.dimensions;
          let headerInfo = {
            businessCode: docHeadData.workOrderNumber,
            createdDate: docHeadData.requisitionDate,
            formName: docHeadData.typeName,
            createByName: docHeadData.createByName,
            currencyCode: docHeadData.currency,
            totalAmount: docHeadData.amount,
            statusCode: docHeadData.status,
            remark: docHeadData.remark,
            infoList: [
              { label: '申请人', value: docHeadData.employeeName },
              { label: '公司', value: docHeadData.companyName },
              { label: '部门', value: docHeadData.unitName },
            ],
            attachments: docHeadData.attachments,
          };
          this.setState(
            {
              docHeadData,
              headerInfo,
              dimensionData,
              data,
              loading: false,
              pagination: {
                total: Number(res.headers['x-total-count'])
                  ? Number(res.headers['x-total-count'])
                  : 0,
                current: page + 1,
                onChange: this.onChangeCheckedPage,
                onShowSizeChange: this.onShowSizeChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => `共搜到 ${total} 条数据`,
              },
            },
            () => {
              this.addDimensionColumns(dimensionData);
            }
          );
        }
      })
      .catch(e => {
        console.log(`获取单据信息失败：${e}`);
        if (e.response) {
          message.error(`获取单据信息失败：${e.response.data.message}`);
        }
        this.setState({
          loading: false,
        });
      });
  };
  /**
   * 切换分页
   */
  onChangeCheckedPage = page => {
    if (page - 1 !== this.state.page) {
      let { pagination, pageSize } = this.state;
      pagination.pageSize = pageSize;
      this.setState(
        {
          loading: true,
          page: page - 1,
          pagination,
        },
        () => {
          this.getDocInfoById();
        }
      );
    }
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange = (current, pageSize) => {
    let { pagination } = this.state;
    pagination.pageSize = pageSize;
    this.setState(
      {
        loading: true,
        page: current - 1,
        pageSize,
        pagination,
      },
      () => {
        this.getDocInfoById();
      }
    );
  };
  /**
   * 实现动态添加维度列
   */
  addDimensionColumns = dimensionData => {
    let { columns, tableWidth } = this.state;
    if (columns.length <= 8) {
      dimensionData.map(item => {
        //根据维度个数调整列宽
        tableWidth += 140;
        //维度id
        let dimensionId = item.id;
        //维度name
        let dimensionTitle = item.name;
        //维值id-字段名称
        let dimensionKey = 'dimensionValue' + item.priority + 'Id';
        //维值name-字段名称
        let dimensionName = 'dimensionValue' + item.priority + 'Name';
        //拼接列
        let dimensionColumn = {
          title: dimensionTitle,
          dataIndex: dimensionKey,
          align: 'center',
          width: 140,
          render: (text, record, index) => {
            if (record.lineStatus === 'normal') {
              return <span>{record[dimensionName]}</span>;
            } else {
              return (
                <Chooser
                  onChange={value =>
                    this.onDimensionChange(value, record, index, dimensionKey, dimensionName)
                  }
                  value={
                    record[dimensionKey]
                      ? [{ id: record[dimensionKey], name: record[dimensionName] }]
                      : []
                  }
                  type="dimension_value"
                  labelKey="name"
                  valueKey="id"
                  single={true}
                  listExtraParams={{ id: dimensionId }}
                  showClear={false}
                />
              );
            }
          },
        };
        columns.splice(5, 0, dimensionColumn);
        this.setState({
          columns,
          tableWidth,
        });
      });
    }
  };
  /**
   * 头上的编辑按钮触发的事件
   */
  edit = () => {
    let { docHeadData } = this.state;
    this.props.dispatch(
      routerRedux.push({
        pathname: `/gl-work-order/my-gl-work-order/edit-gl-work-order/:typeId/${this.props.match.params.oid}/${
          docHeadData.id
          }`,
      })
    );
  };
  /**
   * 新建核算信息
   * 1.总是跳转到最后一条数据之后加行
   * 2.如果新增的行所在的页的总条数超过了每页条数，则重设每页条数为当前页所有的条数
   */
  addDocLine = record => {
    let { pagination, page, pageSize, data } = this.state;
    //判断当前页是不是有insert状态的行，是否有edit状态的行
    let insertCount = 0;
    let editCount = 0;
    data.map(item => {
      if (item.lineStatus === 'insert') {
        insertCount += 1;
      }
      if (item.lineStatus === 'edit') {
        editCount += 1;
      }
    });
    //最后一页的页数--->page 从0开始
    let tempPage = parseInt(pagination.total / pageSize);
    //如果当前页面的length已经等于pageSize了，还有编辑行的情况，就提示有未保存信息，先保存再新增
    if (editCount > 0 && page !== tempPage) {
      message.error('您当前有未保存的行，请保存后再新增');
      return;
    }
    //判断如果当前页不在最后一页，则先跳转到最后一页
    if (page !== tempPage && insertCount === 0) {
      this.setState(
        {
          loading: true,
          page: tempPage,
        },
        () => {
          this.additionalMethod1(record);
        }
      );
    } else {
      //如果当前页的条数太大，就把当前页的条数变成当前页数据的数量值
      this.additionalMethod2(record);
    }
  };
  /**
   * 新增行附加方法
   */
  additionalMethod1 = record => {
    let headId = this.props.match.params.id;
    let page = this.state.page;
    let size = this.state.pageSize;
    myGlWorkOrderService
      .getHeaderData(headId, page, size)
      .then(res => {
        if (res.status === 200) {
          let data = res.data.line;
          this.setState(
            {
              data,
              loading: false,
              pagination: {
                total: Number(res.headers['x-total-count'])
                  ? Number(res.headers['x-total-count'])
                  : 0,
                current: page + 1,
                onChange: this.onChangeCheckedPage,
                onShowSizeChange: this.onShowSizeChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => `共搜到 ${total} 条数据`,
              },
            },
            () => {
              this.additionalMethod2(record);
            }
          );
        }
      })
      .catch(e => {
        console.log(`获取单据信息失败：${e}`);
        if (e.response) {
          message.error(`获取单据信息失败：${e.response.data.message}`);
        }
        this.setState({
          loading: false,
        });
      });
  };
  /**
   * 新建附加方法
   */
  additionalMethod2 = record => {
    //如果当前页的条数太大，就把当前页的条数变成当前页数据的数量值
    let { pagination, pageSize, data } = this.state;
    let newRecord = {};
    //如果是复制过来的数据
    if (record.id) {
      newRecord = record;
      newRecord.id = null;
      newRecord.versionNumber = null;
      newRecord.lineStatus = 'insert';
    } else {
      //如果是纯新增的数据
      newRecord = {
        lineStatus: 'insert',
        workOrderTypeId: this.state.docHeadData.workOrderTypeId,
      };
    }
    data.push(newRecord);
    data.map((item, index) => {
      data[index].key = index;
    });
    pagination.total += 1;
    if (data.length > pageSize) {
      pagination.pageSize = data.length;
      this.setState({ pagination });
    }
    this.setState({ data });
  };
  /**
   * 批量保存
   */
  onSave = () => {
    //校验必输字段
    let { data } = this.state;
    this.setState({ saveFlag: true });
    let nullFlag = 0;
    data.map((item, index) => {
      if (
        !item.description ||
        !item.companyId ||
        !item.accountId ||
        (!item.enteredAmountCr && !item.enteredAmountDr)
      ) {
        nullFlag += 1;
        return;
      }
      if (!item.unitId) {
        data[index].unitId = null;
      }
    });
    if (nullFlag !== 0) {
      message.error('必输字段不可为空');
      return;
    }
    this.setState({ operationLoading: true });
    let params = [];
    data.map(record => {
      if (record.lineStatus !== 'normal') {
        let recordParam = {
          id: record.id ? record.id : null,
          versionNumber: record.versionNumber,
          workOrderHeaderId: this.props.match.params.id,
          tenantId: this.props.company.tenantId,
          companyId: record.companyId,
          unitId: record.unitId,
          accountId: record.accountId,
          accountCode: record.accountCode,
          employeeId: this.state.docHeadData.createdBy,
          enteredAmountDr: record.enteredAmountDr ? record.enteredAmountDr : 0,
          enteredAmountCr: record.enteredAmountCr ? record.enteredAmountCr : 0,
          description: record.description,
          dimensionValue1Id: Boolean(record.dimensionValue1Id) ? record.dimensionValue1Id : null,
          dimensionValue2Id: Boolean(record.dimensionValue2Id) ? record.dimensionValue2Id : null,
          dimensionValue3Id: Boolean(record.dimensionValue3Id) ? record.dimensionValue3Id : null,
          dimensionValue4Id: Boolean(record.dimensionValue4Id) ? record.dimensionValue4Id : null,
          dimensionValue5Id: Boolean(record.dimensionValue5Id) ? record.dimensionValue5Id : null,
          dimensionValue6Id: Boolean(record.dimensionValue6Id) ? record.dimensionValue6Id : null,
          dimensionValue7Id: Boolean(record.dimensionValue7Id) ? record.dimensionValue7Id : null,
          dimensionValue8Id: Boolean(record.dimensionValue8Id) ? record.dimensionValue8Id : null,
          dimensionValue9Id: Boolean(record.dimensionValue9Id) ? record.dimensionValue9Id : null,
          dimensionValue10Id: Boolean(record.dimensionValue10Id) ? record.dimensionValue10Id : null,
          dimensionValue11Id: Boolean(record.dimensionValue11Id) ? record.dimensionValue11Id : null,
          dimensionValue12Id: Boolean(record.dimensionValue12Id) ? record.dimensionValue12Id : null,
          dimensionValue13Id: Boolean(record.dimensionValue13Id) ? record.dimensionValue13Id : null,
          dimensionValue14Id: Boolean(record.dimensionValue14Id) ? record.dimensionValue14Id : null,
          dimensionValue15Id: Boolean(record.dimensionValue15Id) ? record.dimensionValue15Id : null,
          dimensionValue16Id: Boolean(record.dimensionValue16Id) ? record.dimensionValue16Id : null,
          dimensionValue17Id: Boolean(record.dimensionValue17Id) ? record.dimensionValue17Id : null,
          dimensionValue19Id: Boolean(record.dimensionValue19Id) ? record.dimensionValue19Id : null,
          dimensionValue20Id: Boolean(record.dimensionValue20Id) ? record.dimensionValue20Id : null,
        };
        params.push(recordParam);
      }
    });
    //调用接口实现批量保存
    myGlWorkOrderService
      .saveLineData(params)
      .then(res => {
        if (res.status === 200) {
          message.success('保存成功');
          //清掉用来临时存储编辑行元数据的数组
          this.setState({ editLines: [] });
          //保存成功后刷新页面
          this.setState({ loading: true });
          this.getDocInfoById();
          this.setState({ operationLoading: false });
          this.setState({ saveFlag: false });
          //分页
          let { pagination } = this.state;
          pagination.pageSize = 10;
          this.setState({ pagination });
        }
      })
      .catch(e => {
        console.log('保存失败');
        if (e.response) {
          message.error(`保存失败：${e}`);
        }
        this.setState({ operationLoading: false });
      });
  };
  /**
   * 删除整单
   */
  onDelete = () => {
    this.setState({ operationLoading: true });
    let headerId = this.props.match.params.id;
    myGlWorkOrderService
      .delDocument(headerId)
      .then(res => {
        if (res.status === 200) {
          message.success('删除成功');
          this.setState({ operationLoading: false });
          this.onBack();
        }
      })
      .catch(e => {
        console.log(`删除失败：${e}`);
        if (e.response) {
          message.error(`删除失败：${e.response.data.message}`);
        }
        this.setState({ operationLoading: false });
      });
  };
  /**
   * 提交单据
   */
  onSubmit = () => {
    this.setState({ operationLoading: true });
    //先判断是否有未保存数据
    let { data } = this.state;
    let editingCount = 0;
    data.map(item => {
      if (item.lineStatus !== 'normal') {
        editingCount += 1;
      }
    });
    if (editingCount !== 0) {
      message.error('请先保存未保存数据');
      this.setState({ operationLoading: false });
      return;
    }
    let { docHeadData } = this.state;
    /*let params = {
      applicantOID: docHeadData.applicationOid,
      userOID: docHeadData.empOid,
      formOID: docHeadData.formOid,
      entityOID: docHeadData.documentOid,
      entityType: 801008,
      countersignApproverOIDs: [],
    };*/
    let params = {
      applicantOid: docHeadData.applicationOid,
      userOid: this.props.user.userOID,
      formOid: docHeadData.formOid,
      documentOid: docHeadData.documentOid,
      documentCategory: docHeadData.documentType,
      countersignApproverOIDs: null,
      documentNumber: header.workOrderNumber,
      remark: docHeadData.remark,
      companyId: docHeadData.companyId,
      unitOid: docHeadData.unitOid,
      amount: docHeadData.amount,
      currencyCode: docHeadData.currency,
      documentTypeId: docHeadData.workOrderTypeId,
      applicantDate: docHeadData.createdDate,
      documentId: docHeadData.id
    };
    myGlWorkOrderService
      .submitDocument(params)
      .then(res => {
        if (res.status === 200) {
          this.setState({ operationLoading: false });
          message.success('提交成功');
          this.onBack();
        }
      })
      .catch(e => {
        console.log(`提交失败：${e}`);
        if (e.response) {
          message.error(`提交失败：${e.response.data.message}`);
        }
        this.setState({ operationLoading: false });
      });
  };
  /**
   * 返回首页
   */
  onBack = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/gl-work-order/my-gl-work-order`,
      })
    );
  };
  /**
   * 撤回单据
   */
  back = () => {
    this.setState({ operationLoading: true });
    let params = {
      entities: [
        {
          entityOID: this.state.docHeadData.documentOid,
          entityType: 801008,
        },
      ],
    };
    myGlWorkOrderService
      .approvalsWithdraw(params)
      .then(res => {
        if (res.status === 200) {
          message.success('撤回成功');
          this.setState({ operationLoading: false });
          this.onBack();
        }
      })
      .catch(e => {
        console.log(`撤回失败：${e}`);
        if (e.response) {
          message.error(`撤回失败：${e.response.data.message}`);
        }
        this.setState({ operationLoading: false });
      });
  };
  /**
   * 导入核算信息
   */
  onExportLine = () => {
    this.setState({ showImportFrame: true });
  };
  /**
   * 拼接导入的各种借口地址
   */
  getImportUrl = () => {
    let { templateUrl, uploadUrl, errorUrl, listenUrl } = this.state;
    templateUrl = `${
      config.accountingUrl
      }/api/general/ledger/work/order/head/export/template?headId=${this.props.match.params.id}`;
    uploadUrl = `${config.accountingUrl}/api/general/ledger/work/order/head/import/new?headId=${
      this.props.match.params.id
      }`;
    errorUrl = `${config.accountingUrl}/api/general/ledger/work/order/head/export/fail/${
      this.props.match.params.id
      }`;
    listenUrl = `${config.accountingUrl}/api/general/ledger/batch/transaction/logs`;
    this.setState({
      templateUrl,
      uploadUrl,
      errorUrl,
      listenUrl,
    });
  };
  /**
   * 导入ok
   */
  onImportOk = transactionID => {
    myGlWorkOrderService
      .importOk(transactionID)
      .then(res => {
        if (res.status === 200) {
          this.setState({ showImportFrame: false });
          this.getDocInfoById();
        }
      })
      .catch(e => {
        console.log(`导入失败：${e}`);
        if (e.response) {
          message.error(`导入失败:${e.response.data.message}`);
        }
      });
  };

  showImport = (flag) => {
    this.setState({ showImportFrame: flag })
  };

  /**
   * 渲染函数
   */
  render() {
    //传给头组件的data
    const { headerInfo } = this.state;
    //头行数据
    const { docHeadData } = this.state;
    //审批历史
    const { approveHistory, historyLoading } = this.state;
    //表格
    let { columns, loading, pagination, data, tableWidth } = this.state;
    //操作
    const { operationLoading } = this.state;
    //保存标志
    const { saveFlag } = this.state;
    //导入
    const { showImportFrame, templateUrl, uploadUrl, errorUrl, listenUrl } = this.state;
    //对操作列的控制
    if (docHeadData.status) {
      if (
        docHeadData.status === 1001 ||
        docHeadData.status === 1003 ||
        docHeadData.status === 1005
      ) {
      } else {
        const ii = columns.indexOf(columns.find(o => o.dataIndex === 'operation'));
        if (ii > -1) {
          tableWidth = tableWidth - 150;
          columns.splice(ii, 1);
        }
      }
    }
    //头组件上的几个按钮
    let status = null;
    if (docHeadData.status === 1001 || docHeadData.status === 1003 || docHeadData.status === 1005) {
      status = (
        <h3 className="header-title">
          <Button type="primary" style={{ marginBottom: '14px', float: 'right' }} onClick={this.edit}>
            编 辑
          </Button>
        </h3>
      );
    } else if (docHeadData.status === 1002) {
      status = (
        <h3 className="header-title">
          <Button style={{ marginBottom: '14px',float:'right' }} loading={operationLoading} type="primary" onClick={this.back}>
            撤 回
          </Button>
        </h3>
      );
    } else {
      status = <h3 className="header-title" />;
    }
    //真正渲染出来的东东
    return (
      <div style={{
        background: 'white',
        boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 8px',
        padding: '0px 15px 85px 15px'
      }}>
        <Spin spinning={false}>
          <Card style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
            <Tabs defaultActiveKey="1" onChange={this.tabChange} forceRender>
              <TabPane tab="单据信息" key="1" style={{ border: 'none' }}>
                <DocumentBasicInfo params={headerInfo}>{status}</DocumentBasicInfo>
              </TabPane>
              {/* <TabPane tab="凭证信息" key="2"></TabPane> */}
            </Tabs>
          </Card>
          <Card
            style={{ marginTop: 20, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
            title="核算信息"
          >
            <div className="table-header" style={{ marginTop: '-16px' }}>
              {(docHeadData.status === 1001 ||
                docHeadData.status === 1003 ||
                docHeadData.status === 1005) && (
                  <div className="table-header" style={{ lineHeight: '32px', height: '32px' }}>
                    <div className="table-header-buttons" style={{ float: 'left' }}>
                      <div>
                        <Button type="primary" onClick={this.addDocLine}>
                          新建核算信息
                      </Button>
                        <Button onClick={this.onExportLine}>导入核算信息</Button>
                      </div>
                    </div>
                  </div>
                )}
              <Table
                rowClassName={(record, index) => {
                  return saveFlag &&
                    (!record.description ||
                      !record.companyId ||
                      !record.accountId ||
                      (!record.enteredAmountCr && !record.enteredAmountDr))
                    ? 'row-background-color'
                    : '';
                }}
                style={{ clear: 'both' }}
                bordered
                size="middle"
                rowKey={record => record['key']}
                loading={loading}
                columns={columns}
                pagination={pagination}
                dataSource={data}
                scroll={{ x: 1300 }}
              />
            </div>
          </Card>
        </Spin>
        <div style={{ marginTop: 20, marginBottom: 0, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
          <ApproveHistory loading={historyLoading} infoData={approveHistory} />
        </div>
        <Affix offsetBottom={0} className="bottom-bar bottom-bar-approve" style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          height: '50px',
          boxShadow: '0px -5px 5px rgba(0, 0, 0, 0.067)',
          background: '#fff',
          lineHeight: '50px',
          zIndex: 1,
        }}>
          {docHeadData.status === 1001 ||
            docHeadData.status === 1003 ||
            docHeadData.status === 1005 ? (
              <Row style={{ marginLeft: '30px' }}>
                <Button
                  type="primary"
                  loading={operationLoading}
                  onClick={this.onSubmit}
                >
                  提交
                </Button>
                <Button
                  style={{ marginLeft: '20px' }}
                  loading={operationLoading}
                  onClick={this.onSave}
                >
                  保存
                </Button>
                <Button
                  style={{ marginLeft: '20px' }}
                  loading={operationLoading}
                  onClick={this.onDelete}
                >
                  删除
                </Button>
                <Button
                  style={{ marginLeft: '20px' }}
                  loading={operationLoading}
                  onClick={this.onBack}
                >
                  返回
                </Button>
              </Row>
            ) : (
              <Row style={{ marginLeft: '30px' }}>
                <Button
                  loading={operationLoading}
                  onClick={this.onBack}
                >
                  返 回
                </Button>
              </Row>
            )}
        </Affix>
        {/* 导入 */}
        <ImporterNew visible={showImportFrame}
          title={this.$t("核算工单信息导入")}
          templateUrl={`${config.accountingUrl}/api/general/ledger/work/order/head/export/template?headId=${this.props.match.params.id}`}
          uploadUrl={`${config.accountingUrl}/api/general/ledger/work/order/head/import/new?headId=${this.props.match.params.id}`}
          errorUrl={`${config.accountingUrl}/api/general/ledger/work/order/head/import/new/error/export`}
          errorDataQueryUrl={`${config.accountingUrl}/api/general/ledger/work/order/head/import/new/query/result`}
          deleteDataUrl={`${config.accountingUrl}/api/general/ledger/work/order/head/import/new/delete`}
          fileName={this.$t("核算工单信息导入模板")}
          onOk={this.onImportOk}
          afterClose={() => this.showImport(false)} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(MyGLWorkOrderDetail);
