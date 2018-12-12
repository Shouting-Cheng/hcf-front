import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Icon,
  Modal,
  message,
  Card,
  Row,
  Col,
  Popconfirm,
  Button,
  Popover,
} from 'antd';
import Table from 'widget/table'
import NewVendorForm from 'containers/request/new-request/new-vendor-form';
import PropTypes from 'prop-types';

import SearchArea from 'widget/search-area';
import requestService from 'containers/request/request.service';

import 'styles/request/new-request/new-ven-master.scss';

class NewVenMaster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newVendorVisible: false, // 增加收款人
      footer: [], // 选择收款人自定义弹款底部
      accountFooter: [], // 选择银行卡号底部
      loading: false,
      payeeModalVisible: false,
      accountModalVisible: false,
      searchForm: [
        { type: 'input', id: 'venNickname', label: this.$t('request.edit.ven.name' /*名称*/) },
      ],
      searchParams: {},
      columns: [
        {
          title: this.$t('common.sequence'),
          dataIndex: 'index',
          width: '10%',
          render: (value, record, index) => index + 1,
        },
        {
          title: this.$t('request.edit.ven.name' /*名称*/),
          dataIndex: 'venNickname',
          render: (value, record) =>
            +record.venType === 1002 ? (
              <span style={{ color: '#dcdcdc' }}>
                {value}({this.$t('org.tree.has-disabled')})
              </span>
            ) : (
              value
            ),
        },
      ],
      data: [],
      page: 0,
      pageSize: 10,
      pagination: {
        total: 0,
      },
      payeeInfo: {},
      accountColumns: [
        {
          title: this.$t('request.edit.ven.account' /*供应商收款账号*/),
          dataIndex: 'bankAccount',
          width: '20%',
        },
        {
          title: this.$t('request.detail.loan.account.bank' /*开户银行*/),
          dataIndex: 'bankName',
          width: '35%',
        },
        {
          title: this.$t('request.edit.ven.bank.no' /*开户银行联行号*/),
          dataIndex: 'bankCode',
          width: '20%',
        },
        {
          title: this.$t('request.edit.ven.bank.location' /*开户银行所在地*/),
          dataIndex: 'bankOpeningCity',
          width: '18%',
        },
      ],
      accountData: [],
      selectedRowKeys: [],
      selectedRows: [],
      value: '',
      chooseRows: {},
      chooseInfo: {},
    };
  }

  componentWillMount() {
    this.setFooter();
  }

  componentDidMount() {
    this.setState({ value: this.props.value }, () => {
      this.state.value && this.getAccountList(this.state.value.split(',')[0]);
    });
  }

  // 设置表单自定义低部
  setFooter = () => {
    const { formDetail } = this.props;
    let customFormPropertyMap = formDetail ? formDetail.customFormPropertyMap : {};
    let footer = [],
      accountFooter = [];
    // 可以手动添加收款人按钮
    // 没有搜索到想要的供应商？新增供应商
    let addNewSupplierBtn = (
      <div style={{ float: 'left' }}>
        {this.$t('request.edit.ven.no.search.result')}?{' '}
        <Button
          type="primary"
          size="small"
          onClick={() => {
            this.setState({ newVendorVisible: true, payeeModalVisible: false, chooseInfo: {} });
          }}
        >
          {this.$t('request.edit.ven.new.vendor')}
        </Button>
      </div>
    );
    // 没有想要的收款账号？新增银行账号
    let addNewBankInfoBtn = (
      <div style={{ float: 'left' }}>
        {this.$t('request.edit.ven.no.account.info')}?{' '}
        <Button type="primary" size="small" onClick={this.addNewBankInfoBtnHandler}>
          {this.$t('request.edit.ven.new.account')}
        </Button>
      </div>
    );
    // 取消按钮
    let cancelBtn = (
      <Button type="default" onClick={this.handleCancel}>
        {this.$t('common.cancel')}
      </Button>
    );
    // 返回按钮
    let backBtn = (
      <Button
        type="default"
        onClick={() => {
          this.handleAccountModalShow(false);
        }}
      >
        {this.$t('common.back')}
      </Button>
    );
    // 确认按钮
    let okBtn = (
      <Button type="primary" onClick={this.handleModalOk}>
        {this.$t('common.ok')}
      </Button>
    );
    customFormPropertyMap &&
      `${customFormPropertyMap['document.venmasteradd.enable']}` === 'true' &&
      (footer.push(addNewSupplierBtn), accountFooter.push(addNewBankInfoBtn));
    footer.push(cancelBtn);
    accountFooter.push(backBtn);
    accountFooter.push(okBtn);
    this.setState({ footer, accountFooter });
  };

  //新增新增银行账号的逻辑，需要判断：如果是租户级的供应商，不允许新增银行账户
  addNewBankInfoBtnHandler = () => {
    if (this.state.chooseInfo.source === 'TENANT') {
      // "租户级的供应商，不允许新增银行账户"
      message.warn(this.$t('request.edit.ven.supplier.stop1'));
    } else {
      this.setState({ newVendorVisible: true, accountModalVisible: false });
    }
  };

  getVenMasterList = () => {
    const { page, pageSize, searchParams, payeeInfo } = this.state;
    let params = {
      pageNum: page,
      pageSize,
      venNickname: searchParams.venNickname,
    };
    this.setState({ loading: true });
    requestService.getVenMasterInfo(params).then(res => {
      let data = res.data.body;
      data.map(item => {
        if (payeeInfo && item.id === payeeInfo.id && item.venType === 1002) {
          Modal.info({
            title: this.$t('request.edit.ven.supplier.bockUp') /*该供应商已被企业停用*/,
            content: (
              <div>
                <p>
                  {this.$t('request.edit.ven.supplier.reSelection')}
                  {/*请重新选择供应商*/}
                </p>
              </div>
            ),
            onOk() {},
          });
        }
      });
      this.setState({
        loading: false,
        data: data,
        // pagination: {
        //   total: Number(res.headers['x-total-count']) || 0,
        //   current: page + 1,
        //   onChange: this.onChangePaper
        // }
      });
    });
  };
  /**
   * value为传入值
   * @param nextProps
   */
  componentWillReceiveProps = nextProps => {
    if (!nextProps.value) {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
        value: '',
      });
    }
  };

  getAccountList = (id = this.state.chooseInfo.id) => {
    this.setState({ loading: true });
    const { accountModalVisible } = this.state;
    requestService.getAccountInfo(id).then(res => {
      // let data = res.data.body[0];
      //返回接口数据结构改变
      let data = res.data;
      let bankAccounts = data.venBankAccountBeans;
      if (!bankAccounts || bankAccounts.length === 0) {
        this.setState({
          loading: false,
          accountData: bankAccounts,
          selectedRowKeys: [],
        });
        accountModalVisible
          ? this.setState({
              chooseRows: [],
              chooseInfo: data,
            })
          : this.setState({
              selectedRows: [],
              payeeInfo: data,
            });
        return;
      }
      let select = -1;
      for (let i = 0; i < bankAccounts.length; i++) {
        if (bankAccounts[i].venType === 1001) {
          select = i;
          break;
        }
      }
      if (select === -1) {
        this.setState({
          loading: false,
          accountData: bankAccounts,
          selectedRowKeys: [],
        });
        accountModalVisible
          ? this.setState({
              chooseRows: [],
              chooseInfo: data,
            })
          : this.setState({
              selectedRows: [],
              payeeInfo: data,
            });
        return;
      }
      this.setState({
        loading: false,
        accountData: bankAccounts,
        selectedRowKeys: [bankAccounts[select].id],
      });
      accountModalVisible
        ? this.setState({
            chooseRows: [bankAccounts[select]],
            chooseInfo: data,
          })
        : this.setState({
            selectedRows: [bankAccounts[select]],
            payeeInfo: data,
          });
    });
  };

  onChangePaper = page => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getVenMasterList();
      });
    }
  };

  handlePayeeModalShow = visible => {
    this.setState({ payeeModalVisible: visible }, () => {
      this.state.payeeModalVisible && this.getVenMasterList();
    });
  };

  handleAccountModalShow = visible => {
    this.setState(
      {
        payeeModalVisible: !visible,
        accountModalVisible: visible,
      },
      () => {
        this.state.payeeModalVisible && this.getVenMasterList();
        this.state.accountModalVisible && this.getAccountList();
      }
    );
  };
  clickAccountModalShow = visible => {
    this.setState(
      {
        accountModalVisible: visible,
        selectedRowKeys: [this.state.value.split(',')[1]],
      },
      () => {
        this.state.payeeModalVisible && this.getVenMasterList();
      }
    );
  };

  //搜索
  onSearch = values => {
    this.setState({ searchParams: values || {} }, () => {
      this.getVenMasterList();
    });
  };

  onRowClick = record => {
    this.setState({ chooseInfo: record }, () => {
      this.handleAccountModalShow(true);
    });
  };

  //选择账户
  handleAccountChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: selectedRowKeys,
      chooseRows: selectedRows,
    });
  };
  getCheckboxAccountDisable = record => {
    return {
      disabled: record.venType === 1002,
    };
  };

  handleModalOk = () => {
    let ids = [];
    const { chooseInfo, chooseRows, selectedRows } = this.state;
    this.setState({ payeeInfo: chooseInfo, selectedRows: chooseRows }, () => {
      ids.push(this.state.payeeInfo.id, this.state.selectedRowKeys[0]);
      if (this.state.selectedRows[0]) {
        this.setState(
          {
            accountModalVisible: false,
            value: ids.join(),
          },
          () => {
            this.onChange(this.state.value);
          }
        );
      } else {
        message.warning(this.$t('request.edit.ven.please.select.account' /*请选择收款账号*/));
      }
    });
  };

  handleModalCancel = () => {
    this.setState({ accountModalVisible: false });
  };

  // 新增供应商操作
  handleNewVendorOk = value => {
    //新增银行账户成功之后，返回直接重新刷新供应商模态框
    this.setState(
      {
        newVendorVisible: false,
        accountModalVisible: true,
      },
      () => {
        this.getAccountList(value.id);
      }
    );
    // console.log(value)
    // let ids = [];
    // ids.push(value.id, value.venBankAccountBeans[0].id);
    // let {accountData} = this.state;
    // if (this.state.chooseInfo.id === value.id) {
    //   accountData = accountData.concat(value.venBankAccountBeans);
    // } else {
    //   accountData = value.venBankAccountBeans;
    // }
    // this.setState({
    //   accountData,
    //   payeeInfo: value,
    //   selectedRows: value.venBankAccountBeans,
    //   selectedRowKeys: [value.venBankAccountBeans[0].id],
    //   chooseInfo: value,
    //   chooseRows: value.venBankAccountBeans,
    //   newVendorVisible: false,
    //   accountModalVisible: true,
    //   value: ids.join()
    // }, () => {
    //   console.log(this.state)
    //   this.onChange(this.state.value);
    // })
  };
  //删除
  handleDelete = () => {
    this.setState(
      {
        selectedRowKeys: [],
        selectedRows: [],
        value: '',
      },
      () => {
        this.onChange(this.state.value);
      }
    );
  };

  //取消
  handleCancel = () => {
    this.handlePayeeModalShow(false);
    !this.props.value &&
      this.setState(
        {
          selectedRowKeys: [],
          selectedRows: [],
          value: '',
        },
        () => {
          this.onChange(this.state.value);
        }
      );
  };
  // 关闭新增供应商
  handleCancelNewVendor = () => {
    if (this.state.chooseInfo.id) {
      this.setState({ newVendorVisible: false, accountModalVisible: true });
      return !1;
    }
    this.setState({ newVendorVisible: false, payeeModalVisible: true });
  };

  onChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };
  renderClass = record => {
    return record.venType === 1002 ? '' : '';
  };

  renderAllExpandedRow = record => {
    return record.venType === 1002 ? '该银行账户已被企业停用' : '';
  };

  render() {
    const {
      loading,
      payeeModalVisible,
      newVendorVisible,
      accountModalVisible,
      pagination,
      searchForm,
      columns,
      data,
      footer,
      payeeInfo,
      accountData,
      accountColumns,
      selectedRowKeys,
      selectedRows,
      chooseInfo,
      accountFooter,
    } = this.state;
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: selectedRowKeys,
      onChange: this.handleAccountChange,
      getCheckboxProps: this.getCheckboxAccountDisable,
    };
    let card_extra = (
      <div>
        <a
          onClick={() => {
            this.clickAccountModalShow(true);
          }}
        >
          {this.$t('common.edit') /*编辑*/}
        </a>
        <span className="ant-divider" />
        <Popconfirm title={this.$t('common.confirm.delete')} onConfirm={this.handleDelete}>
          <a>{this.$t('common.delete')}</a>
        </Popconfirm>
      </div>
    );
    return this.props.onlyShow ? (
      <div className="new-ven-master">
        {selectedRows[0] ? (
          <div>
            <Row>
              <Col span={9}>{this.$t('request.edit.ven.account.name') /*供应商开户名称*/}：</Col>
              <Col span={15}>{payeeInfo.venNickname}</Col>
            </Row>
            <Row>
              <Col span={9}>{this.$t('request.edit.ven.account' /*供应商收款账号*/)}：</Col>
              <Col span={15}>{selectedRows[0].bankAccount}</Col>
            </Row>
            <Row>
              <Col span={9}>{this.$t('request.detail.loan.account.bank' /*开户银行*/)}：</Col>
              <Col span={15}>{selectedRows[0].bankName}</Col>
            </Row>
            <Row>
              <Col span={9}>{this.$t('request.edit.ven.bank.no' /*开户银行联行号*/)}：</Col>
              <Col span={15}>{selectedRows[0].bankCode}</Col>
            </Row>
            <Row>
              <Col span={9}>{this.$t('request.edit.ven.bank.location' /*开户银行所在地*/)}：</Col>
              <Col span={15}>{selectedRows[0].bankOpeningCity}</Col>
            </Row>
          </div>
        ) : (
          '-'
        )}
      </div>
    ) : (
      <div className="new-ven-master">
        {selectedRows[0] ? (
          <Card
            title={this.$t('request.edit.ven.unit.payee') /*收款单位*/}
            extra={card_extra}
            className="account-card"
          >
            <Card.Grid className="card-left">
              {this.$t('request.edit.ven.account.name') /*供应商开户名称*/}
            </Card.Grid>
            <Card.Grid className="card-right">
              <Popover content={payeeInfo.venNickname}>
                <div className="card-right-content">{payeeInfo.venNickname}</div>
              </Popover>
            </Card.Grid>
            <Card.Grid className="card-left">
              {this.$t('request.edit.ven.account' /*供应商收款账号*/)}
            </Card.Grid>
            <Card.Grid className="card-right">
              <Popover content={selectedRows[0].bankName}>
                <div className="card-right-content">{selectedRows[0].bankAccount}</div>
              </Popover>
            </Card.Grid>
            <Card.Grid className="card-left">
              {this.$t('request.detail.loan.account.bank' /*开户银行*/)}
            </Card.Grid>
            <Card.Grid className="card-right">
              <Popover content={selectedRows[0].bankName}>
                <div className="card-right-content">{selectedRows[0].bankName}</div>
              </Popover>
            </Card.Grid>
            <Card.Grid className="card-left">
              {this.$t('request.edit.ven.bank.no' /*开户银行联行号*/)}
            </Card.Grid>
            <Card.Grid className="card-right">
              <Popover content={selectedRows[0].bankCode}>
                <div className="card-right-content">{selectedRows[0].bankCode}</div>
              </Popover>
            </Card.Grid>
            <Card.Grid className="card-left">
              {this.$t('request.edit.ven.bank.location' /*开户银行所在地*/)}
            </Card.Grid>
            <Card.Grid className="card-right">
              <Popover content={selectedRows[0].bankOpeningCity}>
                <div className="card-right-content">{selectedRows[0].bankOpeningCity}</div>
              </Popover>
            </Card.Grid>
          </Card>
        ) : (
          <a onClick={() => this.handlePayeeModalShow(true)}>
            <Icon type="plus-circle-o" className="add-budget-detail-icon" />
            {this.$t('request.edit.ven.add') /*添加*/}
          </a>
        )}
        <Modal
          visible={payeeModalVisible}
          wrapClassName="new-ven-master"
          className="ven-master-modal"
          title={this.$t('request.edit.ven.add.receive.info') /*添加收款人信息*/}
          width={800}
          footer={footer}
          onCancel={this.handleCancel}
        >
          <SearchArea
            searchForm={searchForm}
            submitHandle={this.onSearch}
            clearHandle={this.onSearch}
          />
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={false}
            onRow={record => ({
              onClick: () => record.venType === 1001 && this.onRowClick(record),
            })}
            rowClassName={this.renderClass}
            bordered
            size="middle"
          />
        </Modal>
        <Modal
          visible={accountModalVisible}
          wrapClassName="new-ven-master"
          className="payment-account-modal"
          title={`${this.$t('supplier.management.detail')}:${this.$t(
            'request.edit.ven.please.select.account'
          )}`}
          width={800}
          onCancel={this.handleModalCancel}
          footer={accountFooter}
        >
          <div className="account-name">
            {this.$t('request.edit.ven.account.name') /*供应商开户名称*/}：<h3>
              {chooseInfo.venNickname || payeeInfo.venNickname}
            </h3>
          </div>
          <div className="account-list">
            <Table
              rowKey="id"
              columns={accountColumns}
              dataSource={accountData}
              loading={loading}
              pagination={false}
              rowSelection={rowSelection}
              rowClassName={record => {
                return record.venType === 1002 ? 'row-warning' : 'row-expand-display-none';
              }}
              expandedRowRender={this.renderAllExpandedRow}
              bordered
              size="middle"
            />
          </div>
        </Modal>
        {/* 新增供应商弹窗*/}
        <Modal
          visible={newVendorVisible}
          wrapClassName="new-vendor-modal"
          title={
            chooseInfo.id
              ? `${this.$t('request.edit.ven.new.account')}`
              : `${this.$t('request.edit.ven.new.vendor')}`
          }
          cancelText={this.$t('common.back') /*返回*/}
          width={700}
          onCancel={this.handleCancelNewVendor}
          footer={null}
        >
          <NewVendorForm
            visible={newVendorVisible}
            onCancel={this.handleCancelNewVendor}
            payeeInfo={chooseInfo}
            currentVendor={{}}
            onOk={this.handleNewVendorOk}
          />
        </Modal>
      </div>
    );
  }
}

NewVenMaster.propTypes = {
  value: PropTypes.string,
  onlyShow: PropTypes.bool, //是否用于详情页的展示
};

NewVenMaster.defaultProps = {
  value: '',
  onlyShow: false,
};

function mapStateToProps(state) {
  return {};
}

const wrappedNewVenMaster = Form.create()(NewVenMaster);

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(wrappedNewVenMaster);
