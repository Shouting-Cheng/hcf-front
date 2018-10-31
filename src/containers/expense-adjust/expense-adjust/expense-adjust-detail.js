/**
 * Created by 13576 on 2017/12/4.
 */
import React from 'react';
import config from 'config';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Form,
  Affix,
  Button,
  message,
  Modal,
  Tabs,
  Table,
  Popover,
  Divider,
  Row,
  Col,
  Popconfirm, Card, Spin,
} from 'antd';
import NewExpenseAdjustDetail from 'containers/expense-adjust/expense-adjust/new-expense-adjust-detail';
import ApprotionInfo from 'containers/expense-adjust/expense-adjust/approtion-info';
import Importer from 'widget/Template/importer';
import 'styles/expense-adjust/expense-adjust-detail.scss';
import adjustService from 'containers/expense-adjust/expense-adjust/expense-adjust.service';
import DocumentBasicInfo from 'widget/document-basic-info'
import ApproveHistory from 'widget/Template/approve-history-work-flow';
import SlideFrame from 'widget/slide-frame';
//import SlideFrame from "components/slide-frame-work";
import Upload from 'widget/upload-button';
import moment from 'moment';
import CustomTable from 'widget/custom-table';
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

class ExpenseAdjustDetail extends React.Component {
  constructor(props) {
    super(props);
    const type = this.props.match.params.type === '1001';
    this.state = {
      voucherLoading: true,
      loading: true,
      type: '',
      record: undefined,
      previewVisible: false,
      previewImage: '',
      documentParams: {},
      infoList: {
        title: '',
        headItems: [
          { label: this.$t('scan-send.code'), key: 'expAdjustHeaderNumber' },
          {
            label: this.$t('acp.requisitionDate'),
            key: 'adjustDate',
            render: item => moment(new Date(item)).format('YYYY-MM-DD'),
          },
          { label: this.$t('my.contract.create.person'), key: 'employeeName' },
        ],
        items: [
          { label: this.$t('exp.adjust.applier'), key: 'employeeName' },
          { label: this.$t('pdc.basic.info.company'), key: 'companyName' },
          { label: this.$t('acp.unitName'), key: 'unitName' },
          { label: this.$t('exp.adjust.type'), key: 'expAdjustTypeName' },
          { label: this.$t('common.comment'), key: 'description' },
          { label: this.$t('acp.fileInfo'), key: '6', isInline: true },
        ],
      },
      headerData: {},
      invoiceId: null,
      voucherPagination: {
        current: 0,
        page: 0,
        pageSize: 5,
      },
      pagination: {
        current: 0,
        page: 0,
        pageSize: 5,
      },
      showApportionOut: false,
      isModal: false, //别的页面用作弹窗使用时，传这个值true
      dLoading: false,
      showSlideFrame: false,
      slideFrameTitle: type ? this.$t('exp.crate.detail') : this.$t('exp.crate.add'),
      showImportFrame: false,
      approveHistory: [],
      costCenterData: [],
      voucherData: [],
      apportionParams: {}, //分摊信息
      tabs: [
        { key: 'bill-info', label: this.$t('acp.document.info') },
        { key: 'voucher-info', label: this.$t('detail.voucher.info') }, //凭证信息
      ],
      nowStatus: 'bill-info',
      widthDrawLoading: false,
      voucherColumns: [
        {
          title: this.$t('acp.index'),
          align: 'center',
          dataIndex: '1',
          key: '1',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('exp.line.desc'),
          align: 'center',
          dataIndex: '2',
          key: '2',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('detail.voucher.date'),
          align: 'center',
          dataIndex: '3',
          key: '3',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('acp.company'),
          align: 'center',
          dataIndex: '4',
          key: '4',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('detail.costCenter.name'),
          align: 'center',
          dataIndex: '5',
          key: '5',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('common.currency'),
          align: 'center',
          dataIndex: '6',
          key: '6',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('detail.entered.amountDr'),
          align: 'center',
          dataIndex: '7',
          key: '7',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('detail.entered.amountCr'),
          align: 'center',
          dataIndex: '8',
          key: '8',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('detail.functional.amountDr'),
          align: 'center',
          dataIndex: '9',
          key: '9',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('detail.functional.amountCr'),
          align: 'center',
          dataIndex: '10',
          key: '10',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('exp.cos.company'),
          align: 'center',
          dataIndex: '11',
          key: '11',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('exp.cos.cos'),
          align: 'center',
          dataIndex: '12',
          key: '12',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('exp.cos.section'),
          align: 'center',
          dataIndex: '13',
          key: '13',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('exp.cos.dept'),
          align: 'center',
          dataIndex: '14',
          key: '14',
          width: 62,
          render: (value, record, index) => index + 1,
        },
      ],
      columns: [
        {
          title: this.$t('common.sequence'),
          align: 'center',
          dataIndex: 'index',
          key: 'index',
          width: 62,
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('my.contract.company'),
          dataIndex: 'companyName',
          width: '80',
          render: desc => (
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('common.department'),
          dataIndex: 'unitName',
          width: '80',
          render: desc => (
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('common.expense.type'),
          dataIndex: 'expenseTypeName',
          width: 100,
          render: desc => (
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('common.amount'),
          dataIndex: 'amount',
          width: 100,
          align: 'center',
          render: desc => this.filterMoney(desc),
        },
        {
          title: this.$t('myReimburse.functionalAmount'),
          dataIndex: 'functionalAmount',
          width: 120,
          align: 'center',
          render: desc => this.filterMoney(desc),
        },
        {
          title: this.$t('common.comment'),
          dataIndex: 'description',
          align: 'center',
          render: desc => (
            <span>
              <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
            </span>
          ),
        },
        {
          title: this.$t('common.operation'),
          dataIndex: 'operate',
          width: 160,
          align: 'center',
          render: (value, record) => {
            return (
              <div>
                {record.vatInvoice && <Divider type="vertical" />}
                <a
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleEdit(record);
                  }}
                >
                  {this.$t('common.edit')}
                </a>
                <Divider type="vertical" />
                <a onClick={() => this.checkOldExpense(record)}>{this.$t('common.copy')}</a>
                <Divider type="vertical" />
                <Popconfirm
                  title={this.$t('configuration.detail.tip.delete')}
                  onConfirm={e => this.deleteItem(e, record)}
                >
                  <a>{this.$t('common.delete')}</a>
                </Popconfirm>
              </div>
            );
          },
        },
      ],
    };
  }

  checkOldExpense = record => {
    record.copy = true;
    this.setState({
      showSlideFrame: true,
      slideFrameTitle:
        this.props.match.params.type === '1001'
          ? this.$t('exp.crate.detail')
          : this.$t('exp.crate.add'),
      record: record,
      type: 'copy',
    });
  };

  handleEdit = record => {
    this.setState({
      showSlideFrame: true,
      slideFrameTitle:
        this.props.match.params.type === '1001'
          ? this.$t('exp.edit.detail')
          : this.$t('exp.edit.add'),
      record: record,
      type: 'copy',
    });
  };

  deleteItem = (e, record) => {
    adjustService
      .deleteExpenseAdjustLine(record.id)
      .then(response => {
        message.success(this.$t('common.delete.success', { name: '' }));
        this.getHeaderInfo();
        this.getList();
      })
      .catch(e => {
        message.error(this.$t('common.delete.failed'));
      });
  };

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    const temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    this.setState(
      {
        loading: true,
        pagination: temp,
      },
      () => {
        this.getList();
      }
    );
  };

