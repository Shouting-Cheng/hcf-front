import React, { Component } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import Table from 'widget/table'
import service from './service';
import moment from 'moment';
import httpFetch from '../../utils/fetch';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';

class LanguageManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      addShow: false,
      url: `/api/frontKey/query/module/lang?lang=${
        this.props.match.params.langType
        }&moduleId=`,
      columns: [
        {
          title: 'key',
          dataIndex: 'keyCode',
        },
        {
          title: '中文',
          dataIndex: 'chinese',
        },
        {
          title: '描述',
          dataIndex: 'descriptions',
          render: (value, record, index) => (
            <Input value={value} onChange={e => this.onChange(e.target.value, index)} />
          ),
        },
      ],
    };
  }

  componentDidMount() {
    this.getList();
  }

  onChange = (value, index) => {
    let dataSource = this.state.dataSource;
    dataSource[index].descriptions = value;
    this.setState({ dataSource });
  };

  add = () => {
    this.setState({ addShow: true });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = {
          ...values,
          moduleId: this.props.match.params.moduleId,
          lang: this.props.match.params.langType,
        };
        service.addLanguage(values).then(res => {
          message.success('保存成功！');
          this.setState({ addShow: false });
          this.props.form.resetFields();
        });
      }
    });
  };

  getList = () => {
    const { moduleId, langType } = this.props.match.params;
    service.getFrontKey(langType, moduleId).then(json => {
      let temp = {};
      json.map(item => {
        temp[item.keyCode] = item;
      });
      service.getFrontKey('zh_cn', moduleId).then(data => {
        let dataSource = [];
        data.map(item => {
          if (temp[item.keyCode]) {
            dataSource.push({
              id: temp[item.keyCode].id,
              keyCode: item.keyCode,
              chinese: item.descriptions,
              descriptions: temp[item.keyCode].descriptions,
            });
          } else {
            dataSource.push({
              keyCode: item.keyCode,
              chinese: item.descriptions,
              descriptions: '',
            });
          }
        });
        this.setState({ dataSource: dataSource });
      });
    });
  };

  save = () => {
    let adds = [];
    let updates = [];
    let dataSource = this.state.dataSource;

    dataSource.map(item => {
      if (item.id) {
        updates.push(item);
      } else {
        item.moduleId = this.props.match.params.moduleId;
        item.lang = this.props.match.params.langType;
        adds.push(item);
      }
    });

    if (adds && adds.length) {
      service.addFrontKeys(adds).then(res => {
        message.success('保存成功！');
        this.getList();
      });
    }
    if (updates && updates.length) {
      service.updateFrontKeys(updates).then(res => {
        message.success('更新成功！');
        this.getList();
      });
    }
  };

  handleCancel = () => {
    this.setState({ addShow: false });
  };

  trans = () => {
    const { moduleId, langType } = this.props.match.params;
    let dataSource = this.state.dataSource;
    let language = [];

    dataSource.map((item, index) => {
      if (!item.descriptions) {
        language.push({ index: index, descriptions: item.chinese });
      }
    });

    if (!language || !language.length) return;

    let params = {
      languages: language.map(item => item.descriptions),
      to: langType,
    };

    httpFetch.post('/api/transfer', params).then(result => {
      result.map((item, index) => {
        let words = String(item.dst).split(' ');

        words = words.map(item => {
          return item[0].toUpperCase() + item.substring(1, item.length);
        });

        dataSource[language[index].index].descriptions = words.join(' ');
      });
      this.setState({ dataSource });
    });
  };

  back = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/setting/language/language-modules/' + this.props.match.params.langType,
      })
    );
  };

  render() {
    const { columns, addShow, dataSource } = this.state;
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
        <div style={{ margin: '10px 0' }}>
          <Button onClick={this.trans} type="primary">
            自动翻译
          </Button>
          <Button style={{ marginLeft: 20 }} onClick={this.save} type="primary">
            保存
          </Button>
          <Button style={{ marginLeft: 20 }} onClick={this.back}>
            返回到模块列表
          </Button>
        </div>
        <Table
          size="middle"
          rowKey="keyCode"
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
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
