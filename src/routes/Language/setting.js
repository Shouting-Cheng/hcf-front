import React, { Component } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import service from './service';
import CustomTable from '../../components/Template/custom-table';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class LanguageManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: [],
      addShow: false,
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
          render: value => {
            return <a onClick={() => this.delete(value)}>删除</a>;
          },
        },
      ],
    };
  }

  add = () => {
    this.setState({ addShow: true });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = { ...values, moduleId: this.props.match.params.moduleId, lang: 'zh_CN' };
        service.addLanguage(values).then(res => {
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
        pathname: '/setting/language/language-modules/zh_CN',
      })
    );
  };

  delete = id => {
    service.delete(id).then(res => {
      message.success('删除成功！');
      this.refs.table.reload();
    });
  };

  render() {
    const { columns, addShow } = this.state;
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
        <Button style={{ margin: '10px 0' }} onClick={this.add} type="primary">
          添加
        </Button>
        <Button style={{ margin: '10px 0', marginLeft: 20 }} onClick={this.back}>
          返回到模块列表
        </Button>
        <CustomTable
          ref="table"
          url={`/auth/api/frontKey/query/module/lang?lang=zh_CN&moduleId=` + moduleId}
          columns={columns}
        />
        <Modal
          title="添加语言"
          visible={addShow}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
        >
          <Form>
            <Form.Item {...formItemLayout} label="key">
              {getFieldDecorator('keyCode')(<Input />)}
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
