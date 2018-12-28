import React, { Component } from "react"
import CustomTable from "widget/custom-table"
import SearchArea from "widget/search-area"
import SlideFrame from "widget/slide-frame"
import NewApplicationType from "./new"

import config from "config"
import { connect } from "dva"
import { Badge, Button, Divider } from "antd"
import baseService from 'share/base.service'

import { routerRedux } from "dva/router"

class ApplicationType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [{
        title: "帐套",
        dataIndex: "setOfBooksName"
      }, {
        title: "费用申请单类型代码",
        dataIndex: "typeCode"
      }, {
        title: "费用申请单类型名称",
        dataIndex: "typeName"
      }, {
        title: "关联表单类型",
        dataIndex: "formName"
      }, {
        title: "状态",
        dataIndex: "enabled",
        width: 120,
        render: value => value ? <Badge status="success" text="启用" /> : <Badge status="error" text="禁用" />
      },
      {
        title: "维度",
        dataIndex: "id",
        width: 120,
        align: "center",
        render: value => <a onClick={() => this.dimensionSetting(value)}>维度设置</a>
      },
      {
        title: "操作",
        dataIndex: "options",
        width: 150,
        align: "center",
        render: (value, record) =>
          (<span>
            <a onClick={() => this.edit(record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.distributionCompany(record)}>公司分配</a>
          </span>)
      }],
      searchForm: [
        {
          type: 'select', colSpan: '6', id: 'setOfBooksId', label: this.$t({ id: 'pre.payment.setOfBookName' }/*账套*/), options: [],
          labelKey: 'name', valueKey: 'id', isRequired: true, event: "setOfBooksId", allowClear: false,
          defaultValue: props.match.params.setOfBooksId == "0" ? props.company.setOfBooksId : props.match.params.setOfBooksId
        },
        {
          type: 'input', colSpan: '6', id: 'typeCode', label: "申请单类型代码"
        },
        {
          type: 'input', colSpan: '6', id: 'typeName', label: "申请单类型名称"
        },
        {
          type: 'select', colSpan: '6', id: 'enabled', label: "状态", options: [{ label: "启用", value: 1 }, { label: "禁用", value: 0 }],
          labelKey: 'label', valueKey: 'value', event: "enabled"
        }
      ],
      setOfBooksId: props.match.params.setOfBooksId == "0" ? props.company.setOfBooksId : props.match.params.setOfBooksId,
      searchParams: {},
      visible: false,
      record: {}
    }
  }

  componentDidMount() {
    this.getSetOfBookList();
  }

  //获取账套列表
  getSetOfBookList = () => {
    baseService.getSetOfBooksByTenant().then(res => {
      let list = [];
      res.data.map(item => {
        list.push({ value: item.id, label: `${item.setOfBooksCode}-${item.setOfBooksName}` });
      });
      let form = this.state.searchForm;
      form[0].options = list;
      form[0].defaultValue = this.props.match.params.setOfBooksId == "0" ? this.props.company.setOfBooksId : this.props.match.params.setOfBooksId;
      this.setState({ searchForm: form, setOfBooksId: form[0].defaultValue });
    });
  }

  search = (values) => {
    this.setState({ searchParams: values }, () => {
      this.table.search(values);
    })
  }

  clear = () => {
    this.setState({
      setOfBooksId: this.props.company.setOfBooksId,
      searchParams: {}
    }, () => {
      this.table.reload();
    })
  }

  formChange = (event, value) => {
    if (event == "setOfBooksId") {
      this.setState({ setOfBooksId: value, searchParams: { ...this.state.searchParams, setOfBooksId: value } }, () => {
        this.table.search(this.state.searchParams);
      });
    } else if (event == "enabled") {
      this.setState({ searchParams: { ...this.state.searchParams, enabled: value } }, () => {
        this.table.search(this.state.searchParams);
      });
    }
  }

  //新建
  add = () => {
    this.setState({ visible: true });
  }

  //维度设置
  dimensionSetting = (id) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/document-type-manage/application-type/dimension-setting/' + id
    }))
  }

  //编辑
  edit = (record) => {
    this.setState({ visible: true, record: { ...record } });
  }

  //分配公司
  distributionCompany = (record) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/document-type-manage/application-type/distribution-company/' + record.id
    }))
  }

  //侧拉框关闭
  close = (flag) => {
    this.setState({ visible: false, record: {} }, () => {
      if (flag) {
        this.table.search(this.state.searchParams);
      }
    })
  }

  render() {
    let { columns, searchForm, visible, record, setOfBooksId } = this.state;
    return (
      <div>
        <SearchArea submitHandle={this.search} searchForm={searchForm} clearHandle={this.clear} eventHandle={this.formChange} />
        <div style={{ margin: "20px 0" }}>
          <Button onClick={this.add} type="primary">新 建</Button>
        </div>
        <CustomTable
          ref={ref => this.table = ref}
          columns={columns}
          url={`${config.expenseUrl}/api/expense/application/type/query`}
          params={{ setOfBooksId: setOfBooksId }}
          size="middle"
        />
        <SlideFrame title={record.id ? "编辑" : "新建"} show={visible} onClose={() => { this.setState({ visible: false, record: {} }) }} >
          <NewApplicationType setOfBooks={searchForm[0].options} close={this.close} params={{ id: record.id, setOfBooksId: setOfBooksId }}></NewApplicationType>
        </SlideFrame>
      </div>
    )
  }
}

export default connect(state => ({ company: state.user.company }))(ApplicationType)