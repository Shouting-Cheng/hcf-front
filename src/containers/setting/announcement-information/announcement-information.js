import React from 'react'
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Table, Badge, Popconfirm, message } from 'antd'

import moment from 'moment'
import ListSelector from 'components/Widget/list-selector'
import announcementService from 'containers/setting/announcement-information/announcement-information.service'
import 'styles/setting/announcement-information/announcement-information.scss'

class AnnouncementInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      columns: [
        {title: this.$t("common.sequence"/*序号*/), dataIndex: 'index', width: '6%', render: (value, record, index) =>
          this.state.pageSize * this.state.page + index + 1},
        {title: this.$t("announcement.info.new.date"/*新建日期*/), dataIndex: 'preferredDate', render: value => moment(value).format('YYYY-MM-DD')},
        {title: this.$t("announcement.info.title"/*标题*/), dataIndex: 'title'},
        {title: this.$t("common.column.status"/*状态*/), dataIndex: 'enable', width: '10%', render: enable =>
          <Badge status={enable ? 'success' : 'error'}
                 text={enable ? this.$t("common.status.enable") : this.$t("common.status.disable")} />
        },
        {title: this.$t("common.operation"/*操作*/), dataIndex: 'operation', width: '10%', render: (text, record) => (
          <span>
              <a  onClick={e => this.handleRowClick(record)}>
                {this.$t('common.edit')}
              </a>
            <span className="ant-divider" />
            <Popconfirm onConfirm={e => this.deleteItem(e, record)} title={this.$t("common.confirm.delete")/*确定要删除吗？*/}>
              <a onClick={e => {e.stopPropagation()}}>{this.$t("common.delete"/*删除*/)}</a>
            </Popconfirm>
          </span>
        )},
      ],
      data: [],
      companySelectorShow: false,
      selectedRowKeys: [],
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      selectedRowIDs: [],    //已选择列表项的ID
      selectedCarouselOIDs: [],    //已选择的列表项OID
      extraParams: {},
    }
  }

  componentDidMount() {
    this.getList()
  }

  getList = () => {
    this.setState({ loading: true });
    announcementService.getAnnouncementList().then(res => {
      this.setState({
        loading: false,
        data: res.data,
        pagination: {
          total: Number(res.headers['x-total-count']) || 0,
          current: this.state.page + 1,
          onChange: this.onChangePaper
        }
      })
    })
  };

  onChangePaper = (page) => {
    if (page - 1 !== this.state.page) {
      this.setState({ page: page - 1 }, () => {
        this.getList()
      })
    }
  };

  //删除公告信息
  deleteItem = (e, record) => {
    announcementService.deleteAnnouncement(record.carouselOID).then(res => {
      if (res.status === 200) {
        message.success(this.$t('common.delete.success', {name: ''})); // name删除成功
        this.getList()
      }
    })
  };

  //列表选择更改
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  //选择一行
  //选择逻辑：每一项设置selected属性，如果为true则为选中
  //同时维护selectedEntityOIDs列表，记录已选择的OID，并每次分页、选择的时候根据该列表来刷新选择项
  onSelectRow = (record, selected) => {
    let temp = this.state.selectedRowIDs;
    let temp_oid = this.state.selectedCarouselOIDs;
    if (selected) {
      temp.push(record.id);
      temp_oid.push(record.carouselOID);
    } else {
      temp.delete(record.id);
      temp_oid.delete(record.carouselOID);
    }
    this.setState({
      selectedRowIDs: temp,
      selectedCarouselOIDs: temp_oid
    })
  };

  //全选
  onSelectAllRow = (selected) => {
    let temp = this.state.selectedRowIDs;
    let temp_oid = this.state.selectedCarouselOIDs;
    if (selected) {
      this.state.data.map(item => {
        temp.addIfNotExist(item.id);
        temp_oid.addIfNotExist(item.carouselOID)
      })
    } else {
      this.state.data.map(item => {
        temp.delete(item.id);
        temp_oid.delete(item.carouselOID)
      })
    }
    this.setState({
      selectedRowIDs: temp,
      selectedCarouselOIDs: temp_oid
    })
  };

  //控制是否弹出公司列表
  showCompanySelector = (flag) => {
    const { selectedRowIDs } = this.state;
    this.setState({
      extraParams: selectedRowIDs.length === 1 ? {source: selectedRowIDs[0]} : {source: ''},
      companySelectorShow: flag
    })
  };

  //分配公司
  handleListOk = (result) => {
    let companyList = [];
    result.result.map(item => {
      companyList.push(item.companyOID)
    });
    if (!companyList.length) {
      message.warning(this.$t('announcement.info.please.choose.company'/*请选择公司*/))
    } else {
      announcementService.handleCompanyDistribute(this.state.selectedCarouselOIDs, companyList).then(() => {
        this.setState({
          selectedRowKeys: [],
          selectedRowIDs: [],
          selectedCarouselOIDs: [],
        });
        this.showCompanySelector(false);
        message.success(this.$t('announcement.info.company.distribute.success')/*公司分配成功*/)
      }).catch(e => {
        message.error(`${this.$t('common.operate.filed'/*操作失败*/)}，${e.response.data.message}`)
      })
    }
  };

  //新建公告信息页面
  handleNewAnnouncement = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/announcement-information/new-announcement-information`,
      })
    );
  };

  //公告信息详情页面
  handleRowClick = (record) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/announcement-information/announcement-information-detail/${record.carouselOID}/${record.id}`,
      })
    );
  };

  render() {
    const { loading, data, columns, pagination, selectedRowKeys, companySelectorShow, selectedRowIDs, extraParams } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelect: this.onSelectRow,
      onSelectAll: this.onSelectAllRow
    };
    return (
      <div className="announcement-information">
        <div className="table-header">
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNewAnnouncement}>{this.$t('common.create')/*新建*/}</Button>
            {this.props.tenantMode &&
              <Button type="primary" disabled={!selectedRowIDs.length}
                      onClick={() => this.showCompanySelector(true)}>
                {this.$t('announcement.info.distribute.company'/*分配公司*/)}
              </Button>
            }
          </div>
        </div>
        <Table rowKey="id"
               loading={loading}
               columns={columns}
               dataSource={data}
               pagination={pagination}
               rowSelection={this.props.tenantMode ? rowSelection : null}
               onRow={record => ({})}
               bordered
               size="middle"/>
        <ListSelector type='deploy_company_by_carousel'
                      visible={companySelectorShow}
                      onOk={this.handleListOk}
                      extraParams={extraParams}
                      onCancel={() => this.showCompanySelector(false)}/>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    company: state.user.company,
    tenantMode: true,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(AnnouncementInformation);
