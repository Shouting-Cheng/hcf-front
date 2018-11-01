import React from 'react'
import { connect } from 'dva'

import httpFetch from 'share/httpFetch';
import config from 'config'
import SearchArea from 'components/Widget/search-area.js';
import SlideFrame from 'components/Widget/slide-frame'
import BasicInfo from 'components/Widget/basic-info'
import { Form, Button, Select, Row, Col, Input, Switch, Popover, Icon, Badge, Tabs, Table, message } from 'antd'
import classNames from 'classnames';
import SubjectSheetDetailMaintain from 'containers/setting/subject-sheet/subject-sheet-detail-maintain'
import SubSubjectMaintain from 'containers/setting/subject-sheet/sub-subject-maintain'

import { routerRedux } from 'dva/router';

const FormItem = Form.Item;
const Search = Input.Search;
const Option = Select.Option;

/**
 * 科目表详情
 */
class SubjectSheetDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      updateState: false,
      pagination: {
        total: 0,
        page: 0,
        pageSize: 10,
        current: 1,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      value: '',
      focus: false,
      infoData: {},
      tableData: [],
      params: {},
      updateParams: {},
      subParams: {},//子科目的参数
      showSlideFrameNew: false,// 新增/编辑
      showSlideFrameSub: false,// 子科目
      showSlideFrameFromTo: false,
      showSlideFrameTitle: '',
      accountSetId: '',
      accountTypeOptions: [], //科目类型
      //   subjectDefine: menuRoute.getRouteItem('subject-sheet', 'key'),//返回到科目表定义
      searchParams: {
        info: '',
        accountType: ''
      },
      searchForm: [
        { type: 'input', id: 'accountSetCode', disabled: true, label: this.$t({ id: 'subject.sheet.code' }) },
        { type: 'input', id: 'accountSetDesc', disabled: false, label: this.$t({ id: 'subject.sheet.describe' }) },
        {
          type: 'switch', id: 'enabled', label: this.$t({ id: 'common.column.status' }),
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? this.$t({ id: 'common.enabled' }) : this.$t({ id: 'common.disabled' })} />)
        },
      ],
      columns: [
        {
          title: this.$t({ id: 'subject.code' }),
          key: 'accountCode',
          dataIndex: 'accountCode',
          width: '10%',
          "align": "center",
        },
        {
          title: this.$t({ id: 'subject.name' }),
          key: 'accountDesc',
          dataIndex: 'accountDesc',
          width: '10%',
          "align": "center",
          render: accountDesc => (
            <Popover content={accountDesc}>
              {accountDesc}
            </Popover>)
        },
        {
          title: this.$t({ id: 'subject.balance.direction' }),
          key: 'balanceDirectionName',
          dataIndex: 'balanceDirectionName',
          width: '10%',
          "align": "center",
        },
        {
          title: this.$t({ id: 'subject.type' }),
          key: 'accountTypeName',
          dataIndex: 'accountTypeName',
          width: '10%',
          "align": "center",
        },
        {
          title: this.$t({ id: 'subject.report.type' }),
          key: 'reportTypeName',
          dataIndex: 'reportTypeName',
          width: '10%',
          "align": "center",
        },
        {
          title: this.$t({ id: 'subject.summary.flag' }),
          key: 'summaryFlag',
          dataIndex: 'summaryFlag',
          width: '10%',
          "align": "center",
          render: summaryFlag => (
            <Badge status={summaryFlag ? 'success' : 'error'}
              text={summaryFlag ? this.$t({ id: 'common.yes' }) : this.$t({ id: 'common.no' })} />
          )
        },
        {
          title: this.$t({ id: 'common.column.status' }),
          key: 'enabled',
          dataIndex: 'enabled',
          width: '6%',
          "align": "center",
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? this.$t({ id: 'common.status.enable' }) : this.$t({ id: 'common.status.disable' })} />
          )
        },
        {
          title: this.$t({ id: 'common.operation' })/*操作*/, dataIndex: 'operation', width: '10%', key: 'id', "align": "center",
          render: (text, record) => {
            if (record.summaryFlag) {
              return (<div>
                <span>
                  <a onClick={(e) => this.editItem(record)}>{this.$t({ id: 'common.edit' })/*编辑*/}</a>
                  <span className="ant-divider" />
                  <a style={{ marginRight: 10 }} onClick={(e) => this.subSubjectItem(record.id, this.props.match.params.accountSetId)}>{this.$t({ id: 'subject.sub.subject' })/*子科目*/}</a>
                </span>
              </div>)
            } else {
              return (<div>
                <a onClick={(e) => this.editItem(record)}>{this.$t({ id: 'common.edit' })/*编辑*/}</a>
              </div>)
            }
          }
        }
      ],
    }
  }

  //初始化加载
  componentWillMount() {
    //根据科目表ID，取科目表信息
    httpFetch.get(`${config.baseUrl}/api/account/set/${this.props.match.params.accountSetId}`).then(res => {
      this.setState({ infoData: res.data });
    });
    //获取科目明细列表数据
    this.getList();
  };

  //获取 科目类型的值列表
  clickAccountTypeSelect = () => {
    //console.log("clickAccountTypeSelect:" + this.state.accountTypeOptions);
    //如果已经有值，则不再查询
    if (this.state.accountTypeOptions != '' && this.state.accountTypeOptions != undefined) {
      return;
    }
    this.getSystemValueList(2205).then(res => { //科目类型
      let accountTypeOptions = res.data.values || [];
      this.setState({ accountTypeOptions })
    });
  };

  //获取科目明细列表数据
  getList() {
    this.setState({ loading: true });
    let url = `${config.baseUrl}/api/accounts/query?accountSetId=${this.props.match.params.accountSetId}&info=${this.state.searchParams.info}&accountType=${this.state.searchParams.accountType}&size=${this.state.pagination.pageSize}&page=${this.state.pagination.page}`;
    return httpFetch.get(url).then((response) => {
      response.data.map((item, index) => {
        item.index = this.state.pagination.page * this.state.pagination.pageSize + index + 1;
        item.key = item.id;
      });
      this.setState({
        tableData: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
        },
      })
    }).catch((e) => {

    });
  }

  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      pagination: temp
    }, () => {
      this.getList();
    })
  };

  //点击搜索
  searchAccountDetailList = (values) => {
    if (values === undefined) {
      values = '';
    }
    let searchParams = {
      ...this.state.searchParams,
      info: values
    };
    this.setState({
      searchParams: searchParams,
      loading: true
    }, () => {
      this.getList();
    })
  };

  //表格上的子科目
  subSubjectItem = (recordId, accountSetId) => {
    this.setState({
      showSlideFrameSub: true,
      subParams: { record: { accountId: recordId, accountSetId: accountSetId } },
    })
  };

  //表格上的编辑
  editItem = (record) => {
    this.showSlideNew(true, record, this.state.accountTypeOptions, false)
  };
  //点击新建
  handleCreate = () => {
    let record = { accountSetId: this.props.match.params.accountSetId };
    this.showSlideNew(true, record, this.state.accountTypeOptions, true);
  }
  //设置侧拉
  showSlideNew = (flag, record, accountTypeOptions, isNew) => {
    this.setState({
      showSlideFrameNew: flag,
      updateParams: { record: record, accountTypeOptions, isNew },
      showSlideFrameTitle: isNew ? this.$t({ id: "subject.sheet.new.subject" })/*新建科目*/ : this.$t({ id: "subject.sheet.edit.subject" })/*编辑科目*/
    })
  };

  //侧拉关闭
  afterClose = (props) => {
    // 侧拉框的保存 this.props.close(true);//会调用
    if (props) {
      //刷新
      this.setState({ showSlideFrameNew: false, showSlideFrameSub: false }, () => {
        this.getList()
      });
    } else {
      //取消 不刷新
      this.setState({ showSlideFrameNew: false, showSlideFrameSub: false });
    }
  }
  //头编辑时点保存
  headerUpdateHandle = (values) => {
    //e.preventDefault();
    this.setState({ loading: true });
    let toValue = {
      ...this.props.match.params,
      ...values,//如果与this.props.params有冲突，则以values里的值为准
      id: this.props.match.params.accountSetId
    }
    httpFetch.put(`${config.baseUrl}/api/account/set`, toValue).then((res) => {
      this.setState({
        infoData: res.data,
        loading: false,
        updateState: true
      }, () => {
        message.success(this.$t({ id: "wait.for.save.modifySuccess" })/*编辑成功*/);
      });
    }).catch((e) => {
      this.setState({ loading: false });
      message.error(this.$t({ id: 'common.save.filed' }) + `${e.response.data.message}`);
    })
  };

  // 查询条件 科目类型发生改变时，给state里赋值
  accountTypeChange = (values) => {
    //当为all时，表示查询时不受该字段限制
    if (values === "all") {
      values = "";
    }
    let searchParams = {
      accountType: values,
    };
    this.setState({
      searchParams: searchParams,
    });
  }

  render() {
    const { loading, infoData, searchForm, accountTypeOptions, showSlideFrameNew, showSlideFrameSub, subParams, tableData, updateState, pagination, columns, updateParams } = this.state;
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    });
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    });
    return (
      <div className="budget-journal">
        <BasicInfo infoList={searchForm} ref="subject_ref" infoData={infoData} loading={loading}
          updateState={updateState}
          updateHandle={this.headerUpdateHandle} />

        <div className="table-header">
          <div className="table-header-title">
            <h2>{this.$t({ id: "subject.sheet.detail" })/*科目明细*/}</h2>
          </div>
          <div className="table-header-buttons">
            <Row>
              <Col span="2">
                <Button type="primary"
                  onClick={this.handleCreate}>{this.$t({ id: 'common.create' })}
                </Button>
              </Col>
              <Col span='15'>
              </Col>
              <Col span="3">
                <Select defaultValue="all" style={{ width: 136 }} onChange={this.accountTypeChange} onFocus={this.clickAccountTypeSelect}>
                  <Option key='all'>{this.$t({ id: 'common.all' })}</Option>
                  {accountTypeOptions.map(option => {
                    return <Option key={option.value}>{option.messageKey}</Option>
                  })}
                </Select>
              </Col>
              <Col span="4">
                <Search
                  placeholder={this.$t({ id: 'subject.search.code.name' })}
                  onSearch={this.searchAccountDetailList}
                  enterButton={this.$t({ id: 'common.search' })}
                />
              </Col>
            </Row>
          </div>
          <Table rowKey={record => record.id}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={loading}
            onChange={this.onChangePager}
            bordered
            /*onRowClick={this.editItem}*/
            size="middle" />
          <div style={{ fontSize: 14, margin: '20px 0', }}>
            <a onClick={() => {
              // this.context.router.push(subjectDefine.url)
              this.props.dispatch(
                routerRedux.push({
                  pathname: `/admin-setting/subject-sheet`,
                })
              )
            }}
            ><Icon type="rollback" />{this.$t({ id: "common.back" })/*返回*/}</a>
          </div>

          {/* 科目明细 */}
          {/* <SlideFrame title={this.state.showSlideFrameTitle}
            show={showSlideFrameNew}
            content={SubjectSheetDetailMaintain}
            afterClose={this.afterClose}// 取消和确定的时候执行
            onClose={() => { this.setState({ showSlideFrameNew: false }) }}// 点击 侧拉之外的地方时触发
            params={{...updateParams, visible: showSlideFrameNew}} /> */}

          <SlideFrame
            title={this.state.showSlideFrameTitle}
            show={showSlideFrameNew}
            onClose={() => this.setState({ showSlideFrameNew: false })} >
            <SubjectSheetDetailMaintain
              close={this.afterClose}// 取消和确定的时候执行
              params={{
                ...updateParams,
                visible: showSlideFrameNew
              }
              } />
          </SlideFrame>

          {/* 子科目 */}
          {/* <SlideFrame title={this.$t({id:'subject.sub.subject'})}
            show={showSlideFrameSub}
            content={SubSubjectMaintain}
            afterClose={this.afterClose}// 取消和确定的时候执行
            onClose={() => { this.setState({ showSlideFrameSub: false, showSlideFrameFromTo: false }) }}// 点击 侧拉之外的地方时触发
            params={subParams} /> */}

          <SlideFrame
            title={this.$t({ id: 'subject.sub.subject' })}
            show={showSlideFrameSub}
            onClose={() => this.setState({ showSlideFrameSub: false, showSlideFrameFromTo: false })} >
            <SubSubjectMaintain
              close={this.afterClose}// 取消和确定的时候执行
              params={{
                subParams
              }
              } />
          </SlideFrame>
        </div>
      </div>
    );
  }
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SubjectSheetDetail);