  //显示分摊行
  showApportion = record => {
    this.setState({ apportionParams: record.linesDTOList, showApportion: true });
  };

  getDimension = expenseAdjustTypeId => {
    const { columns } = this.state;
    adjustService.getDimensionAndValue(expenseAdjustTypeId).then(response => {
      response.data.reverse().map(
        item =>
          item &&
          columns.splice(7, 0, {
            title: item.name,
            dataIndex: 'dimension' + item.sequenceNumber + 'Name',
            align: 'center',
            render: desc => (
              <span>
                <Popover content={desc ? desc : '-'}>{desc ? desc : '-'}</Popover>
              </span>
            ),
          })
      );
      this.setState({ columns, costCenterData: response.data });
    });
  };

  getList = () => {
    const { pagination } = this.state;
    this.setState({ loading: true });
    let params = {
      expAdjustHeaderId: this.props.match.params.id,
      page: pagination.page,
      size: pagination.pageSize,
    };
    adjustService.getExpenseAdjustLine(params).then(resp => {
      if (resp.status === 200) {
        resp.data.map(item => (item.key = item.id));
        pagination.total = Number(resp.headers['x-total-count']);
        this.setState({
          data: resp.data,
          loading: false,
          pagination,
        });
      }
    });
  };
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.showSlideFrame && nextState.showSlideFrame) return false;
    return true;
  }

  getHeaderInfo = () => {
    adjustService.getExpenseAdjustHeadById(this.props.match.params.id).then(response => {
      let documentParams = {
        businessCode: response.data.expAdjustHeaderNumber,
        createdDate: moment(new Date(response.data.adjustDate)).format('YYYY-MM-DD'),
        formName: response.data.expAdjustTypeName,
        createByName: response.data.employeeName,
        totalAmount: response.data.totalAmount ? response.data.totalAmount : 0,
        currencyCode: response.data.currencyCode,
        statusCode: response.data.status,
        remark: response.data.description,
        infoList: [
          { label: this.$t('exp.adjust.applier'), value: response.data.employeeName },
          { label: this.$t('my.contract.company'), value: response.data.companyName },
          { label: this.$t('common.department'), value: response.data.unitName },
          {
            label: this.$t('exp.adjust.type'),
            value:
              this.props.match.params.type === '1001'
                ? this.$t('exp.adjust.exp.detail')
                : this.$t('exp.adjust.exp.add'),
          },
        ],
        attachments: response.data.attachments,
      };
      let columns = this.state.columns;
      if (response.data.status === 1002 || response.data.status === 1004) {
        columns.splice(columns.length - 1, 1);
      }
      this.setState(
        {
          headerData: response.data,
          documentParams,
          columns,
        },
        () => {
          this.getHistory(response.data.documentOid);
        }
      );
    });
  };

  getHistory = oid => {
    adjustService.getApproveHistoryWorkflow(oid).then(response => {
      this.setState({
        approveHistory: response.data,
      });
    });
  };

  /* getVoucher(){
    let params = {
      tenantId: this.props.user.tenantId,
      sourceTransactionType: '',
      transactionNumber: '',
      page: this.state.voucherPagination.page,
      pageSize: this.state.voucherPagination.pageSize
    };
    adjustService.getVoucherInfo(params).then(response=>{
      this.setState({
        voucherData: response.data,
        voucherLoading: false
      })
    })
  }*/

  componentWillMount() {
    const { columns } = this.state;
    if (this.props.match.params.type === '1001') {
      columns.splice(columns.length - 1, 0, {
        title: this.$t('exp.dir.info'),
        dataIndex: 'checkInfo',
        width: 120,
        align: 'center',
        render: (value, record) => {
          return (
            <a
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                this.showApportion(record);
              }}
            >
              {this.$t('exp.detail.info')}
            </a>
          );
        },
      });
    }
    this.setState({
      slideFrameTitle:
        this.props.match.params.type === '1001'
          ? this.$t('exp.crate.detail')
          : this.$t('exp.crate.add'),
    });
    this.getHeaderInfo();
    this.getDimension(this.props.match.params.expenseAdjustTypeId);
    this.getList();
  }

  handleCreate = () => {
    this.setState({
      showSlideFrame: true,
      slideFrameTitle:
        this.props.match.params.type === '1001'
          ? this.$t('exp.crate.detail')
          : this.$t('exp.crate.add'),
      record: undefined,
    });
  };

  //提交
  onSubmit = () => {
    this.setState({ loading: true });
    adjustService
      .checkBudgetAndSubmit(this.props.match.params.id)
      .then(res => {
        if (res.data.passFlag) {
          //this.submit(true);
          this.setState({ loading: false });
          this.onCancel();
          return;
        }
        if (res.data.code && res.data.code == 'BUD_003') {
          confirm({
            title: this.$t('org.tips'),
            content: res.data.message,
            onOk: () => {
              this.forceSubmit(true);
            },
            onCancel: () => {
              this.setState({ loading: false });
            },
          });
        } else if (res.data.code && res.data.code == 'BUD_002') {
          message.error(res.data.message);
          this.setState({ loading: false });
        }
        /*  else if (res.data.code && res.data.code == "BUD_000") {
        this.submit(false);
      } */
      })
      .catch(err => {
        this.setState({ loading: false });
        message.error(this.$t('exp.summit.failed：') + err.response.data.message);
      });
  };

  //提交
  forceSubmit = flag => {
    let params = {
      id: this.state.headerData.id,
      ignoreBudgetWarningFlag: flag,
    };
    adjustService
      .forceSubmitOnWorkflow(params)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t('common.operate.success' /*操作成功*/));
          this.setState({ loading: false });
          this.onCancel();
        }
      })
      .catch(e => {
        this.setState({ loading: false });
        message.error(`${this.$t('exp.summit.failed：')}，${e.response.data.message}`);
      });
  };

  //删除费用调整单
  onDelete = () => {
    confirm({
      title: this.$t('common.delete'),
      content: this.$t('exp.delete.tips'),
      onOk: () => {
        this.setState({ dLoading: true });
        adjustService
          .deleteExpenseAdjustHead(this.props.match.params.id)
          .then(res => {
            if (res.status === 200) {
              this.setState({ dLoading: false });
              message.success(this.$t('common.delete.success', { name: '' }));
              this.onCancel();
            }
          })
          .catch(e => {
            this.setState({ dLoading: false });
            message.error(`${this.$t('common.delete.failed')}，${e.response.data.message}`);
          });
      },
    });
  };

  handleCloseSlide = params => {
    this.setState(
      {
        showSlideFrame: false,
      },
      () => {
        if (params) {
          this.getList();
          this.getHeaderInfo();
        }
      }
    );
  };

  reloadData = () => {
    this.getList();
    this.getHeaderInfo();
  };

  onLoadOk = transactionId => {
    this.setState({ showImportFrame: false }, () => {
      this.getImportDetailData(transactionId);
      this.getList();
    });
  };
  //导入成功
  getImportDetailData = transactionId => {
    adjustService
      .importData(transactionId)
      .then(res => {
        if (res.status === 200) {
          message.success(this.$t('common.operate.success' /*操作成功*/));
        }
      })
      .catch(e => {
        message.error(`${this.$t('exp.summit.failed：')}，${e.response.data.message}`);
      });
  };

  withdraw = () => {
    this.setState({ widthDrawLoading: true });
    let params = {
      entities: [
        {
          entityOID: this.state.headerData.documentOid,
          entityType: 801006,
        },
      ],
    };
    adjustService
      .withdraw(params)
      .then(res => {
        message.success(this.$t('exp.withDraw.success'));
        this.onCancel();
      })
      .catch(err => {
        this.setState({ widthDrawLoading: false });
        message.error(this.$t('exp.withDraw.failed') + err.response.data.message);
      });
  };

  //返回
  onCancel = () => {
    this.props.dispatch(routerRedux.push({ pathname: '/expense-adjust/my-expense-adjust' }));
  };

  //图片预览
  preview = record => {
    this.setState({ previewVisible: true, previewImage: record.thumbnailUrl });
  };

  expandedRowRender = record => {
    return (
      <Row>
        <Col style={{ textAlign: 'right' }} span={2}>
          <h3>{this.$t('my.contract.enclosure.information')}：</h3>
        </Col>
        <Col span={20}>
          <Row>
            {record.attachments &&
              record.attachments.map(item => {
                return (
                  <Col
                    span={6}
                    style={{
                      textAlign: 'left',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    key={item.id}
                  >
                    <Popover content={item.fileName}>
                      {item.fileType !== 'IMAGE' ? (
                        <a
                          href={`${config.baseUrl}/api/attachments/download/${
                            item.attachmentOID
                          }?access_token=${
                            JSON.parse(localStorage.getItem('hly.token')).access_token
                          }`}
                        >
                          {item.fileName}
                        </a>
                      ) : (
                        <a
                          onClick={() => {
                            this.preview(item);
                          }}
                        >
                          {item.fileName}
                        </a>
                      )}
                    </Popover>
                  </Col>
                );
              })}
          </Row>
        </Col>
      </Row>
    );
  };

  handleHeadEdit = () => {
    this.props.dispatch(
      routerRedux.replace({
        pathname: '/expense-adjust/my-expense-adjust/new-expense-adjust/:id/:expenseAdjustTypeId'
          .replace(':id', this.state.headerData.id)
          .replace(':expenseAdjustTypeId', this.state.headerData.expAdjustTypeId),
      })
    );
  };

  handleTab = key => {
    if (key === 'voucher') {
      this.customTable &&
        this.customTable.state.data.length === 0 &&
        this.customTable.search({
          tenantId: this.props.user.tenantId,
          sourceTransactionType: '',
          transactionNumber: '',
        });
    }
  };

  renderContent = () => {
    const {
      nowStatus,
      type,
      previewVisible,
      previewImage,
      widthDrawLoading,
      documentParams,
      apportionParams,
      showApportion,
      voucherColumns,
      voucherData,
      pagination,
      voucherPagination,
      voucherLoading,
      loading,
      dLoading,
      data,
      columns,
      showSlideFrame,
      showImportFrame,
      slideFrameTitle,
      tabs,
      isModal,
      costCenterData,
      infoList,
      headerData,
      approveHistory,
    } = this.state;
    const newState = (
      <div>
        <Button
          type="primary"
          onClick={this.onSubmit}
          loading={loading}
          style={{ margin: '0 20px' }}
        >
          {this.$t('my.contract.submit')}
        </Button>
        <Button onClick={this.onDelete} loading={dLoading}>
          {' '}
          {this.$t('exp.delete.receipt')}{' '}
        </Button>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>
          {this.$t('common.back')}
        </Button>
      </div>
    );
    const otherState = (
      <div>
        <Button style={{ marginLeft: '20px' }} onClick={this.onCancel}>
          {this.$t('common.back')}
        </Button>
      </div>
    );

    let flag = headerData.status === 1004;

    return (
      <div className="adjust-content" style={{ marginBottom: 50 }}>
        <Card style={{boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"}}>
          <DocumentBasicInfo params={documentParams}>
            {headerData.status &&
              (headerData.status == 1001 ||
                headerData.status == 1003 ||
                headerData.status == 1005) && (
                <Button
                  loading={widthDrawLoading}
                  onClick={this.handleHeadEdit}
                  type="primary"
                  style={{ float: 'right', top: -4 }}
                >
                  {this.$t('common.edit')}
                </Button>
              )}
            {headerData.status === 1002 && (
              <Button type="primary" onClick={this.withdraw} style={{ float: 'right', top: -4 }}>
                {this.$t('common.withdraw')}
              </Button>
            )}
          </DocumentBasicInfo>
        </Card>
        <Card style={{marginTop: 20,boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"}} className='expense-adjust-detail-center'>
          <div className="center-title">{this.$t('exp.adjust.info')}</div>
          <Row gutter={24} style={{ marginTop: 15 }}>
            <Col span={18} style={{ marginBottom: 5 }}>
              {!isModal ? (
                <div
                  style={{
                    display:
                      headerData.status === 1002 || headerData.status === 1004
                        ? 'none'
                        : 'inline-block',
                    paddingBottom: 5,
                  }}
                >
                  <Button type="primary" onClick={this.handleCreate}>
                    {this.props.match.params.type === '1001'
                      ? this.$t('exp.crate.detail')
                      : this.$t('exp.crate.add')}
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.setState({ showImportFrame: true });
                    }}
                    style={{ marginLeft: 15 }}
                  >
                    {this.props.match.params.type === '1001'
                      ? this.$t('exp.import.detail')
                      : this.$t('exp.import.add')}
                  </Button>
                </div>
              ) : null}
            </Col>
            <Col
              span={6}
              className="table-header-tips"
              style={{ textAlign: 'right', marginTop: 10 }}
            >
              {this.$t('exp.amount.total')}：<span style={{ color: 'green' }}>
                {headerData.currencyCode && headerData.currencyCode + ' '}&nbsp;{headerData.totalAmount
                  ? this.filterMoney(headerData.totalAmount)
                  : this.filterMoney(0)}
              </span>
            </Col>
          </Row>
          <Table
            rowKey={record => record.id}
            dataSource={data}
            loading={loading}
            columns={columns}
            pagination={pagination}
            scroll={{ x: 1300, y: 0 }}
            onChange={this.onChangePager}
            size="middle"
            expandedRowRender={this.expandedRowRender}
            bordered
          />
        </Card>
        <div style={{ marginTop: 20, marginBottom: 0, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}>
          <ApproveHistory loading={false} infoData={approveHistory} />
        </div>
        <ApprotionInfo
          close={() => {
            this.setState({ showApportion: false, apportionParams: [] });
          }}
          visible={showApportion}
          params={{ costCenterData: costCenterData, data: apportionParams }}
          z-index={1001}
        />
        <Importer
          visible={showImportFrame}
          templateUrl={`${
            config.baseUrl
          }/api/expense/adjust/lines/export/template?expenseAdjustHeaderId=${
            this.props.match.params.id
          }&external=${true}`}
          uploadUrl={`${config.baseUrl}/api/expense/adjust/lines/import?expenseAdjustHeaderId=${
            this.props.match.params.id
          }`}
          listenUrl={`${config.baseUrl}/api/expense/adjust/lines/import/log`}
          errorUrl={`${config.baseUrl}/api/expense/adjust/lines/failed/export/${
            this.props.match.params.id
          }/true`}
          title={this.$t('exp.import.line')}
          fileName={this.$t('exp.import.line')}
          onOk={this.onLoadOk}
          afterClose={() => this.setState({ showImportFrame: false })}
        />
        <SlideFrame
          width="900px"
          show={showSlideFrame}
          title={slideFrameTitle}
          onClose={() => {
            this.setState({ showSlideFrame: false });
          }}
        >
          <NewExpenseAdjustDetail
            params={{
              expenseHeader: headerData,
              expenseAdjustHeadId: this.props.match.params.id,
              adjustLineCategory: this.props.match.params.type,
              expenseAdjustTypeId: this.props.match.params.expenseAdjustTypeId,
              costCenterData: costCenterData,
              flag: showSlideFrame,
              record: this.state.record,
              type: type,
              query: this.reloadData,
              visible: showSlideFrame,
            }}
            onClose={this.handleCloseSlide}
          />
        </SlideFrame>
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => {
            this.setState({ previewVisible: false });
          }}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
        <Affix
          offsetBottom={0}
          style={flag ? { marginLeft: -25 } : { marginLeft: -15 }}
          className="bottom-bar-jsq"
        >
          {isModal
            ? otherState
            : (headerData.status && headerData.status == 1001) ||
              headerData.status == 1003 ||
              headerData.status == 1005
              ? newState
              : otherState}
        </Affix>
      </div>
    );
  };

  render() {
    const {
      voucherData,
      voucherLoading,
      voucherColumns,
      voucherPagination,
      showSlideFrame,
      showImportFrame,
      tabs,
      isModal,
      costCenterData,
      infoList,
      headerData,
      approveHistory,
    } = this.state;
    return (
      <div className="expense-adjust-detail">
        {headerData.status === 1004 ? (
          <Tabs
            defaultActiveKey="detail"
            onChange={this.handleTab}
            forceRender
            className="adjust-tabs"
          >
            <TabPane tab={this.$t('exp.receipt.info')} key="detail">
              {this.renderContent()}
            </TabPane>
            <TabPane tab={this.$t('exp.voucher.info')} key="voucher">
              <div style={{ background: 'white', margin: '-12px 0 0 -10px', padding: 10 }}>
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 18, marginBottom: 5 }}>
                    {this.$t('exp.expense.voucher')}
                  </div>
                  <CustomTable
                    ref={ref => (this.customTable = ref)}
                    showNumber={true}
                    methodType="post"
                    columns={voucherColumns}
                    params={{
                      tenantId: this.props.user.tenantId,
                      sourceTransactionType: '',
                      transactionNumber: '',
                    }}
                    url={`${
                      config.accountingUrl
                    }/api/accounting/gl/journal/lines/query/by/transaction/number`}
                    croll={{ x: 1300, y: voucherData.length === 0 ? false : 200 }}
                  />
                </div>
              </div>
            </TabPane>
          </Tabs>
        ) : (
          this.renderContent()
        )}
      </div>
    );
  }
}

/*ExpenseAdjustDetail.contextTypes = {
  router: React.PropTypes.object,
  isModal: React.PropTypes.bool,
  isChecking: React.PropTypes.bool,
};*/

ExpenseAdjustDetail.defaultProps = {
  isModal: true,
  isChecking: true,
};

function mapStateToProps(state) {
  return {
    user: state.user.currentUser,
    company: state.user.company,
    organization: state.user.organization,
  };
}

const wrappedExpenseAdjustDetail = Form.create()(ExpenseAdjustDetail);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedExpenseAdjustDetail);
