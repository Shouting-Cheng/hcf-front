/**
 * Created by zhouli on 18/7/24
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import { Select, Button, Col, Spin } from 'antd';
import 'styles/components/template/export-modal/export-modal.scss';
import SCService from 'components/Template/search-city/search-city.service';
import 'styles/components/template/search-city/search-city.scss';
const Option = Select.Option;
class SearchCity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      countryOptions: [], //获取到的所有的国家选项
      provinceOptions: [], //某个国家其下的省州选项
      cityOptions: [], //某个国家其下的市区选项
      districtOptions: [], //某个国家其下的地区选项
      selectedCountry: undefined,
      selectedProvince: undefined,
      selectedCity: undefined,
      selectedDistrict: undefined,
      language: this.props.language.code,
      size: 10,
      page: 0,
    };
  }

  componentWillMount() {
    this.setState(
      {
        selectedCountry: 'CHN000000000',
      },
      () => {
        this.getProvinceOptions();
      }
    );
  }

  componentDidMount() {
    this.getCountryOptions();
  }

  //获取所有国家列表
  getCountryOptions = () => {
    this.setState({
      loading: true,
    });
    const { language } = this.state;
    let params = {
      language: language,
      type: 'country',
    };
    SCService.getCityForSearch(params).then(res => {
      this.setState({
        countryOptions: res.data,
        loading: false,
      });
    });
  };
  //选择某个国家时
  countryOptionsChange = value => {
    this.setState(
      {
        provinceOptions: [],
        cityOptions: [],
        districtOptions: [],
        selectedProvince: undefined,
        selectedCity: undefined,
        selectedDistrict: undefined,
        selectedCountry: value,
      },
      () => {
        this.getProvinceOptions();
        this.props.parentMessage(this.state.selectedCountry);
      }
    );
  };
  //获取某个国家其下的省/州列表
  getProvinceOptions = () => {
    this.setState({
      loading: true,
    });
    const { language, selectedCountry } = this.state;
    let params = {
      language: language,
      type: 'state',
      code: selectedCountry,
    };
    SCService.getCityForSearch(params).then(res => {
      if (res.data.length === 1 && res.data[0].state === '') {
        res.data[0].state = '全部';
      }
      if (res.data.length > 1 && res.data[0].state === '') {
        res.data.delete(res.data[0]);
      }
      this.setState(
        {
          provinceOptions: res.data,
          loading: false,
        },
        () => {
          if (this.state.provinceOptions.length === 1) {
            let params = {
              language: language,
              type: 'city',
              code: selectedCountry,
            };
            SCService.getCityForSearch(params).then(res => {
              if (res.data[0].city === '') {
                res.data[0].city = '全部';
              }
              this.setState({
                cityOptions: res.data,
                loading: false,
              });
            });
          }
        }
      );
    });
  };
  //选择某个国家其下的省/州时
  provinceOptionsChange = value => {
    this.setState(
      {
        selectedProvince: value,
        cityOptions: [],
        districtOptions: [],
        selectedCity: '',
        selectedDistrict: '',
      },
      () => {
        this.getCityOptions();
      }
    );
  };

  //获取某个国家其下的省/州其下的城市
  getCityOptions = () => {
    this.setState({
      loading: true,
    });
    const { language, selectedProvince } = this.state;
    let params = {
      language: language,
      type: 'city',
      code: selectedProvince,
    };
    SCService.getCityForSearch(params).then(res => {
      this.setState({
        cityOptions: res.data,
        loading: false,
      });
    });
  };
  //选择某个国家其下的省/州其下的城市时
  cityOptionsChange = value => {
    this.setState(
      {
        selectedCity: value,
        districtOptions: [],
        selectedDistrict: '',
      },
      () => {
        this.getDistrictOptions();
      }
    );
  };

  //获取某个国家其下的省/州其下的城市其下的地区时
  getDistrictOptions = () => {
    const { language, selectedCity } = this.state;
    let params = {
      language: language,
      type: 'district',
      code: selectedCity,
    };
    SCService.getCityForSearch(params).then(res => {
      this.setState({
        districtOptions: res.data,
      });
    });
  };

  //选择某个国家其下的省/州其下的城市其下的地区时
  districtOptionsChange = value => {
    this.setState({
      selectedDistrict: value,
    });
  };

  //点击搜索
  handleSearch = key => {
    const {
      language,
      size,
      page,

      provinceOptions,
      cityOptions,

      selectedCountry,
      selectedProvince,
      selectedCity,
      selectedDistrict,
    } = this.state;
    let code = '',
      type = '';
    if (!key) {
      this.setState({
        searchSelectedKeys: [],
      });
    }
    this.setState({
      isSearch: true,
      selectedRowKeys: [],
      placeListSelectedKeys: [],
    });

    if (selectedDistrict) {
      code = selectedDistrict;
      type = 'only';
    } else if (selectedCity && !selectedDistrict) {
      code = selectedCity;
      type = 'district';
    } else if (selectedProvince && !selectedCity && !selectedDistrict) {
      if (cityOptions.length > 1) {
        type = 'city';
        code = selectedProvince;
      } else {
        type = 'district';
        code = selectedProvince;
      }
    } else if (selectedCountry && !selectedProvince && !selectedCity && !selectedDistrict) {
      if (provinceOptions.length > 1) {
        type = 'state';
        code = selectedCountry;
      } else {
        type = 'city';
        code = selectedCountry;
      }
    } else if (!selectedCountry && !selectedProvince && !selectedCity && !selectedDistrict) {
      type = 'country';
    }
    let params = {
      language: language,
      code: code,
      page: page,
      size: size,
      type: type,
    };
    this.props.onSearch(params);
  };

  //点击重置
  clearSearch = () => {
    this.setState(
      {
        provinceOptions: [],
        cityOptions: [],
        districtOptions: [],
        selectedProvince: undefined,
        selectedCity: undefined,
        selectedDistrict: undefined,
        selectedCountry: 'CHN000000000',
      },
      () => {
        this.getProvinceOptions();
        this.props.parentMessage(this.state.selectedCountry);
      }
    );
  };

  render() {
    const {
      loading,
      countryOptions,
      provinceOptions,
      cityOptions,
      districtOptions,

      selectedCountry,
      selectedProvince,
      selectedCity,
      selectedDistrict,
    } = this.state;
    return (
      <div className="search-city-wrap">
        <Spin spinning={loading}>
          <div className="country-province-city">
            {/*国家*/}
            <Col span={8}>
              <div className="filed-title"> {this.$t('city.level.country')} ：</div>
              <div className="filed-name">
                <Select
                  showSearch={true}
                  className="filed-name-select"
                  value={selectedCountry}
                  onChange={this.countryOptionsChange}
                  placeholder={this.$t('common.please.select')}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) > -1
                  }
                >
                  {countryOptions &&
                    countryOptions.length &&
                    countryOptions.map(item => {
                      return (
                        <Option key={item.code} value={item.code}>
                          {item.country}
                        </Option>
                      );
                    })}
                </Select>
              </div>
            </Col>

            {/*省/州*/}
            <Col span={8}>
              <div className="filed-title">{this.$t('city.level.province')}：</div>
              <div className="filed-name">
                <Select
                  showSearch={true}
                  allowClear={true}
                  className="filed-name-select"
                  value={selectedProvince}
                  onChange={this.provinceOptionsChange}
                  placeholder={this.$t('common.please.select')}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) > -1
                  }
                  disabled={
                    provinceOptions.length === 0 || provinceOptions.length === 1 ? true : false
                  }
                >
                  {this.state.provinceOptions.map(item => {
                    return (
                      <Option key={item.code} value={item.code}>
                        {item.state}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </Col>

            {/*市*/}
            <Col span={8}>
              <div className="filed-title">{this.$t('city.level.city')}：</div>
              <div className="filed-name">
                <Select
                  showSearch={true}
                  allowClear={true}
                  className="filed-name-select"
                  value={selectedCity}
                  onChange={this.cityOptionsChange}
                  placeholder={this.$t('common.please.select')}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  filterOption={(inputValue, option) =>
                    option.props.children.indexOf(inputValue) > -1
                  }
                  disabled={cityOptions.length === 0 || cityOptions.length === 1 ? true : false}
                >
                  {this.state.cityOptions.map(item => {
                    return (
                      <Option key={item.code} value={item.code}>
                        {item.city}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </Col>

            {/*/!*地区*!/*/}
            {/*<Col span={8}>*/}
            {/*<div className="filed-title">*/}
            {/*{this.$t('city.level.district')}：*/}
            {/*</div>*/}
            {/*<div className="filed-name">*/}
            {/*<Select*/}
            {/*className="filed-name-select"*/}
            {/*showSearch={true}*/}
            {/*value={selectedDistrict}*/}
            {/*onChange={this.districtOptionsChange}*/}
            {/*placeholder={this.$t('common.please.select')}*/}
            {/*getPopupContainer={triggerNode => triggerNode.parentNode}*/}
            {/*filterOption={(inputValue, option) => option.props.children.indexOf(inputValue) > -1}*/}
            {/*disabled={districtOptions.length === 0 || districtOptions.length === 1 ? true : false}>*/}
            {/*{this.state.districtOptions.map((item) => {*/}
            {/*return <Option key={item.code} value={item.code}>{item.district}</Option>*/}
            {/*})}*/}
            {/*</Select>*/}
            {/*</div>*/}
            {/*</Col>*/}

            {/*清除浮动*/}
            <div className="btn-wrap">
              <Button onClick={this.clearSearch}>{this.$t('common.reset')}</Button>
              &nbsp; &nbsp; &nbsp;
              <Button type="primary" loading={loading} onClick={this.handleSearch}>
                {this.$t('common.search')}
              </Button>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}

SearchCity.propTypes = {
  onSearch: PropTypes.func, // 点击搜索之后的回调：返回结果
  onClear: PropTypes.func, //点击取消的时候
  parentMessage: PropTypes.func,
};

SearchCity.defaultProps = {};

function mapStateToProps(state) {
  return {
    profile: state.login.profile,
    user: state.login.user,
    tenantMode: state.main.tenantMode,
    company: state.login.company,
    language: state.main.language,
  };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SearchCity);
