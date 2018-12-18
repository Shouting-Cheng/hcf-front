import React, { Component } from 'react';
import {
  Input,
  Form,
  Select,
  Tooltip,
  Icon,
  Switch,
  Spin,
  TreeSelect,
  message
} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
const TextArea = Input.TextArea;

import { connect } from 'dva';

import icons from '../../../assets/icons';
import fetch from '../../../utils/fetch';

import columnTemplate from '../../../column-template/index';
import baseMethods from '../../../methods/index';
import debounce from 'lodash/debounce';
import service from '../../Interface/interface.service';


@connect(({ languages }) => ({
  languages,
}))

class CommonAttrForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interfaceList: [],
      templateList: [],
      languageList: [],
      fetching: false,
      dataSource: [],
      modules: [],
      searchResult: [],
      displayColorPicker: false,
      data: {}
    };
    this.titleSearch = debounce(this.titleSearch, 500);
  }

  componentDidMount() {
    fetch.get('/auth/api/interface/query/all').then(res => {
      this.setState({ modules: res });
    });

    let languages = this.props.languages.languages;
    let languageList = [];

    Object.keys(languages).map(item => {
      languageList.push({ key: item, value: languages[item] });
    });

    this.setState({ dataSource: [...languageList] });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedId != nextProps.selectedId) {
      this.setState({ data: {} });
    }
  }


  setData = (item, value) => {
    let { data } = this.state;

    this.setState({ data: { ...data, [item.key]: value } });
  }

  updateComponent = (item, value) => {

    if (item.onChange) {
      item.onChange(item.key, value);
      return;
    }

    if (this.props.updateComponent) {
      this.props.updateComponent(item.key, value);
      return;
    }

    this.props.dispatch({
      type: 'components/updateComponent',
      payload: {
        id: this.props.selectedId,
        value,
        key: item.key,
      },
    });
  };

  renderFormItem = () => {
    const { selectedId, components, formItems } = this.props;

    let selected = components.find(o => o.id == selectedId);

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };

    let items = [
      <FormItem {...formItemLayout} label="名称" key="type">
        <span className="ant-form-text">{selected.type}</span>
      </FormItem>,
    ];

    formItems.map(item => {
      let value = selected[item.key];

      if (String(item.key).indexOf('.') >= 0) {
        let keys = String(item.key).split('.');
        let temp = selected;
        keys.map(item => {
          if (typeof temp[item] == 'object') {
            temp = temp[item];
          }
        });
        value = temp[keys[keys.length - 1]];
      }

      items.push(
        <FormItem
          {...formItemLayout}
          label={
            <span>
              {item.label}&nbsp;
              <Tooltip title={item.tooltip}>
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          key={item.key}
        >
          {this.renderFormElement(item, value)}
        </FormItem>
      );
    });

    return items;
  };

  renderTamplate = () => {
    let templates = [];

    Object.keys(columnTemplate).map(key => {
      templates.push(
        <Select.OptGroup key={key} label={key}>
          {Object.keys(columnTemplate[key]).map(item => {
            return (
              <Select.Option key={key + '.' + item} value={key + '.' + item}>
                {item}
              </Select.Option>
            );
          })}
        </Select.OptGroup>
      );
    });

    return templates;
  };

  renderMethods = () => {
    let methods = [];

    Object.keys(baseMethods).map(key => {
      methods.push(
        <Select.OptGroup key={key} label={key}>
          {Object.keys(baseMethods[key]).map(item => {
            return <Select.Option key={'0' + '.' + key + '.' + item}>{item}</Select.Option>;
          })}
        </Select.OptGroup>
      );
    });

    for (let key in window.refs) {
      methods.push(
        <Select.OptGroup key={key} label={key}>
          {window.refs[key].state.methods.map(item => {
            return (
              <Select.Option key={'1' + '.' + key + '.' + item.name}>{item.name}</Select.Option>
            );
          })}
        </Select.OptGroup>
      );
    }
    return methods;
  };

  titleSearch = value => {
    let { dataSource } = this.state;

    if (!value || !value.length) {
      this.setState({ languageList: [] });
      return;
    }

    this.setState({ fetching: true });

    let languageList = dataSource.filter(
      item => item.key.indexOf(value) >= 0 || item.value.indexOf(value) >= 0
    ).slice(0, 20);

    this.setState({ languageList, fetching: false });
  };

  onLoadData = treeNode => {

    // let o = [
    //   { "key": 1, "label": "启用" },
    //   { "key": 0, "label": "禁用" }
    // ]

    return new Promise(resolve => {
      if (treeNode.props.dataRef.children) {
        resolve();
        return;
      }

      service.getInterfaceListByModuleId(treeNode.props.dataRef.id).then(res => {
        let modules = this.state.modules;

        let module = modules.find(item => item.id == treeNode.props.dataRef.id);

        module.children = res;

        this.setState({
          modules,
        });

        resolve();
      });
    });
  };

  //检查是否为json
  checkJson = (e, item) => {
    try {
      var obj = JSON.parse(e.target.value);
      if (!(typeof obj == 'object' && obj)) {
        message.error(`json格式不正确`);
        e.target.focus();
      } else {
        this.updateComponent(item, e.target.value);
      }
    } catch (error) {
      message.error(`json格式不正确：` + error);
      e.target.focus();
    }
  }

  renderFormElement = (item, value) => {

    const { languageList, fetching, modules, data } = this.state;

    switch (item.type) {
      case 'input':
        return (
          <Input
            value={data[item.key] || value}
            onBlur={e => this.updateComponent(item, e.target.value)}
            onChange={e => this.setData(item, e.target.value)}
            style={{ width: '100%' }}
          />
        );
      case 'switch':
        return (
          <Switch
            value={data[item.key] || value}
            onBlur={e => this.updateComponent(item, e.target.value)}
            onChange={e => this.setData(item, e.target.value)}
            checkedChildren={<Icon type="check" />}
            unCheckedChildren={<Icon type="close" />}
          />
        );
      case 'select':
        return (
          <Select value={data[item.key] || value} onChange={value => this.setData(item, value)} onBlur={e => this.updateComponent(item, e.target.value)}>
            {item.options.map(option => {
              return <Option key={option.value}>{option.label}</Option>;
            })}
          </Select>
        );
      case 'method':
        return (
          <Select value={data[item.key] || value} onChange={value => this.setData(item, value)} onBlur={value => this.updateComponent(item, e.target.value)}>
            {this.renderMethods()}
          </Select>
        );
      case 'icon':
        return (
          <Select
            value={data[item.key] || value}
            onBlur={value => this.updateComponent(item, e.target.value)}
            onChange={e => this.setData(item, e)}
            optionLabelProp="value"
          >
            {icons.map(item => {
              return (
                <Select.Option key={item} value={item}>
                  <Icon type={item} />
                </Select.Option>
              );
            })}
          </Select>
        );
      case 'title':
        return (
          <Select
            value={data[item.key] || value}
            onBlur={e => this.updateComponent(item, e.target.value)}
            optionLabelProp="value"
            notFoundContent={fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={this.titleSearch}
            showSearch
            showArrow={false}
            onChange={e => this.setData(item, e)}
          >
            {languageList.map((item, index) => {
              return (
                <Select.Option key={item.key} value={item.key}>
                  <Tooltip placement="left" title={item.key + '-' + item.value}>
                    <span style={{ fontWeight: 800 }}>{item.key}</span>
                    <span>-</span>
                    <span>{item.value}</span>
                  </Tooltip>
                </Select.Option>
              );
            })}
          </Select>
        );
      case 'interface':
        return (
          <TreeSelect
            getPopupContainer={() => document.querySelector('#attr-form')}
            value={data[item.key] || value}
            onBlur={e => this.updateComponent(item, e.target.value)}
            onChange={value => this.setData(item, value)}
          >
            {modules.map(item => {
              return (
                <TreeNode
                  disabled
                  isLea={false}
                  title={item.moduleName}
                  key={item.moduleId}
                  dataRef={item}
                >
                  {item.listInterface &&
                    item.listInterface.map(o => {
                      return (
                        <TreeNode
                          value={o.id}
                          isLeaf
                          title={<span>{o.interfaceName}</span>}
                          key={o.id}
                          dataRef={o}
                        />
                      );
                    })}
                </TreeNode>
              );
            })}
          </TreeSelect>
        );
      case 'template':
        return (
          <Select value={data[item.key] || value} onChange={e => this.setData(item, e.target.value)} onBlur={value => this.updateComponent(item, value)}>
            {this.renderTamplate()}
          </Select>
        );
      case 'json':
        return (
          <TextArea onBlur={(e) => this.checkJson(e, item)} onChange={e => this.setData(item, e.target.value)} value={data[item.key] || value} autosize={{ minRows: 3 }} >
          </TextArea>
        );
      case 'color':
        return (
          <Input
            onChange={e => this.setData(item, e.target.value)}
            value={data[item.key] || value}
            onBlur={e => this.updateComponent(item, e.target.value)}
            style={{ width: '100%' }}
          />
        );

      // <Select value={selected.events && selected.events.submitHandle} onChange={this.clickChange}>
      //   {this.renderMethods()}
      // </Select>
      default:
        return (
          <Input
            onChange={e => this.setData(item, e.target.value)}
            value={data[item.key] || value}
            onBlur={e => this.updateComponent(key, e.target.value)}
            style={{ width: '100%' }}
          />
        );
    }
  };

  render() {
    return <Form>{this.renderFormItem()}</Form>;
  }
}

export default Form.create()(CommonAttrForm);
// Export the wrapped component:
// export default ComponentManager;
