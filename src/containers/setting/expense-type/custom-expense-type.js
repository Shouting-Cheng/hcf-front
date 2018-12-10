import { messages } from 'utils/utils';
import React from 'react';
import { connect } from 'react-redux';
import baseService from 'share/base.service';
import 'styles/setting/expense-type/custom-expense-type.scss';
import {
  Menu,
  Col,
  Row,
  Button,
  Icon,
  Anchor,
  Spin,
  message,
  Dropdown,
  Modal,
  Select,
  Badge,
  Tabs,
} from 'antd';
const Option = Select.Option;
const { Link } = Anchor;
import ListSort from 'widget/list-sort';
// import menuRoute from 'routes/menuRoute'
import expenseTypeService from 'containers/setting/expense-type/expense-type.service';
import { LanguageInput } from 'widget/Template';
import PropTypes from 'prop-types';
// import { setExpenseTypeSetOfBooks } from 'actions/setting'
import { routerRedux } from 'dva/router';

class CustomExpenseType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sourceCategory: [],
      applicationCategory: [],
      categorySorting: false,
      typeSorting: false,
      typeSortingIndex: -1,
      sortingCategory: false, //loading
      sortingExpenseType: false, //loading
      sortCategory: [],
      sortExpenseType: [],
      // newExpenseTypePage: menuRoute.getRouteItem('new-expense-type'),
      // expenseTypeDetailPage: menuRoute.getRouteItem('expense-type-detail'),
      nowEditCategory: {
        name: null,
        i18n: null,
      },
      savingCategory: false,
      categoryEditVisible: false,
      setOfBooks: [],
      setOfBooksLoading: false,
      activeKey: '1',
    };
  }

  componentWillMount() {
    if (!this.props.expenseTypeSetOfBooks.id) {
      this.props.dispatch({
        type: 'setting/setExpenseTypeSetOfBooks',
        payload: {
          id: this.props.company.setOfBooksId,
          setOfBooksName: this.props.company.setOfBooksName,
        },
      });
    }

    this.getSetOfBooks();
  }

  getSetOfBooks = () => {
    this.setState({ setOfBooksLoading: true });
    baseService.getSetOfBooksByTenant().then(res => {
      this.setState({ setOfBooks: res.data, setOfBooksLoading: false });
      let hasSetOfBooks = false;
      let id = this.props.company.setOfBooksId;
      res.data.map(item => {
        if (item.id === (this.props.expenseTypeSetOfBooks.id || this.props.company.setOfBooksId)) {
          hasSetOfBooks = true;
          id = this.props.expenseTypeSetOfBooks.id;
          this.props.dispatch({
            type: 'setting/setExpenseTypeSetOfBooks',
            payload: item,
          });
        }
      });
      if (!hasSetOfBooks) {
        this.props.dispatch({
          type: 'setting/setExpenseTypeSetOfBooks',
          payload: {
            id: this.props.company.setOfBooksId,
            setOfBooksName: this.props.company.setOfBooksName,
          },
        });
      }
      this.getSourceCategory(id);
      this.getSourceCategory(id, 1);
    });
  };

  getSourceCategory = (setOfBooksId = this.props.expenseTypeSetOfBooks.id, typeFlag = 0) => {
    this.setState({ loading: true });
    baseService
      .getExpenseTypesBySetOfBooks(setOfBooksId || this.props.company.setOfBooksId, typeFlag)
      .then(res => {
        res.data.map(expenseCategory => {
          //如果是第三方费用类型，则不参与排序，放到最下方
          if (!expenseCategory.id) {
            expenseCategory.sequence = 999;
          }
        });

        let target = res.data;

        let categoryCount = 0;

        target.map(expenseCategory => {
          if (expenseCategory.enabled) {
            expenseCategory.sequence = categoryCount++;
            expenseCategory.expenseTypes = expenseCategory.expenseTypes.sort(
              (a, b) => a.sequence > b.sequence || -1
            );
            let expenseTypeCount = 0;
            expenseCategory.expenseTypes.map(expenseType => {
              if (expenseType.enabled) {
                expenseType.sequence = expenseTypeCount++;
              }
            });
          }
        });

        if (typeFlag == 0) {
          this.setState({ applicationCategory: target, loading: false });
        } else {
          this.setState({ sourceCategory: target, loading: false });
        }
      });
  };

  handleChangeSetOfBooks = setOfBooksId => {
    this.state.setOfBooks.map(item => {
      if (item.id === setOfBooksId)
        this.props.dispatch({
          type: 'setting/setExpenseTypeSetOfBooks',
          payload: { ...item },
        });
    });
    this.getSourceCategory(setOfBooksId);
    this.getSourceCategory(setOfBooksId, 1);
  };

  handleSortCategory = result => {
    let sortCategory = [];
    result.map((item, index) => {
      sortCategory.push({
        id: item.key,
        sequence: index,
      });
    });
    this.setState({ sortCategory });
  };

  handleSortExpense = result => {
    let sortExpenseType = [];
    result.map((item, index) => {
      sortExpenseType.push({
        id: item.key,
        sequence: index,
      });
    });
    this.setState({ sortExpenseType });
  };

  finishCategorySort = saveFlag => {
    const { sortCategory } = this.state;
    if (saveFlag && sortCategory.length > 0) {
      this.setState({ sortingCategory: true });
      expenseTypeService.sortCategory(sortCategory).then(res => {
        this.setState({ categorySorting: false, sortCategory: [], sortingCategory: false });
        message.success("更新成功！");
        this.getSourceCategory();
        this.getSourceCategory(this.props.expenseTypeSetOfBooks.id, 1);
      })
    } else {
      this.setState({ categorySorting: false, sortCategory: [] });
    }
  };

  finishExpenseTypeSort = saveFlag => {
    const { sortExpenseType } = this.state;
    if (saveFlag && sortExpenseType.length > 0) {
      this.setState({ sortingExpenseType: true });
      expenseTypeService.sortExpenseType(sortExpenseType).then(res => {
        this.setState({ typeSorting: false, sortExpenseType: [], sortingExpenseType: false });
        message.success("更新成功！");
        this.getSourceCategory();
        this.getSourceCategory(this.props.expenseTypeSetOfBooks.id, 1);
      })
    } else {
      this.setState({ typeSorting: false, sortCategory: [] });
    }
  };

  handleNewExpenseType = () => {
    // this.context.router.push(this.state.newExpenseTypePage.url)
    this.props.dispatch(
      routerRedux.push({
        pathname: '/admin-setting/new-expense-type/0',
      })
    );
  };

  handleEditExpenseType = id => {
    let path =
      this.state.activeKey == '1'
        ? '/admin-setting/application-type-detail/'
        : '/admin-setting/expense-type-detail/';
    this.props.dispatch(
      routerRedux.push({
        pathname: path + id,
      })
    );
  };

  renderExpenseType = (expenseType, noClick) => {
    return (
      <div
        className="expense-type-item"
        key={expenseType.id}
        onClick={noClick ? null : () => this.handleEditExpenseType(expenseType.id)}
      >
        <img src={expenseType.iconUrl} />
        <Row gutter={10}>
          <Col span={18} className="expense-type-name">
            {expenseType.name}
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Badge status={expenseType.enabled ? 'success' : 'error'} />&nbsp;{expenseType.enabled
              ? messages('common.enabled')
              : messages('common.disabled')}
          </Col>
        </Row>
      </div>
    );
  };

  handleClickEditMenu = (e, expenseTypeCategory) => {
    switch (e.key) {
      case 'rename':
        this.setState({ nowEditCategory: JSON.parse(JSON.stringify(expenseTypeCategory)), categoryEditVisible: true });
        break;
      case 'delete':
        if (expenseTypeCategory.expenseTypes.length > 0)
          Modal.warning({
            title: messages('expense.type.move.before.remove'), //删除前请先移动该大类下的费用类型
          });
        else
          expenseTypeService.deleteCategory(expenseTypeCategory.id).then(res => {
            message.success(messages('common.delete.success', { name: '' }));
            this.getSourceCategory();
          });
    }
  };

  renderButtonMenu = expenseTypeCategory => {
    return (
      <Menu onClick={e => this.handleClickEditMenu(e, expenseTypeCategory)}>
        <Menu.Item key="rename">{messages('expense.type.rename')}</Menu.Item>
        <Menu.Item key="delete">{messages('common.delete')}</Menu.Item>
      </Menu>
    );
  };

  handleNewCategory = () => {
    this.setState({
      nowEditCategory: {
        name: null,
        i18n: null,
      },
      categoryEditVisible: true,
    });
  };

  handleEditCategory = () => {
    const { nowEditCategory } = this.state;
    let service = expenseTypeService.editCategory;
    if (!nowEditCategory.name) {
      message.error(messages('common.please.enter'));
      return;
    }
    if (!nowEditCategory.id) {
      nowEditCategory.enabled = true;
      nowEditCategory.setOfBooksId = this.props.expenseTypeSetOfBooks.id;
      nowEditCategory.sequence = 0;
      service = expenseTypeService.createCategory;
    }
    this.setState({ savingCategory: true });
    service(nowEditCategory).then(res => {
      this.setState({
        savingCategory: false,
        categoryEditVisible: false,
        nowEditCategory: {
          name: null,
          i18n: null,
        },
      });
      message.success(messages('common.operate.success'));
      this.getSourceCategory();
      this.getSourceCategory(null, 1);
    });
  };

  handleChangeI18n = (name, i18n) => {
    const { nowEditCategory } = this.state;
    nowEditCategory.name = name;
    nowEditCategory.i18n = {
      name: i18n,
    };
    this.setState({ nowEditCategory });
  };

  //新建申请类型
  handleNewApplicationType = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/admin-setting/new-application-type/0',
      })
    );
  };

  //费用类别面板
  renderExpenseTypePanel = () => {

    const { sourceCategory, typeSorting, typeSortingIndex, sortingExpenseType, categorySorting, loading } = this.state;
    const { tenantMode } = this.props;


    return (
      <div style={{ padding: 20 }}>
        <Button type="primary" onClick={this.handleNewExpenseType}>{messages('expense.type.new.expense.type')/*新增费用类型*/}</Button>
        {loading ? <Spin /> : sourceCategory.map((expenseTypeCategory, index) => {
          const title = `(${expenseTypeCategory.expenseTypes ? expenseTypeCategory.expenseTypes.length : 0})`;
          return (
            <div
              className={`expense-type-category${
                typeSorting && typeSortingIndex === index ? ' sorting-category' : ''
                }`}
              id={'' + expenseTypeCategory.expenseTypeCategoryOID}
              key={expenseTypeCategory.id}
            >
              <div className="expense-type-category-title">
                {expenseTypeCategory.name}&nbsp;{title}
                {typeSorting && typeSortingIndex === index ? (
                  <div className="expense-type-category-operate">
                    <Button
                      type="primary"
                      style={{ marginRight: 10 }}
                      onClick={() => this.finishExpenseTypeSort(true)}
                      loading={sortingExpenseType}
                    >
                      {messages('common.ok')}
                    </Button>
                    <Button
                      onClick={() => this.finishExpenseTypeSort(false)}
                      disabled={sortingExpenseType}
                    >
                      {messages('common.cancel')}
                    </Button>
                  </div>
                ) : (expenseTypeCategory.id && tenantMode && (
                  <div className="expense-type-category-operate">
                    <Dropdown trigger={["click"]} overlay={this.renderButtonMenu(expenseTypeCategory)}>
                      <Button style={{ marginRight: 10 }}>
                        {messages('common.edit')} <Icon type="down" />
                      </Button>
                    </Dropdown>
                  </div>
                )
                  )}
              </div>
              {typeSorting && typeSortingIndex === index ? (
                <div className="expense-type-list">
                  <ListSort onChange={this.handleSortExpense} dragClassName="list-drag-selected">
                    {expenseTypeCategory.expenseTypes.map(expenseType =>
                      this.renderExpenseType(expenseType, true)
                    )}
                  </ListSort>
                </div>
              ) : (
                  <div className="expense-type-list">
                    {expenseTypeCategory.expenseTypes
                      ? expenseTypeCategory.expenseTypes.map(expenseType =>
                        this.renderExpenseType(expenseType)
                      )
                      : null}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    );
  };

  //申请类型面板
  renderApplicationTypePanel = () => {
    const { applicationCategory, typeSorting, typeSortingIndex, sortingExpenseType, loading, categorySorting } = this.state;
    const { tenantMode } = this.props;

    return (
      <div style={{ padding: 20 }}>
        <Button type="primary" onClick={this.handleNewApplicationType}>{messages('新增申请类型')}</Button>
        {loading ? <Spin /> : applicationCategory.map((expenseTypeCategory, index) => {
          const title = categorySorting ? "" : `(${expenseTypeCategory.expenseTypes ? expenseTypeCategory.expenseTypes.length : 0})`;
          return (
            <div
              className={`expense-type-category${
                typeSorting && typeSortingIndex === index ? ' sorting-category' : ''
                }`}
              id={'' + expenseTypeCategory.expenseTypeCategoryOID}
              key={expenseTypeCategory.id}
            >
              <div className="expense-type-category-title">
                {expenseTypeCategory.name}&nbsp;{title}
                {typeSorting && typeSortingIndex === index ? (
                  <div className="expense-type-category-operate">
                    <Button
                      type="primary"
                      style={{ marginRight: 10 }}
                      onClick={() => this.finishExpenseTypeSort(true)}
                      loading={sortingExpenseType}
                    >
                      {messages('common.ok')}
                    </Button>
                    <Button
                      onClick={() => this.finishExpenseTypeSort(false)}
                      disabled={sortingExpenseType}
                    >
                      {messages('common.cancel')}
                    </Button>
                  </div>
                ) : (expenseTypeCategory.id && tenantMode && (
                  <div className="expense-type-category-operate">
                    <Dropdown trigger={["click"]} overlay={this.renderButtonMenu(expenseTypeCategory)}>
                      <Button style={{ marginRight: 10 }}>
                        {messages('common.edit')} <Icon type="down" />
                      </Button>
                    </Dropdown>
                  </div>
                )
                  )}
              </div>
              {typeSorting && typeSortingIndex === index ? (
                <div className="expense-type-list">
                  <ListSort onChange={this.handleSortExpense} dragClassName="list-drag-selected">
                    {expenseTypeCategory.expenseTypes.map(expenseType =>
                      this.renderExpenseType(expenseType, true)
                    )}
                  </ListSort>
                </div>
              ) : (
                  <div className="expense-type-list">
                    {expenseTypeCategory.expenseTypes
                      ? expenseTypeCategory.expenseTypes.map(expenseType =>
                        this.renderExpenseType(expenseType)
                      )
                      : null}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    );
  };

  switchTab = key => {
    this.setState({ activeKey: key });
  };

  render() {
    const {
      sourceCategory,
      categorySorting,
      typeSorting,
      typeSortingIndex,
      savingCategory,
      setOfBooksLoading,
      sortingCategory,
      sortingExpenseType,
      loading,
      categoryEditVisible,
      nowEditCategory,
      setOfBooks,
    } = this.state;
    const { tenantMode } = this.props;

    return (
      <div className="custom-expense-type">
        {typeSorting ? (
          <div className="sort-backdrop" onClick={() => this.finishExpenseTypeSort(false)} />
        ) : null}
        <Row gutter={20}>
          <Col span={6} className="left-container">
            {setOfBooksLoading ? (
              <Spin />
            ) : (
                <Select
                  className="set-of-books"
                  value={this.props.expenseTypeSetOfBooks.id}
                  onChange={this.handleChangeSetOfBooks}
                  disabled={!tenantMode}
                >
                  {setOfBooks.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.setOfBooksName}
                    </Option>
                  ))}
                </Select>
              )}
            {tenantMode && (
              <div className="fixed-button">
                <Button style={{ marginRight: 10 }} onClick={this.handleNewCategory}>
                  <Icon type="plus" />&nbsp;{messages('expense.type.new.group') /*新增分类*/}
                </Button>
                <Button onClick={() => this.setState({ categorySorting: true })}>
                  <Icon type="swap" />&nbsp;{messages(
                    'expense.type.sorting.classification'
                  ) /*排序分类*/}
                </Button>
              </div>
            )}
            <Anchor affix={false} className="anchor">
              {sourceCategory.map(expenseTypeCategory => (
                <div style={{ padding: '7px 0 7px 16px' }} key={expenseTypeCategory.id}>
                  <span>{expenseTypeCategory.name}</span>
                </div>
              ))}
            </Anchor>
          </Col>
          {categorySorting ? (
            <Col span={16} style={{ padding: 0 }}>
              <Button
                type="primary"
                style={{ marginRight: 10 }}
                onClick={() => this.finishCategorySort(true)}
                loading={sortingCategory}
              >
                {messages('common.ok')}
              </Button>
              <Button onClick={() => this.finishCategorySort(false)} disabled={sortingCategory}>
                {messages('common.cancel')}
              </Button>
              <div style={{ position: 'relative' }}>
                <ListSort onChange={this.handleSortCategory} dragClassName="list-drag-selected">
                  {sourceCategory
                    .filter(item => item.enabled && item.id !== null)
                    .map(expenseTypeCategory => {
                      return (
                        <div
                          className="expense-type-category"
                          id={'' + expenseTypeCategory.expenseTypeCategoryOID}
                          key={expenseTypeCategory.id}
                        >
                          <div className="expense-type-category-title" style={{ cursor: 'move' }}>
                            {expenseTypeCategory.name}
                          </div>
                        </div>
                      );
                    })}
                </ListSort>
              </div>
            </Col>
          ) : (
              <Col span={18} className="right-container">
                <Tabs activeKey={this.state.activeKey} defaultActiveKey="1" onChange={this.switchTab}>
                  <Tabs.TabPane tab="申请类型" key="1">
                    {this.renderApplicationTypePanel()}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="费用类型" key="2">
                    {this.renderExpenseTypePanel()}
                  </Tabs.TabPane>
                </Tabs>
              </Col>
            )}
        </Row>
        <Modal
          visible={categoryEditVisible}
          onCancel={() => this.setState({ categoryEditVisible: false })}
          onOk={this.handleEditCategory}
          confirmLoading={savingCategory}
        >
          <div
            style={{
              lineHeight: '50px',
              fontWeight: 500,
              fontSize: 16,
            }}
          >
            {messages('expense.type.expense.group.name') /*费用大类名称*/}
          </div>
          <LanguageInput
            isEdit={!!nowEditCategory.id}
            name={nowEditCategory.name}
            i18nName={nowEditCategory.i18n ? nowEditCategory.i18n.name : null}
            nameChange={this.handleChangeI18n}
            inpRule={[
              {
                length: 30,
                language: 'zh_cn',
              },
              {
                length: 30,
                language: 'en',
              },
            ]}
          />
        </Modal>
      </div>
    );
  }
}

CustomExpenseType.contextTypes = {
  router: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    company: state.user.company,
    expenseTypeSetOfBooks: state.setting.expenseTypeSetOfBooks,
    languageList: state.languages.languageList,
    tenantMode: true,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(CustomExpenseType);
