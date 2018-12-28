import React from 'react';
import debounce from 'lodash.debounce';
import { Spin, Input, Card, Row, Col, Icon, Popover, message } from 'antd';
const Search = Input.Search;
import 'styles/components/template/expense-type-selector.scss';
import baseService from 'share/base.service';
import PropTypes from 'prop-types';

class ExpenseTypeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sourceCategory: [],
      selectedExpenseType: {},
      selectedExpenseTypeArr: [],
      filterCategory: [],
      isShowHistoryExpenseType: true, //是否展示费用选择历史，搜索的时候不展示
      historyExpenseType: [], //费用选择历史记录
    };
    this.handleSearch = debounce(this.handleSearch, 500);
  }

  componentWillMount() {}

  componentDidMount() {
    this.getExpenseType(this.props);
    this.getExpenseTypeHistory(this.props);
    if (this.props.single) {
      this.setState({ selectedExpenseType: this.props.value || {} });
    } else if (!this.props.single) {
      this.setState({ selectedExpenseTypeArr: this.props.value || [] });
    }
  }

  getExpenseTypeHistory = props => {
    const { source, param } = props;
    if (source === 'formV2') {
      baseService.getExpenseTypesHistoryByFormOid({ formOid: param.formOid }).then(res => {
        this.setState({
          historyExpenseType: res.data,
        });
      });
    }
  };

  getSourceCategory = () => {
    const { source, param } = this.props;
    let setOfBooksId = null;
    if (source === 'formV2' || source === 'form') {
      setOfBooksId = param.setOfBooksId;
    }
    if (this.state.sourceCategory.length === 0)
      return baseService.getExpenseTypeCategory(setOfBooksId).then(res => {
        this.setState({
          sourceCategory: res.data ? res.data : [],
          filterCategory: res.data ? res.data : [],
        });
        return res.data ? res.data : [];
      });
    else return new Promise(resolve => resolve(this.state.sourceCategory));
  };

  getExpenseType = props => {
    this.setState({ loading: true });
    const { source, param, filter } = props;
    let listKey;
    this.getSourceCategory().then(sourceCategory => {
      let request;
      switch (source) {
        case 'company':
          request = baseService.getExpenseTypeByCompanyOid;
          break;
        case 'form':
          request = baseService.getExpenseTypesByFormOid;
          listKey = 'expenseTypes';
          break;
        case 'formV2':
          request = baseService.getExpenseTypesByFormOidV2;
          listKey = 'expenseTypes';
          break;
      }
      request &&
        request(param).then(res => {
          let target = res.data;
          if (listKey) target = res.data[listKey];
          target = target.filter(filter);
          if (source !== 'formV2')
            target = target.filter(expenseType => expenseType.isAbleToCreatedManually);
          target.map(expenseType => {
            if (expenseType.expenseTypeCategoryOid) {
              sourceCategory.map(item => {
                if (item.expenseTypeCategoryOid === expenseType.expenseTypeCategoryOid) {
                  if (!item.expenseType) item.expenseType = [];
                  item.expenseType.push(expenseType);
                  return item;
                }
              });
            } else {
              //费用类型的expenseTypeCategoryOid为null时, add by mengsha.wang@huilianyi.com
              let nullCategoryItem;
              let nullCategoryOidExist = false;
              sourceCategory.map(item => {
                if (item.expenseTypeCategoryOid === '0000-0000-0000-0000-0000') {
                  nullCategoryItem = item;
                  nullCategoryOidExist = true;
                  item.expenseType.push(expenseType);
                  return item;
                }
              });
              if (!nullCategoryOidExist) {
                nullCategoryItem = {
                  expenseTypeCategoryOid: '0000-0000-0000-0000-0000',
                  name: this.$t('common.other'),
                  expenseType: [expenseType],
                };
                sourceCategory.push(nullCategoryItem);
              }
            }
          });
          this.setState({ sourceCategory, filterCategory: sourceCategory, loading: false });
        });
    });
  };

  componentWillReceiveProps(nextProps) {
    let nextExpenseType = nextProps.value;
    if (
      nextProps.single &&
      nextExpenseType &&
      nextExpenseType.id &&
      nextExpenseType.id !== this.state.selectedExpenseType.id
    ) {
      this.setState({ selectedExpenseType: nextExpenseType });
    } else if (
      !nextProps.single &&
      nextExpenseType &&
      nextExpenseType.length !== this.state.selectedExpenseTypeArr.length
    ) {
      this.setState({ selectedExpenseTypeArr: nextExpenseType });
    }
  }

  handleSearch = value => {
    this.getSourceCategory().then(sourceCategory => {
      if (value === '')
        this.setState({ filterCategory: sourceCategory, isShowHistoryExpenseType: true });
      else {
        let result = [];
        sourceCategory.map((category, index) => {
          result.push(Object.assign({}, category));
          result[index].expenseType = [];
          if (category.expenseType) {
            category.expenseType.map(expenseType => {
              if (expenseType.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                result[index].expenseType.push(expenseType);
              }
            });
          }
        });
        this.setState({ filterCategory: result, isShowHistoryExpenseType: false });
      }
    });
  };

  handleSelect = expenseType => {
    if (this.props.single) {
      this.setState(
        {
          selectedExpenseType:
            expenseType.expenseTypeOid === this.state.selectedExpenseType.expenseTypeOid
              ? {}
              : expenseType,
        },
        () => {
          this.props.onSelect(this.state.selectedExpenseType);
        }
      );
    } else {
      let selectedExpenseTypeArr = this.state.selectedExpenseTypeArr;
      let expenseIndex = -1;
      selectedExpenseTypeArr.map((item, index) => {
        item.expenseTypeOid === expenseType.expenseTypeOid && (expenseIndex = index);
      });
      expenseIndex !== -1
        ? selectedExpenseTypeArr.splice(expenseIndex, 1)
        : selectedExpenseTypeArr.push(expenseType);
      this.setState({ selectedExpenseTypeArr }, () => {
        this.props.onSelect(this.state.selectedExpenseTypeArr);
      });
    }
  };

  render() {
    const {
      loading,
      filterCategory,
      selectedExpenseType,
      selectedExpenseTypeArr,
      isShowHistoryExpenseType,
      historyExpenseType,
    } = this.state;
    let resultLength = 0;
    let typeLength = filterCategory.length - 1;
    return (
      <div className="expense-type-selector">
        <Spin spinning={loading}>
          <Search
            onChange={value => {
              this.handleSearch(value.target.value);
            }}
            placeholder={this.$t('expense.invoice.search.expenseType')}
          />
          {isShowHistoryExpenseType &&
            historyExpenseType.length > 0 && (
              <div className="category-area">
                <div className="category-name">{this.$t('common.select.history') /*历史选择*/}</div>
                <Row gutter={10}>
                  {historyExpenseType.map(expenseType => {
                    let className = '';
                    if (this.props.single) {
                      expenseType.expenseTypeOid === selectedExpenseType.expenseTypeOid &&
                        (className = 'selected');
                    } else {
                      selectedExpenseTypeArr.map(expenseTypeItem => {
                        expenseTypeItem.expenseTypeOid === expenseType.expenseTypeOid &&
                          (className = 'selected');
                      });
                    }
                    return (
                      <Col
                        span={8}
                        key={expenseType.expenseTypeOid}
                        onClick={() => {
                          this.handleSelect(expenseType);
                        }}
                      >
                        <Card className={`expense-card ${className}`}>
                          <Icon type="check-circle-o" className="selected-icon" />
                          <img src={expenseType.iconURL} />
                          <Popover content={expenseType.name}>
                            <div className="expense-name">{expenseType.name}</div>
                          </Popover>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            )}
          {filterCategory.length > 0 ? (
            filterCategory.map((expenseTypeCategory, index) => {
              expenseTypeCategory.expenseType &&
                (resultLength += expenseTypeCategory.expenseType.length);
              if (index === typeLength && resultLength === 0) {
                return (
                  <div className="search-no-expense">
                    {this.$t('expense.invoice.no.expenseType') /*暂无费用类型*/}
                  </div>
                );
              }
              return expenseTypeCategory.expenseType &&
                expenseTypeCategory.expenseType.length > 0 ? (
                <div className="category-area" key={expenseTypeCategory.expenseTypeCategoryOid}>
                  <div className="category-name">{expenseTypeCategory.name}</div>
                  <Row gutter={10}>
                    {expenseTypeCategory.expenseType.map(expenseType => {
                      let className = '';
                      if (this.props.single) {
                        expenseType.expenseTypeOid === selectedExpenseType.expenseTypeOid &&
                          (className = 'selected');
                      } else {
                        selectedExpenseTypeArr.map(expenseTypeItem => {
                          expenseTypeItem.expenseTypeOid === expenseType.expenseTypeOid &&
                            (className = 'selected');
                        });
                      }
                      return (
                        <Col
                          span={8}
                          key={expenseType.expenseTypeOid}
                          onClick={() => {
                            this.handleSelect(expenseType);
                          }}
                        >
                          <Card className={`expense-card ${className}`}>
                            <Icon type="check-circle-o" className="selected-icon" />
                            <img src={expenseType.iconURL} />
                            <Popover content={expenseType.name}>
                              <div className="expense-name">{expenseType.name}</div>
                            </Popover>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ) : null;
            })
          ) : (
            <div className="no-expense-type">
              {this.$t('expense.invoice.no.expenseType') /*暂无费用类型*/}
            </div>
          )}
        </Spin>
      </div>
    );
  }
}

ExpenseTypeSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  source: PropTypes.string,
  param: PropTypes.any,
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), //single为false时，需要传入数组
  single: PropTypes.bool, //是否为单选 add by mengsha.wang@huilianyi.com
  filter: PropTypes.func,
};

ExpenseTypeSelector.defaultProps = {
  single: true,
  filter: () => true,
};

export default ExpenseTypeSelector;
