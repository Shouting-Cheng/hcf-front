import React from 'react';
import { Row, Col, Card, Tree, Form, Input, Select, Divider, Icon, Spin } from 'antd';
const FormItem = Form.Item;
const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
import debounce from 'lodash.debounce';

import service from './interface.service';
import NewInterface from './new-interface';
import InterfaceDetail from './interface-detail';
import RequestParams from './request-params';
import ResponseParams from './response-params';
import InterfaceTest from './interface-test';

class Interface extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: [],
      moduleId: 0,
      expandedKeys: [],
      interfaceId: 0,
      searchValue: '',
      testVisible: false,
      loadedKeys: [],
      loadding: true,
    };
    this.onChange = debounce(this.onChange, 500);
  }

  componentDidMount() {
    this.setState({ loadding: true });
    service.getModules().then(res => {
      this.setState({
        modules: res.map(item => {
          return { ...item, isModule: true };
        }),
        loadding: false,
      });
    });
  }

  select = (selectedKeys, e) => {
    if (!e.node.props.dataRef.isModule) {
      this.setState({ moduleId: 0, interfaceId: selectedKeys[0] });
      return;
    }
    this.setState({ moduleId: selectedKeys[0], interfaceId: 0 });
  };

  add = () => {
    this.setState({ visible: true });
  };

  handleOk = () => {
    let moduleId = this.state.moduleId;

    service.getInterfaceListByModuleId(moduleId).then(res => {
      let modules = this.state.modules;

      let module = modules.find(item => item.id == moduleId);

      module.children = res;

      this.setState({
        modules,
        expandedKeys: [moduleId],
        visible: false,
      });
    });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  expand = (expandedKeys, e) => {
    if (e.expanded) {
      this.setState({ expandedKeys: [e.node.props.dataRef.id] });
    } else {
      this.setState({ expandedKeys: [] });
    }
  };

  onChange = value => {
    this.setState({ searchValue: value, loadding: true });

    if (!value) {
      service.getModules().then(res => {
        this.setState({
          modules: res.map(item => {
            return { ...item, isModule: true };
          }),
          expandedKeys: [],
          loadedKeys: [],
          loadding: false,
        });
      });

      return;
    }

    const { modules } = this.state;

    let expandedKeys = [];

    service.getInterfaceByKeyword(value).then(res => {
      res = res.map(item => {
        return {
          ...item,
          id: item.moduleId,
          isModule: true,
          children: item.listInterface,
        };
      });

      this.setState({ expandedKeys: [], modules: res, loadding: false });
    });
  };

  test = () => {
    this.setState({ testVisible: true });
  };

  delete = () => {};

  save = () => {};

  focus = () => {
    console.log('focus');
  };

  onLoadData = treeNode => {
    let loadedKeys = this.state.loadedKeys;
    if (loadedKeys.indexOf(treeNode.props.dataRef.id) < 0) {
      loadedKeys.push(treeNode.props.dataRef.id);
    }
    this.setState({ loadedKeys });

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

  emitEmpty = () => {
    this.input.input.value = '';

    this.setState({ searchValue: '', loadding: true });

    service.getModules().then(res => {
      this.setState({
        modules: res.map(item => {
          return { ...item, isModule: true };
        }),
        expandedKeys: [],
        loadedKeys: [],
        loadding: false,
      });
    });
  };

  render() {
    const {
      modules,
      moduleId,
      visible,
      expandedKeys,
      interfaceId,
      searchValue,
      testVisible,
      loadedKeys,
      loadding,
    } = this.state;
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    const suffix = searchValue ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;

    return (
      <div className="interface">
        <Row>
          <Col span={6}>
            <Card
              hoverable
              title="接口管理"
              extra={!!moduleId && <a onClick={this.add}>添加接口</a>}
            >
              <Input
                ref={ref => (this.input = ref)}
                onFocus={this.focus}
                style={{ marginBottom: 8 }}
                placeholder="搜索"
                onChange={e => this.onChange(e.target.value)}
                suffix={suffix}
              />
              <Spin spinning={loadding}>
                <Tree
                  onSelect={this.select}
                  expandedKeys={expandedKeys}
                  onExpand={this.expand}
                  loadData={this.onLoadData}
                  showLine
                  loadedKeys={loadedKeys}
                >
                  {modules.map(item => {
                    return (
                      <TreeNode isLea={false} title={item.moduleName} key={item.id} dataRef={item}>
                        {item.children &&
                          item.children.map(o => {
                            let index = o.interfaceName.indexOf(searchValue);
                            let beforeStr = o.interfaceName.substr(0, index);
                            let afterStr = o.interfaceName.substr(index + searchValue.length);
                            let title =
                              index > -1 ? (
                                <span>
                                  {beforeStr}
                                  <span style={{ color: '#f50' }}>{searchValue}</span>
                                  {afterStr}
                                </span>
                              ) : (
                                <span>{o.interfaceName}</span>
                              );
                            return <TreeNode isLeaf title={title} key={o.id} dataRef={o} />;
                          })}
                      </TreeNode>
                    );
                  })}
                </Tree>
              </Spin>
            </Card>
          </Col>
          <Col span={18}>
            {!!interfaceId && <InterfaceDetail test={this.test} id={interfaceId} />}
            {!!interfaceId && (
              <Card
                hoverable
                title="请求参数"
                extra={!!moduleId && <a onClick={this.add}>添加接口</a>}
              >
                <RequestParams id={interfaceId} />
              </Card>
            )}
            {!!interfaceId && (
              <Card
                hoverable
                title="响应参数"
                extra={!!moduleId && <a onClick={this.add}>添加接口</a>}
              >
                <ResponseParams id={interfaceId} />
              </Card>
            )}
          </Col>
        </Row>
        <NewInterface
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          moduleId={moduleId}
          visible={visible}
        />
        <InterfaceTest
          id={interfaceId}
          onClose={() => {
            this.setState({ testVisible: false });
          }}
          visible={testVisible}
        />
      </div>
    );
  }
}
export default Form.create()(Interface);
