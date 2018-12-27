import React, { Component } from 'react';
import { Button, Modal, Form, Input, message, Tag, Divider } from 'antd';
import service from './service';
import moment from 'moment';
import CustomTable from '../../components/Template/custom-table';
import SearchForm from '../../components/Template/search-form';

class Module extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: [],
      addShow: false,
      record: {},
      formItems: [
        {
          label: '代码',
          dataIndex: 'moduleCode',
          type: 'input',
        },
        {
          label: '名称',
          dataIndex: 'moduleName',
          type: 'input',
        },
      ],
      columns: [
        {
          title: '代码',
          dataIndex: 'moduleCode',
        },
        {
          title: '名称',
          dataIndex: 'moduleName',
        },
        {
          title: '创建日期',
          dataIndex: 'createdDate',
          typeCode: 'date',
          align: 'left',
        },
        {
          title: '状态',
          dataIndex: 'enabled',
          width: 120,
          render: value => (!value ? <Tag color="red">禁用</Tag> : <Tag color="green">启用</Tag>),
        },
        {
          title: '操作',
          dataIndex: 'option',
          align: 'center',
          width: 180,
          render: (value, record) => {
            return (
              <span>
                <a onClick={() => this.edit(record)}>编辑</a>
                <Divider type="vertical" />
                <a onClick={() => this.remove(record)}>{record.enabled ? '禁用' : '启用'}</a>
              </span>
            );
          },
        },
      ],
    };
  }

  componentDidMount() {
    service.getModules().then(res => {
      this.setState({ modules: res.data });
    });
  }

  handleClick = record => {
    this.context.router.push('/main/language-manager/language-setting/' + record.id);
  };

  add = () => {
    this.setState({ addShow: true });
  };

  remove = record => {
    service.disableModule({ ...record, enabled: !record.enabled }).then(res => {
      this.table.reload();
      message.success('操作成功！');
    });
  };

  edit = record => {
    this.setState({ record: { ...record }, addShow: true });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { components } = this.props;

        values = { ...this.state.record, ...values };
        if (!values.id) {
          service.addModule(values).then(res => {
            message.success('保存成功！');
            this.setState({ addShow: false, record: {} });
            this.props.form.resetFields();
            this.table.reload();
          });
        } else {
          service.updateModule(values).then(res => {
            message.success('编辑成功！');
            this.setState({ addShow: false, record: {} });
            this.props.form.resetFields();
            this.table.reload();
          });
        }
      }
    });
  };

  handleCancel = () => {
    // this.props.form.setFieldsValue({ moduleCode: "", moduleName: "" });
    this.setState({ addShow: false, record: {} });
  };

  search = values => {
    this.table.search(values);
  };

  render() {
    const { columns, addShow, formItems, record } = this.state;
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
      <div style={{ backgroundColor: '#fff', padding: 10 }}>
        <SearchForm formItems={formItems} search={this.search} />
        <Button style={{ margin: '10px 0' }} onClick={this.add} type="primary">
          添加模块
        </Button>
        <CustomTable
          ref={ref => (this.table = ref)}
          url="/auth/api/module/query"
          columns={columns}
        />
        <Modal
          title="添加模块"
          visible={addShow}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          destroyOnClose
        >
          <Form>
            <Form.Item {...formItemLayout} label="代码">
              {getFieldDecorator('moduleCode', {
                initialValue: record.moduleCode,
                rules: [{ required: true, message: '请输入' }],
              })(<Input disabled={!!record.id} />)}
            </Form.Item>
            <Form.Item {...formItemLayout} label="名称">
              {getFieldDecorator('moduleName', {
                initialValue: record.moduleName,
                rules: [{ required: true, message: '请输入' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(Module);
