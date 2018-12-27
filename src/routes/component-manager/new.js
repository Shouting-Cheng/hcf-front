import React from 'react';
import { Modal, Form, TreeSelect, Input, Select, message } from 'antd';
import fetch from '../../utils/fetch';
import { messages } from '../../utils/utils';
import { connect } from 'dva';

@connect(({ components }) => ({
  components,
}))

class NewComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menus: [],
    };
  }

  componentDidMount() {
    fetch.get('/auth/api/menu/query').then(response => {
      let result = response || [];
      let group = {};

      result.map(item => {
        if (group[item.parentMenuId]) {
          group[String(item.parentMenuId)].push(item);
        } else {
          group[String(item.parentMenuId)] = [item];
        }
      });

      result = result.filter(o => o.parentMenuId == 0);

      this.getChildren(group, result, 1);

      this.setState({ menus: result });
    });
  }

  getChildren = (group, result, level) => {
    result.map(item => {
      item.children = group[item.id];
      item.level = level;
      item.title = messages(item.menuName);
      item.value = item.id;
      item.key = item.id;
      item.disabled = !!item.hasChildCatalog;
      this.getChildren(group, item.children || [], level + 1);
    });
  };

  handleSubmit = () => {
    const {
      components: { version },
    } = this.props;
    this.props.form.validateFields((error, values) => {
      if (!error) {
        let buttonList = [];

        this.props.components.components.map(item => {
          if (item.type == 'button' && item.code) {
            buttonList.push({
              buttonCode: item.code,
              buttonName: item.text,
              flag: 1001,
            });
          }
        });

        if (version.componentId && version.status == 'edit') {
          fetch
            .put('/auth/api/component/update', {
              ...version,
              ...values,
              id: version.componentId,
              buttonList: buttonList,
              versionNumber: version.componentVersionNumber
            })
            .then(res => {
              let content = JSON.stringify(this.props.components.components);
              fetch
                .post('/auth/api/componentVersion/create', {
                  componentId: version.componentId,
                  remark: values.remark,
                  contents: content,
                })
                .then(() => {
                  message.success('保存成功！');
                  this.handleCancel();
                });
            });
        } else {
          fetch
            .post('/auth/api/component/create', { ...values, buttonList: buttonList, deleted: false })
            .then(res => {
              let content = JSON.stringify(this.props.components.components);
              fetch
                .post('/auth/api/componentVersion/create', {
                  componentId: res.id,
                  remark: values.remark || "1.0版本",
                  contents: content,
                })
                .then(() => {
                  message.success('保存成功！');
                  this.handleCancel();
                });
            });
        }
      }
    });
  };

  handleCancel = () => {
    this.props.onClose && this.props.onClose();
  };

  render() {
    const {
      visible,
      components: { version },
    } = this.props;
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
      <Modal
        title="保存组件"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form onSubmit={this.handleSubmit}>
          <Form.Item {...formItemLayout} label="名称">
            {getFieldDecorator('componentName', {
              initialValue: (version.status == 'edit' && version.componentName) || '',
            })(<Input disabled={version.status == 'edit' && !!version.id} />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="类型">
            {getFieldDecorator('componentType', {
              initialValue: (version.status == 'edit' && version.componentType) || 2,
            })(
              <Select disabled={version.status == 'edit' && !!version.id} style={{ width: 160 }}>
                <Select.Option value={1}>组件</Select.Option>
                <Select.Option value={2}>页面</Select.Option>
              </Select>
            )}
          </Form.Item>
          {/* {this.props.form.getFieldValue('componentType') == 2 && (
            <Form.Item {...formItemLayout} label="菜单">
              {getFieldDecorator('menuId', {
                initialValue: (version.status == 'edit' && version.menuId) || 2,
              })(
                <TreeSelect
                  disabled={version.status == 'edit' && !!version.id}
                  style={{ width: 300 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={this.state.menus}
                  placeholder="Please select"
                  treeDefaultExpandAll
                  onChange={this.onChange}
                  getPopupContainer={() => document.querySelector('.ant-modal-body')}
                />
              )}
            </Form.Item>
          )} */}
          <Form.Item {...formItemLayout} label="备注">
            {getFieldDecorator('remark')(<Input.TextArea rows={4} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(NewComponent);
