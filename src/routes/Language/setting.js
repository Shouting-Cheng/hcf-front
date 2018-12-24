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
      record: {},
      searchForm: [
        {
          type: 'input',
          id: 'key',
          label: 'key',
          colSpan: 6,
        },
        {
          type: 'input',
          id: 'descriptions',
          label: this.$t('chooser.data.description'),
          colSpan: 6,
        },
      ],
      columns: [
        {
          title: 'key',
          dataIndex: 'keyCode',
        },
        {
          title: '描述',
          dataIndex: 'descriptions',
        },
        {
          title: '操作',
          dataIndex: 'id',
          width: 100,
          render: (value, record) => {
            return (
              <span>
                <a onClick={() => this.edit(record)}>编辑</a>
                <span className="ant-divider" />
                <a onClick={() => this.delete(value)}>删除</a>
              </span>
            )
          },
        },
      ],
    };
  }

  add = () => {
    this.setState({ addShow: true, record: {} });
  };

  edit = (value) => {
    this.props.form.setFieldsValue({
      keyCode: value.keyCode,
      descriptions: value.descriptions
    })
    this.setState({ addShow: true, record: value });
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {

        if (this.state.record.id) {
          values = { ...this.state.record, ...values, moduleId: this.props.match.params.moduleId, lang: 'zh_cn' };
          service.edit(values).then(res => {
            message.success('保存成功！');
            this.setState({ addShow: false });
            this.props.form.resetFields();
            this.refs.table.reload();
          });
        } else {
          values = { ...values, moduleId: this.props.match.params.moduleId, lang: 'zh_cn' };
          service.addLanguage(values).then(res => {
            message.success('保存成功！');
            this.setState({ addShow: false });
            this.props.form.resetFields();
            this.refs.table.reload();
          });
        }

      }
    });
  };

  handleCancel = () => {
    this.setState({ addShow: false });
    this.props.form.resetFields();
  };

  back = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/setting/language/language-modules/zh_cn',
      })
    );
  };

  delete = id => {
    service.delete(id).then(res => {
      message.success('删除成功！');
      this.refs.table.reload();
    });
  };

  search = (values)=>{
    this.refs.table.search(values);
  };

  render() {
    const { columns, addShow, record, searchForm } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { moduleId, langType } = this.props.match.params;

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
        <Button style={{ margin: '10px 0' }} onClick={this.add} type="primary">
          添加
        </Button>
        <Button style={{ margin: '10px 0', marginLeft: 20 }} onClick={this.back}>
          返回到模块列表
        </Button>
        <CustomTable
          ref="table"
          url={`/auth/api/frontKey/query/module/lang?lang=zh_cn&moduleId=` + moduleId}
          columns={columns}
        />
        <Modal
          title="添加/编辑语言"
          visible={addShow}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
        >
          <Form>
            <Form.Item {...formItemLayout} label="key">
              {getFieldDecorator('keyCode')(<Input disabled={!!record.id} />)}
            </Form.Item>
            <Form.Item {...formItemLayout} label="描述">
              {getFieldDecorator('descriptions')(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default connect()(Form.create()(LanguageManager));
