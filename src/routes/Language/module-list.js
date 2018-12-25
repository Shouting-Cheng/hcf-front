import React, { Component } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import service from './service';
import CustomTable from '../../components/Template/custom-table';
import SearchArea from 'widget/search-area';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class LanguageManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: [],
      addShow: false,
      searchForm: [
        {
          type: 'input',
          id: 'moduleCode',
          label: this.$t('currency.setting.code'),
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'moduleName',
          label: this.$t('configuration.detail.name'),
          colSpan: 6,
        },
      ],
      columns: [
        {
          title: '代码',
          dataIndex: 'moduleCode',
          render: value => <a>{value}</a>,
        },
        {
          title: '名称',
          dataIndex: 'moduleName',
        },
        {
          title: '创建日期',
          dataIndex: 'createdDate',
          type: 'date',
        },
      ],
    };
  }

  handleClick = record => {
    if (this.props.match.params.langType == 'zh_cn') {
      this.props.dispatch(
        routerRedux.push({
          pathname: '/setting/language/language-setting/' + record.id,
        })
      );
    } else {
      this.props.dispatch(
        routerRedux.push({
          pathname:
            '/setting/language/other-language-setting/' +
            this.props.match.params.langType +
            '/' +
            record.id,
        })
      );
    }

    // this.context.router.push("/main/language-manager/language-setting/" + record.id);
  };

  add = () => {
    this.setState({ addShow: true });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { components } = this.props;

        service.addModule(values).then(res => {
          message.success('保存成功！');
          this.setState({ addShow: false });
          this.props.form.resetFields();
          this.refs.table.reload();
        });
      }
    });
  };

  handleCancel = () => {
    this.setState({ addShow: false });
  };

  back = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/setting/language',
      })
    );
  };

  search = (values)=>{
    this.refs.table.search(values);
  };

  render() {
    const { columns, addShow, searchForm } = this.state;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
    };

    return (
      <div style={{ backgroundColor: '#fff', padding: 10, overflow: 'auto' }}>
        <SearchArea
          searchForm={searchForm}
          maxLength={4}
          clearHandle={()=>{}}
          submitHandle={this.search}
        />

        <Button style={{ margin: '10px 0' }} onClick={this.back}>
          返回上一级
        </Button>
        <CustomTable
          ref="table"
          url="/auth/api/module/query"
          columns={columns}
          onRowClick={this.handleClick}
        />
      </div>
    );
  }
}

export default connect()(Form.create()(LanguageManager));
