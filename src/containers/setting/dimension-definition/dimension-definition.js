import React, { Component } from 'react';
import { connect } from 'dva';
import SearchArea from 'widget/search-area';
import { Button, Divider, message, Popconfirm, Badge } from 'antd';
import SlideFrame from 'widget/slide-frame';
import CustomTable from 'components/Widget/custom-table';
import config from 'config';
import NewBuilt from './date-setting';
import service from './dimension-definition.service';
import 'styles/setting/params-setting/params-setting.scss';

class Dfinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: [
        {
          type: 'value_list',
          options: [],
          id: 'setOfBooksId',
          placeholder: '请选择',
          label: '账套',
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'dimensionCode',
          placeholder: '请输入',
          label: '维度代码',
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'dimensionName',
          placeholder: '请输入',
          label: '维度名称',
          colSpan: 6,
        },
        {
          type: 'value_list',
          options: [],
          id: 'enabled',
          placeholder: '请选择',
          label: '状态',
          colSpan: 6,
        },
      ],
      columns: [
        {
          title: '序号',
          dataIndex: 'dimensionSequence',
          align: 'center',
        },
        {
          title: '维度代码',
          dataIndex: 'dimensionCode',
          align: 'center',
        },
        {
          title: '维度名称',
          dataIndex: 'dimensionName',
          align: 'center',
        },
        {
          title: '账套',
          dataIndex: 'setOfBooksId',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'enabled',
          align: 'center',
          render: enabled => (
            <Badge status={enabled ? 'success' : 'error'}
              text={enabled ? this.$t("common.status.enable") : this.$t("common.status.disable")} />
          )
        },
        {
          title: '操作',
          dataIndex: 'id',
          align: 'center',
          render: (value, record, index) => {
            return (
              <span>
                <a onClick={() => { this.edit(record) }}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm
                  placement="topLeft"
                  title="确定删除?"
                  onConfirm={() => {
                    this.delete(record.id);
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          },
        },
      ],
      SearchParams: {},
      showSlideFrame: false,
      updateParams: {},
    };
  }

  // 新建维度
  createDimension = () => {
    this.setState({
      updateParams: {},
      showSlideFrame: true
    }, () => {
      this.setState({ showSlideFrame: true })
    });
  };

  // 编辑
  edit = record => {
    this.setState({
      updateParams: JSON.parse(JSON.stringify(record)),
    }, () => {
      this.setState({ showSlideFrame: true })
    });
  };

  // 删除
  delete = id => {
    service
      .deleteParamsSetting(id)
      .then(res => {
        message.success('删除成功');
        this.setState({ page: 0 }, this.getList);
      })
      .catch(err => {
        message.error(err.response.data.message);
      });
  };

  // 搜索
  search = (values) => {
    Object.keys(values).forEach(i => values[i] = values[i] ? values[i] : undefined);
    this.setState({
      searchParams: values
    }, () => {
      this.table.search(this.state.searchParams)
    })
  };

  //清除
  clear = () => {
    this.setState({ searchParams: {} })
  }

  handleCloseSlide = () => {
    this.setState({
      showSlideFrame: false
    }, () => {
      this.table.search(this.state.searchParams)
    })
  }

  render() {
    const { searchForm, columns, updateParams, showSlideFrame } = this.state;
    return (
      <div>
        <SearchArea searchForm={searchForm} submitHandle={this.search} clearHandle={this.clear} />
        <Button
          style={{ margin: '20px 0' }}
          className="create-btn"
          type="primary"
          onClick={this.createDimension}
        >
          新 建
        </Button>
        <CustomTable
          columns={columns}
          url={`${config.authUrl}/api/data/auth/table/properties/query`}
          ref={ref => (this.table = ref)}
        />
        <SlideFrame
          title={JSON.stringify(updateParams) === "{}" ? '编辑维度' : '新建维度'}
          show={showSlideFrame}
          onClose={() => this.setState({ showSlideFrame: false })}
        >
          <NewBuilt params={{ ...updateParams }} close={this.handleCloseSlide} />
        </SlideFrame>
      </div>
    );
  }
}

export default connect()(Dfinition);
