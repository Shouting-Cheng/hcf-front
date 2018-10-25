import { messages } from "utils/utils";
import React from 'react'
import { connect } from 'dva'

import { Table, Button, Badge, message, Popconfirm, Icon, Alert, Col, Row } from 'antd';

import codingRuleService from './coding-rule.service'
import BasicInfo from 'widget/basic-info'
import NewCodingRuleValue from './new-coding-rule-value'
import SlideFrame from "widget/slide-frame";
import { routerRedux } from 'dva/router';

class CodingRuleValue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      loading: true,
      data: [],
      page: 0,
      pageSize: 10,
      columns: [
        { title: messages('code.rule.value.sequence.number')/*顺序号*/, dataIndex: "sequence", width: '15%' },
        { title: messages('code.rule.value.parameter.name')/*参数名称*/, dataIndex: "segmentName", width: '15%' },
        { title: messages('code.rule.value.parameter.values')/*参数值*/, dataIndex: "value", width: '50%' },
        {
          title: messages('code.rule.status')/*状态*/, dataIndex: 'enabled', width: '10%', render: enabled => (
            <Badge status={enabled ? 'success' : 'error'} text={enabled ? messages('common.status.enable') : messages('common.status.disable')} />)
        },
        {
          title: messages('common.operation'), key: 'operation', width: '10%', render: (text, record) => (
            <span>
              <Popconfirm onConfirm={(e) => this.deleteItem(e, record)} title={messages('common.confirm.delete')/*确定要删除吗*/}>
                <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>{messages('common.delete')}</a>
              </Popconfirm>
            </span>)
        },  //操作
      ],
      pagination: {
        total: 0
      },
      updateState: false,
      infoList: [
        { type: 'input', label: messages('code.rule.code')/*编码规则代码*/, id: 'codingRuleCode', disabled: true },
        { type: 'input', label: messages('code.rule.name')/*编码规则名称*/, id: 'codingRuleName', isRequired: true },
        { type: 'value_list', label: messages('code.rule.reset.frequency')/*重置频率*/, id: 'resetFrequence', options: [], valueListCode: 2024 },
        { type: 'input', label: messages('code.rule.remark')/*备注*/, id: 'remark' },
        { type: 'switch', label: messages('code.rule.status')/*状态*/, id: 'enabled' }
      ],
      infoData: {},
      showSlideFrameFlag: false,
      nowCodingRuleValue: null,
      // codingRule: menuRoute.getRouteItem('coding-rule'),
      nowSequence: 1
    };
  }

  deleteItem = (e, record) => {
    this.setState({ loading: true });
    codingRuleService.deleteCodingRuleObject(record.id).then(res => {
      this.getList();
      message.success(messages('common.delete.success', { name: '' }));  //删除成功
    }).catch(e => {
      this.setState({ loading: false });
      message.error(`${e.response.data.message}`)
    })
  };

  componentWillMount() {
    this.getList();
    codingRuleService.getCodingRule(this.props.match.params.ruleId).then(res => {
      res.data.resetFrequence = { label: res.data.resetFrequenceName, value: res.data.resetFrequence };
      this.setState({ infoData: res.data })
    })
  }

  //得到列表数据
  getList() {
    this.setState({ loading: true });
    return codingRuleService.getCodingRuleValueList(this.state.page, this.state.pageSize, this.props.match.params.ruleId).then((response) => {
      response.data.map((item) => {
        item.key = item.id;
        switch (item.segmentType) {
          case '10':
            item.value = item.segmentValue;
            break;
          case '20':
            item.value = item.dateFormat;
            break;
          case '50':
            item.value = `${messages('code.rule.value.digit')/*位数*/}：${item.length}、  ${messages('code.rule.value.step.length')/*步长*/}：${item.incremental}、  ${messages('code.rule.value.start.value')/*开始值*/}：${item.startValue}`;
            break;
          default:
            item.value = '-';
        }
      });
      let nowSequence = 1;
      if (response.data.length > 0)
        nowSequence = response.data[response.data.length - 1].sequence + 1;
      this.setState({
        nowSequence,
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          current: this.state.page + 1
        }
      })
    });
  }

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };

  updateInfo = (params) => {
    this.setState({ editing: true });
    codingRuleService.updateCodingRule(Object.assign({}, this.state.infoData, params)).then(res => {
      codingRuleService.getCodingRule(this.props.match.params.ruleId).then(res => {
        res.data.resetFrequence = { label: res.data.resetFrequenceName, value: res.data.resetFrequence };
        this.setState({ updateState: true, editing: false, infoData: res.data });
        message.success(messages('common.save.success', { name: '' }));  //保存成功
      });
    }).catch((e) => {
      if (e.response) {
        message.error(`${messages('common.save.filed')/*保存失败*/}, ${e.response.data.message}`);
        this.setState({ editing: false });
      }
    })
  };

  handleNew = () => {
    this.setState({
      nowCodingRuleValue: null,
      showSlideFrameFlag: true
    })
  };

  handleRowClick = (record) => {
    this.setState({
      nowCodingRuleValue: record,
      showSlideFrameFlag: true
    })
  };

  afterClose = (params) => {
    params && this.getList();
    this.setState({ showSlideFrameFlag: false, nowCodingRuleValue: null });
  };

  cancel = () => {
    this.props.dispatch(routerRedux.push({
      pathname: "/admin-setting/coding-rule/" + this.props.match.params.id
    }))
  }

  render() {
    const { columns, data, loading, pagination, infoList, infoData, updateState, showSlideFrameFlag, nowCodingRuleValue, editing, nowSequence } = this.state;

    return (
      <div>
        <BasicInfo infoList={infoList}
          infoData={infoData}
          updateState={updateState}
          updateHandle={this.updateInfo}
          loading={editing} />
        <div className="table-header">
          <div className="table-header-title">{messages('common.total', { total: pagination.total ? pagination.total : '0' })}</div> {/* 共total条数据 */}
          <div className="table-header-buttons">
            <Row gutter={20}>
              <Col span={4}><Button type="primary" style={{ height: 39 }} onClick={this.handleNew}>{messages('code.rule.value.new.rules.and.details')/*新建规则明细*/}</Button></Col>
              <Col span={20}><Alert message={messages('code.rule.value.segment.tips')/*段值必须维护序列号，否则编码无法生成。不同规则的日期格式尽量相同。*/} type="info" showIcon /></Col>
            </Row>
          </div>
        </div>
        <Table columns={columns}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onRow={record => ({ onClick: () => this.handleRowClick(record) })}
          rowKey="id"
          bordered
          size="middle" />

        <a className="back" onClick={this.cancel}>
          <Icon type="rollback" style={{ marginRight: '5px' }} />{messages('common.back')/*返回*/}
        </a>

        <SlideFrame
          show={showSlideFrameFlag}
          onClose={this.afterClose}
          title={messages('code.rule.value.add.segment.value')/*添加段值*/} >
          <NewCodingRuleValue close={() => { this.setState({ showSlideFrameFlag: false }) }} params={{ codingRuleId: this.props.match.params.ruleId, nowCodingRuleValue, nowSequence }} />
        </SlideFrame>

      </div >
    )
  }

}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(CodingRuleValue);
