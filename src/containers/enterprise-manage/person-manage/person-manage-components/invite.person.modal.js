/**
 * Created by zhouli on 18/3/28
 * Email li.zhou@huilianyi.com
 * 未激活的人邀请的弹窗
 */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Modal, Input, Icon, Button, Table, message, Popover } from 'antd';
import PMService from 'containers/enterprise-manage/person-manage/person-manage.service';
import 'styles/enterprise-manage/person-manage/person-manage-components/invite.person.modal.scss';

class InvitePersonModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inviteModel: false,
      loading: true,
      invating: false,
      params: {
        keyword: '',
        departmentOIDs: '',
        corporationOIDs: '',
        status: 'all',
      },
      //条件下，没有激活的人
      paginationNoActived: {
        page: 0,
        total: 0,
        pageSize: 10,
      },
      dataNoActived: [], //条件下，没有激活的人
      selectedRowKeys: [], ///已选择的列表项的key，这个用来记住翻页的
      selectedUserOIDs: [], //已选择的列表项的OIDs
      columnsNoActived: [
        {
          title: this.$t('invite.person.companyName'), //公司
          key: 'companyName',
          dataIndex: 'companyName',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          title: this.$t('invite.person.employeeID'), //工号
          key: 'employeeID',
          dataIndex: 'employeeID',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          title: this.$t('invite.person.name'), //姓名
          key: 'fullName',
          dataIndex: 'fullName',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          title: this.$t('invite.person.dep.'), //部门
          key: 'departmentName',
          dataIndex: 'departmentName',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
        {
          title: this.$t('invite.person.contact'), //联系方式
          key: 'mobile',
          dataIndex: 'mobile',
          render: text => (
            <span>
              {text ? (
                <Popover placement="topLeft" content={text}>
                  {text}
                </Popover>
              ) : (
                '-'
              )}
            </span>
          ),
        },
      ],
    };
  }

  componentDidMount() {
    // 组件一旦写上就加载数据了
    // this.getTenantAllDep();
    this.setState(
      {
        params: this.props.params,
      },
      () => {
        this.getPersonListNoActived();
      }
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        params: nextProps.params,
      },
      () => {
        this.getPersonListNoActived();
      }
    );
  }

  //获取未激活的员工表格
  getPersonListNoActived = () => {
    this.setState({
      loading: true,
    });
    let params = {
      sort: 'status',
      page: this.state.paginationNoActived.page,
      size: this.state.paginationNoActived.pageSize,
      keyword: this.state.params.keyword,
      departmentOID: this.state.params.departmentOIDs,
      corporationOID: this.state.params.corporationOIDs,
      status: this.state.params.status || 'all',
      isInactiveSearch: true,
    };
    PMService.searchPersonInDep(params).then(response => {
      this.setState(
        {
          loading: false,
          dataNoActived: response.data,
          paginationNoActived: {
            page: this.state.paginationNoActived.page,
            pageSize: this.state.paginationNoActived.pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            total: Number(response.headers['x-total-count']),
          },
        },
        () => {
          this.refreshRowSelection();
        }
      );
    });
  };
  //分页点击
  onChangePagerNoActived = (pagination, filters, sorter) => {
    this.setState(
      {
        paginationNoActived: {
          page: pagination.current - 1,
          pageSize: pagination.pageSize,
        },
      },
      () => {
        this.getPersonListNoActived();
      }
    );
  };

  //要求使用的弹窗--start
  showInvite = () => {
    this.setState({
      inviteModel: true,
    });
  };
  hideInvite = () => {
    this.setState({
      inviteModel: false,
    });
  };
  //点击确定邀请
  confirmInvite = () => {
    this.setState({
      invating: true,
    });
    let selectedUserOIDs = this.state.selectedUserOIDs;
    let selectedRowKeys = this.state.selectedRowKeys;
    if (selectedUserOIDs.length > 0) {
      PMService.inviteUser(selectedUserOIDs).then(res => {
        // 邀请成功
        message.success(this.$t('invite.person.invite.success'));
        this.clearRowSelection();
        this.setState({
          inviteModel: false,
          invating: false,
        });
      });
    } else {
      // 请选择要邀请的员工
      message.warn(this.$t('invite.person.please.select'));
    }
  };
  //列表选择更改
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  onSelectRow = (record, selected) => {
    let temp = this.state.selectedUserOIDs;
    if (selected) {
      temp.push(record.userOID);
    } else {
      temp.delete(record.userOID);
    }
    this.setState(
      {
        selectedUserOIDs: temp,
      },
      () => {}
    );
  };

  //全选
  onSelectAllRow = selected => {
    let temp = this.state.selectedUserOIDs;
    if (selected) {
      this.state.dataNoActived.map(item => {
        temp.addIfNotExist(item.userOID);
      });
    } else {
      this.state.dataNoActived.map(item => {
        temp.delete(item.userOID);
      });
    }
    this.setState(
      {
        selectedUserOIDs: temp,
      },
      () => {}
    );
  };

  //换页后根据OIDs刷新选择框
  refreshRowSelection() {
    let selectedRowKeys = [];
    this.state.selectedUserOIDs.map(selectedUserOID => {
      this.state.dataNoActived.map((item, index) => {
        if (item.userOID === selectedUserOID) selectedRowKeys.push(index);
      });
    });
    this.setState({ selectedRowKeys });
  }

  //清空选择框
  clearRowSelection() {
    this.setState({ selectedUserOIDs: [], selectedRowKeys: [] });
  }

  //要求使用的弹窗--end
  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow,
    };
    return (
      <div className="invite-person-modal-wrap">
        <div className="person-manage-table-icon-tips">
          <div className="tips-text">
            <Icon type="info-circle" className="info-circle" />
            <span>
              {/*当前搜索条件下，有*/}
              {this.$t('invite.person.tips2')}
              {this.state.paginationNoActived.total}
              {/*人尚未激活*/}
              {this.$t('invite.person.tips1')}
            </span>
            <span className="tips-inner-btn" onClick={this.showInvite}>
              {/*邀请使用*/}
              {this.$t('invite.person.invite.use')}
            </span>
          </div>
        </div>
        <Modal
          closable
          width={800}
          className="pm-invite-person-modal"
          title={this.$t('invite.person.invite.use.sms')} //短信邀请使用
          visible={this.state.inviteModel}
          footer={null}
          onCancel={this.hideInvite}
          destroyOnClose={true}
        >
          <div>
            <Table
              loading={this.state.loading}
              dataSource={this.state.dataNoActived}
              columns={this.state.columnsNoActived}
              pagination={this.state.paginationNoActived}
              rowSelection={rowSelection}
              onChange={this.onChangePagerNoActived}
              size="middle"
              bordered
            />
            <div className="no-actived-footer">
              <Button className="cancel" onClick={this.hideInvite}>
                {this.$t('common.cancel')}
              </Button>
              <Button type="primary" loading={this.state.invating} onClick={this.confirmInvite}>
                {this.$t('common.ok')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

InvitePersonModal.propTypes = {
  params: PropTypes.any.isRequired, //请求没激活的人的条件参数
};

InvitePersonModal.defaultProps = {};

function mapStateToProps(state) {
  return {
    // profile: state.login.profile,
    user: state.user.currentUser,
    tenantMode: true,
    company: state.user.company,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(InvitePersonModal);
