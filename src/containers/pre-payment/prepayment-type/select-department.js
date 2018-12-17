/**
 * Created By ZaraNengap on 2017/09/21
 */
import React from 'react';
import { connect } from 'dva'
import { Modal,  message, Button, Input, Row, Col, Card, Checkbox, Tree, Spin } from 'antd'
const Search = Input.Search;
const CheckboxGroup = Checkbox.Group;
const TreeNode = Tree.TreeNode;
import httpFetch from 'share/httpFetch'
import SearchArea from 'widget/search-area'
import config from 'config'
import 'styles/pre-payment/my-pre-payment/select-contract.scss'
import PropTypes from 'prop-types'

class SelectEmployeeGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            toData: [],  //代选区的数据
            useData: [], //使用区的数据
            expandedKeys: ['0-0-0', '0-0-1'],
            autoExpandParent: true,
            checkedKeys: ['0-0-0'],
            selectedKeys: [],
            loading: false,
            toSelectList: [],  //代选区选中的列表
            useSelectList: [],  //使用区选中的列表
            toSearchText: ""
        };
    }

    onExpand = (expandedKeys) => {
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            this.setState({ useData: nextProps.selectedData ? nextProps.selectedData : [] }, () => {
                this.getList();
            });
        }
    }

    onSelect = (selectedKeys, info) => {
        this.setState({ selectedKeys });
    }

    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} dataRef={item} />;
        });
    }

    onLoadData = (treeNode) => {
        return new Promise((resolve) => {

            if (treeNode.props.children) {
                resolve();
                return;
            }

            let model = JSON.parse(treeNode.props.eventKey);

            httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/get/dept/by/id?status=102&id=${model.id}&name=`).then(res => {

                let temp = [];
                let selected = this.state.toSelectList.concat([]);

                res.data.map(item => {
                    let jsonStr = JSON.stringify(item);

                    if (this.state.useData.findIndex(o => o.value == item.id) >= 0) {
                        selected.push(jsonStr);
                    }
                    temp.push({ title: item.name, key: jsonStr, isLeaf: !item.hasChildrenDepartments });
                })

                treeNode.props.dataRef.children = temp;

                this.setState({
                    toData: this.state.toData.concat([]),
                    toSelectList: []
                });

                resolve();
            })

        });
    }

    getList = () => {
        this.setState({ loading: true });
        let useData = this.state.useData;

        httpFetch.get(`${config.baseUrl}/api/departments/root?flag=1002`).then(res => {

            if (res.data && res.data.length) {
                let temp = [];
                let selected = [];

                res.data.map(item => {

                    let jsonStr = JSON.stringify(item);

                    if (this.state.useData.findIndex(o => o.value == item.id) >= 0) {
                        selected.push(jsonStr);
                    }

                    temp.push({ title: item.name, key: jsonStr });
                })

                this.setState({ toData: temp, loading: false, toSelectList: selected });
            }

        }).catch(() => {
            this.setState({ loading: false });
        })
    }

    onCheck = (values, e) => {
        console.log(e);

        let temp = [];
        values.checked.map(item => {
            let model = JSON.parse(item);
            temp.push({ label: model.path, value: model.id });
        });

        this.setState({ toSelectList: values.checked });
    }

    handleOk = () => {
        this.props.onOk({
            checkedKeys: this.state.useData.concat([])
        });
    }

    addToUse = () => {
        let temp = [];

        let toData = this.state.toData;
        let useData = this.state.useData;

        this.state.toSelectList.map(item => {
            let model = JSON.parse(item);

            if (useData.findIndex(o => o.value == model.departmentId) >= 0 || useData.findIndex(o => o.value == model.id) >= 0) {
                return;
            }

            if (this.state.toSearchText) {
                temp.push({ label: model.path, value: model.departmentId });
            }
            else {
                temp.push({ label: model.path, value: model.id });
            }
        });

        this.setState({ useData: useData.concat(temp) });
    }

    removeFromUse = () => {

        let useData = this.state.useData;
        let toSelectList = this.state.toSelectList;

        this.state.useSelectList.map(item => {
            useData.splice(useData.findIndex(o => o.value == item), 1);
            toSelectList.splice(toSelectList.findIndex(o => {
                let model = JSON.parse(o);
                return model.id == item || model.departmentId == item
            }), 1);
        })

        this.setState({ useData: useData.concat([]), useSelectList: [], toSelectList: toSelectList.concat([]) });
    }

    useCheckboxChange = (values) => {
        console.log(values);
        this.setState({ useSelectList: values });
    }

    onChange = (e) => {

        this.setState({ toSearchText: e.target.value });

        if (!e.target.value) {
            this.getList();
            return;
        }

        this.refs.search.blur();

        this.setState({ loading: true });

        httpFetch.get(`${config.baseUrl}/api/DepartmentGroup/selectDept/enabled?deptCode=&name=${e.target.value}`).then(res => {
            if (res.data && res.data.length) {
                let temp = [];

                res.data.map(item => {
                    temp.push({ title: item.path, key: JSON.stringify(item), isLeaf: true });
                })

                this.setState({ toData: temp, loading: false });
            }

        })
    }

    render() {
        const { visible, onCancel, afterClose } = this.props;
        const { toData, checkedKeys, useSelectList, toSelectList, useUserGroup, useData } = this.state;
        return (
            <Modal title={"选择部门"} visible={visible} onCancel={onCancel} afterClose={afterClose} width={"70%"} onOk={this.handleOk} className="list-selector select-department select-employee-group ">
                <Row gutter={10}>
                    <Col span={10}>
                        <Card title="待选区">
                            <Search ref="search" style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onChange} />
                            <Tree
                                checkable
                                loadData={this.onLoadData}
                                onCheck={this.onCheck}
                                checkStrictly={true}
                                defaultCheckedKeys={toSelectList}
                            >
                                {this.renderTreeNodes(toData)}
                            </Tree>
                        </Card>
                    </Col>
                    <Col span={4}>
                        <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div>
                                <Button disabled={!toSelectList.length} onClick={this.addToUse} size="small" type="primary">加入使用&gt;</Button>
                                <br />
                                <Button disabled={!useSelectList.length} onClick={this.removeFromUse} style={{ marginTop: 15 }} size="small" type="primary">&lt;回到代选</Button>
                            </div>
                        </div>
                    </Col>
                    <Col span={10}>
                        <Card title="使用区">
                            <Search
                                placeholder="请输入"
                                onChange={(e) => this.useSearch(e.target.value)}
                            />
                            {
                                <div style={{ margin: "10px 15px" }}>
                                    <CheckboxGroup value={useSelectList} onChange={this.useCheckboxChange} options={useData}></CheckboxGroup>
                                </div>
                            }
                        </Card>
                    </Col>
                </Row>


            </Modal >
        );
    }
}

SelectEmployeeGroup.propTypes = {
    visible: PropTypes.bool,  //对话框是否可见
    onOk: PropTypes.func,  //点击OK后的回调，当有选择的值时会返回一个数组
    onCancel: PropTypes.func,  //点击取消后的回调
    afterClose: PropTypes.func,  //关闭后的回调
    type: PropTypes.string,  //选择类型
    selectedData: PropTypes.array,  //默认选择的值id数组
    extraParams: PropTypes.object,  //搜索时额外需要的参数,如果对象内含有组件内存在的变量将替换组件内部的数值
    selectorItem: PropTypes.object,  //组件查询的对象，如果存在普通配置没法实现的可单独传入，例如参数在url中间动态变换时，表单项需要参数搜索时
    single: PropTypes.bool  //是否单选
};

SelectEmployeeGroup.defaultProps = {
    afterClose: () => { },
    extraParams: {},
    single: false
};

function mapStateToProps() {
    return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(SelectEmployeeGroup);

