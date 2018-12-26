import {messages} from "utils/utils";
/**
 * Created by 13576 on 2017/11/22.
 */
import React from 'react';
import { connect } from 'dva'

import httpFetch from 'share/httpFetch';

import config from 'config'
import PropTypes from 'prop-types';

import {
  Form,
  Button,
  Select,
  Row,
  Col,
  Input,
  Switch,
  Icon,
  Badge,
  Tabs,
  message,
  Popconfirm,
  Popover
} from 'antd';
import Table from 'widget/table'
import SlideFrame from "widget/slide-frame"
import ListSelector from 'widget/list-selector'
import AddAuthorization from './add-authorization'
import AddPayWay from './add-pay-way'
import companyAccountSettingService from './company-account-setting.service'
import * as routerRedux from 'react-router-redux';
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const Search = Input.Search;


class BankAccountDetail extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showImportFrame: false,
      updateState: false,
      saving: false,
      loading: true,
      editing: false,
      infoData: {},
      selectedRowKeys: [],
      showSlideFrame: false,    //控制授权侧拉
      visibleSlideFrame: false,  //控制付款方式侧拉
      updateParams: {},
      editParams: {},
      tabs: [
        { key: 'AUTHORIZATION', name: messages('bank.account.authorization') }, /*账户授权*/
        { key: 'APY_TYPE', name: messages('pay.way') }  /*付款方式*/
      ],
      typeData: {},
      data: [],
      tabsData: {
        AUTHORIZATION: {
          url: `${config.baseUrl}/api/companyBankAuth/selectCompanyBankId?id=${this.props.match.params.companyBankId}`,
          rowSelection: null,
          columns:
            [
              { title: messages('bank.account.companyCode'), dataIndex: 'companyCode', width: '16%',
                render: value => {
                  return <Popover content={value} >{value}</Popover>
                }
              },
              { title: messages('bank.account.companyName'), dataIndex: 'companyName', width: '16%',
                render: value => {
                  return <Popover content={value} >{value}</Popover>
                }
                },
              { title: messages('bank.account.departmentCode'), dataIndex: 'departmentCode', width: '16%' ,
                render: value => {
                  return <Popover content={value} >{value}</Popover>
                }},
              {
                title: messages('bank.account.departmentName'), dataIndex: 'departmentName', width: '16%',
                render: value => {
                  return <Popover content={value} >{value}</Popover>
                }
              },
              // { title: "职务编码", key: "5", dataIndex: '5', width: '16%' },
              // { title: "职务名称", key: "6", dataIndex: '6', width: '16%' },
              { title: messages('bank.account.employeeName'), dataIndex: 'employeeName', width: '16%' },
              {
                title: messages('company.startDateActive'), dataIndex: 'authorizeDateFrom', width: '16%', render(recode) {
                  return recode ? String(recode).substr(0, 10) : "";
                }
              },
              {
                title: messages('company.endDateActive'), dataIndex: 'authorizeDateTo', width: '16%',
                render(recode) {
                  return recode ? String(recode).substr(0, 10) : "";
                }
              },
              {
                title: messages('bank.account.state'), dataIndex: 'enabled', width: '16%', render(enabled) {
                  return <Badge status={enabled ? 'success' : 'error'}
                    text={enabled ? messages('common.status.enable') : messages('common.status.disable')} />
                }
              },
              {
                title: messages('common.operation'), dataIndex: 'id', width: '16%', render: (text, record) => (
                  <span>
                    <a onClick={(e) => this.handleEdit(e, record)}>{messages('common.edit')}</a>
                  </span>)
              }
            ]
        },
        APY_TYPE: {
          rowSelection: null,
          url: `${config.baseUrl}/api/comapnyBankPayment/getByBankAccountId?id=${this.props.match.params.companyBankId}`,
          columns:
            [
              { title: messages('pay.way.type'), dataIndex: 'paymentMethodCategoryName' },
              { title: messages('pay.wayCode'), dataIndex: 'paymentMethodCode', key: "paymentMethodCode" },
              { title: messages('pay.wayName'), dataIndex: 'description', key: "description" },
              {
                title: messages('common.operation'), dataIndex: 'id', render: (text, record) => (
                  <span>
                    <a onClick={(e) => this.handleEdit(e, record)}>{messages('common.edit')}</a>
                    <span className="ant-divider" />
                    <Popconfirm title="确认删除吗？" onConfirm={(e) => this.deleteItem(e, record)}><a>{messages('common.delete')}</a></Popconfirm>
                  </span>)
              }
            ]

        },
      },
      rowSelection: {
        type: 'checkbox',
        selectedRowKeys: [],
        onChange: this.onSelectChange,
      },
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      nowStatus: 'AUTHORIZATION',
      showListSelector: false,
      newData: [],
      addText: messages('bank.account.addAuthorization'),
    }
  }

  //选项改变时的回调，重置selection
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let tabsData = this.state.tabsData;
    tabsData.APY_TYPE.rowSelection.selectedRowKeys = selectedRowKeys;


    this.setState({ tabsData, selectedRowKeys });
  };


  componentWillMount() {
    this.getCompanyBankByCompanyBankId(this.props.match.params.companyBankId);
    this.getList();
  }

  //根据companyBankId获取公司银行信息
  getCompanyBankByCompanyBankId(companyBankId) {
    // httpFetch.get(`${config.baseUrl}/api/CompanyBank/selectById?companyBankId=${companyBankId}`).then((response) => {
    companyAccountSettingService.getCompanyBankByCompanyBankId(companyBankId).then((response) => {

      response.data.enabled = response.data.enabled ? messages('common.status.enable') : messages('common.status.disable');
      //开户地
      response.data.openAddress = `${response.data.province}/${response.data.city}`
      this.setState({
        infoData: response.data,
      })
    }).catch((e) => {
      message.error(e);
    })
  }


  getList = () => {
    const { tabsData, page, pageSize, nowStatus } = this.state;
    this.setState({loading: true});
    let url = tabsData[nowStatus].url;
    if (url) {
      // &page=${page}&size=${pageSize}
      // return httpFetch.get(`${url}`).then(response => {
      url += `&page=${page}&size=${pageSize}`;
      return companyAccountSettingService.getBankAccountDetailList(url).then(response => {
        response.data.map((item, index) => {
          item.nowStatus = item.id ? item.id : index;
        });
        this.setState({
          data: response.data,
          loading: false,
          pagination: {
            total: Number(response.headers['x-total-count']),
            onChange: this.onChangePager,
            current: this.state.page + 1,
            pageSizeOptions : ['10','20','30','40'],
            showSizeChanger: true,
            onShowSizeChange : this.onChangePageSize,
            showQuickJumper:true,
            showTotal:(total, range) => this.$t({id:"common.show.total"},{range0:`${range[0]}`,range1:`${range[1]}`,total: total})
          }
        })
      })
    }
  };

  //每页多少条
  onChangePageSize =(page, pageSize) =>{
    if (page - 1 !== this.state.page || pageSize !== this.state.pageSize) {
      this.setState({ page: page - 1,pageSize:pageSize,loading: true, }, () => {
        this.getList();
      })
    }
  };

  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true,
      }, () => {
        this.getList();
      })
  };


  //删除一个付款方式
  deleteItem = (e, record) => {
    // httpFetch.delete(`${config.baseUrl}/api/comapnyBankPayment/deleteById?id=${record.id}`).then(res => {
    companyAccountSettingService.deletePayWay(record.id).then(res => {
      message.success(messages('common.operate.success'));
      this.setState({
        page: parseInt((this.state.pagination.total-2)/this.state.pageSize),
        pagination:{
          ...this.state.pagination,
          total: this.state.pagination.total-1,
        }
      },()=> this.getList());
    }).catch(e => {
      message.error(e.response.data.message);
    })
  }

  //公司详情编辑
  updateHandleInfo = (params) => {
    this.setState({ editing: true });
    params.enabled = true;
    params.bankCode = this.state.infoData.bankCode;
    params.companyId = this.state.infoData.companyId;

    // httpFetch.post(`${config.baseUrl}/api/CompanyBank/insertOrUpdate`, Object.assign(this.state.typeData, params)).then(response => {
    companyAccountSettingService.updateHandle(Object.assign(this.state.typeData, params)).then(response => {
      message.success(messages('common.operate.success'));
      let data = response.data;
      this.setState({
        typeData: data,
        updateState: true,
        editing: false
      });
    }).catch(e => {
      this.setState({ editing: false })
    });
  };

  //渲染Tabs
  renderTabs = () => {
    return (
      this.state.tabs.map(tab => {
        return <TabPane tab={tab.name} key={tab.key} />
      })
    )
  }

  //点击
  onChangeTabs = (key) => {
    this.setState({
      nowStatus: key,
      loading: true,
      addText: key == 'AUTHORIZATION' ? messages('bank.account.addAuthorization') : messages('common.add'),
      data: [],
      pagination: {
        total: 0
      },
      page: 0
    }, () => {
      this.getList();
    })
  };

  //新建
  handleNew = () => {

    if (this.state.nowStatus == "AUTHORIZATION") {
      let companyBankId = this.props.match.params.companyBankId;
      this.setState({ updateParams: { companyBankId: companyBankId }, showSlideFrame: true, });
    }
    else {
      let companyBankId = this.props.match.params.companyBankId;
      this.setState({ editParams: { companyBankId: companyBankId }, visibleSlideFrame: true, });
    }

  };

  //编辑
  handleEdit = (e, record) => {

    if (this.state.nowStatus == "AUTHORIZATION") {
      let companyBankId = this.props.match.params.companyBankId;
      record = { ...record, companyBankId, company: [{ id: record.companyId, key: record.companyId, companyCode: record.companyCode }] }
      this.setState({ updateParams: record, showSlideFrame: true, });
    }
    else {
      let companyBankId = this.props.match.params.companyBankId;
      record.companyBankId = companyBankId;
      record.company = [{ id: record.companyId, key: record.companyId, companyCode: record.companyCode }];
      this.setState({ editParams: record, visibleSlideFrame: true, });
    }

  };

  //提交表单
  submitHandle = (value) => {
    const companyOidTo = (value.result)[0].companyOid;
    const companyOidFrom = this.props.match.params.companyOId;
    const selectedRowKeys = this.state.selectedRowKeys;
    // let path = `${config.baseUrl}/api/users/move?companyOidFrom=${companyOidFrom}&companyOidTo=${companyOidTo}&selectMode=default?`
    // selectedRowKeys.map((item) => {
    //   path = `${path}&userOids=${item}`
    // })
    // httpFetch.put(path).then((req) => {
    companyAccountSettingService.submitHandle(companyOidFrom, companyOidTo, selectedRowKeys).then((req) => {
      message.success(messages('common.operate.success'));
      this.getCompanyByCompanyOid(companyOidFrom);
      this.setState({
        selectedRowKeys: [],
      })
    }).catch((e) => {
      message.error(e.response.data)
    })
    this.showImport(false)
  }

  //员工移动
  removeUser = () => {
    this.showImport(true)
  }

  showImport = (value) => {
    this.setState({
      showImportFrame: value
    })
  }

  CancelHandle = () => {
    this.showImport(false)
  }

  handleCloseSlide = (params) => {


    if (this.state.nowStatus == "AUTHORIZATION") {
      this.setState({
        showSlideFrame: false
      }, () => {
        if (params) {
          this.getList();
        }
      })
    }
    else {
      this.setState({
        visibleSlideFrame: false
      }, () => {
        if (params) {
          this.getList();
        }
      })
    }
  }

  handleBack = () => {
    let path = '/pay-setting/company-account-setting';
    this.props.dispatch(
      routerRedux.push({
        pathname: path
      })
    );
  }

  handleCloseAuthorization = params => {
    this.setState(
      {
        showSlideFrame: false,
      },
      () => {
        params && this.getList();
      }
    );
  };

  handleClosePayWay = params => {
    this.setState(
      {
        visibleSlideFrame: false,
      },
      () => {
        params && this.getList();
      }
    );
  };

  render() {
    const { infoList, selectedRowKeys, rowSelection, infoData, tabsData, loading, pagination, nowStatus, data, showListSelector, saving, newData, updateState, editing, showSlideFrame, updateParams, addText, visibleSlideFrame, editParams } = this.state;

    return (
      <div>
        <Tabs onChange={this.onChangeTabs} style={{ marginTop: 20 }}>
          {this.renderTabs()}
        </Tabs>
        <div className="table-header">
          <div>
            <div className="table-header-buttons">
              <Button type="primary" onClick={this.handleNew} loading={saving}>{addText}</Button>
            </div>
          </div>
        </div>
        <Table columns={tabsData[nowStatus].columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          bordered
          size="middle"
          rowKey={(reCode) => { return reCode.id }}
          rowSelection={tabsData[nowStatus].rowSelection}
        />

        <a style={{ fontSize: '14px', paddingBottom: '20px' }} onClick={this.handleBack}><Icon type="rollback" style={{ marginRight: '5px' }} />返回</a>


        <ListSelector visible={this.state.showImportFrame}
          onOk={this.submitHandle}
          onCancel={this.CancelHandle}
          type='available_company'
          single={true}
          extraParams={{ "versionId": this.props.match.params.versionId }}
        />

        <SlideFrame title={!updateParams.id ? messages('bank.account.addAuthorization') : messages('bank.account.editAuthorization')}
          show={showSlideFrame}
          afterClose={this.handleCloseSlide}
          onClose={() => this.setState({ showSlideFrame: false })}>

          <AddAuthorization onClose={(e) => this.handleCloseAuthorization(e)}
                            params={{ flag: showSlideFrame, record: updateParams }} />
        </SlideFrame>

        <SlideFrame title={!editParams.id ? messages('bank.account.addPayWay') : messages('bank.account.editPayWay')}
          show={visibleSlideFrame}
          afterClose={this.handleCloseSlide}
          onClose={() => this.setState({ visibleSlideFrame: false })}>
          <AddPayWay onClose={(e) => this.handleClosePayWay(e)}
                     params={{ flag: visibleSlideFrame, record: editParams }} />
        </SlideFrame>

      </div>
    )
  }

}

BankAccountDetail.contextTypes = {
  router: PropTypes.object
}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(BankAccountDetail);

