import React from 'react';
import PropTypes from 'prop-types'
import { Button, Input, Select } from 'antd'
const Option = Select.Option;
import baseService from 'share/base.service'
import debounce from 'lodash.debounce';
import 'styles/components/location.scss'

class Location extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: {key: '', label: ''},
      options: []
    };
    this.selectFlag = false;
    this.search = debounce(this.search,500)
  }

  componentWillMount(){
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.value){
      try {
        let valueWillSet = JSON.parse(nextProps.value);
        const { value, options } = this.state;
        if((value.data && value.key !== valueWillSet.address
          && value.data.location && value.data.location.lng !== valueWillSet.longitude) || !value.data){
          this.setState({
            value: {
              key: valueWillSet.address,
              label: valueWillSet.address,
              selectFlag: valueWillSet.longitude ? true : false,
              data: {
                title: valueWillSet.address,
                location: {
                  lng: valueWillSet.longitude,
                  lat: valueWillSet.latitude
                }
              }
            }
          });
        }
      } catch(e) {
        console.log(e);
      }
    }else {
    /*  this.setState({
        value: {key: '', label: ''}
      })*/
    }
  }

  onChange = (changedValue) => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  select = (value) => {
    const { options } = this.state;
    if(value && value.key && options){
      options.map(option => {
        option.id === value.key && this.setState({
          value: {
            key: option.title,
            label: option.title,
            selectFlag: true,
            data: option
          }
        }, () => {
          let result = {
            address: option.title,
            longitude: option.location.lng,
            latitude: option.location.lat
          };
          this.onChange(JSON.stringify(result));
        })
      })
    }
  };
  //ant3.8对mode='combobox'做了调整，所以换了种方案实现
  search = (keyword, option) => {
    if(!keyword){
      this.setState({ options:[], value: {key: '', label: ''}}, () => {
        this.onChange(null);
      })
    }
    keyword  && baseService.searchLocation(keyword).then(res => {
      this.setState({ value: {key: keyword, label: keyword,selectFlag:false } });
      res.data.data && this.setState({ options: res.data.data })
    });
  };

  blur = () => {
    let {value} = this.state;
    if (!(value && value.selectFlag) && value) {
      let result = {
        address: value.key,
        longitude: '',
        latitude: ''
      };
      this.onChange(JSON.stringify(result));
    }
  };

  render() {
    const { options, value } = this.state;
    return (
      <div className="location">
        <Select mode="combobox"
                showSearch={true}
                labelInValue={true}
                value={value}
                onSelect={this.select}
                onBlur={this.blur}
                onSearch={this.search}
                style={{ width: '100%' }}
                filterOption={false}
                defaultActiveFirstOption={false}
                disabled={this.props.disabled}>
          {options.map(option => {
            return (
              <Option key={option.id}>
                <div>{option.title}</div>
                <div style={{ fontSize: 10, color: '' }}>{`${option.province}${option.city}${option.district}${option.address}`}</div>
              </Option>
            )
          })}
        </Select>
      </div>
    );
  }
}

Location.PropTypes = {
  onChange: PropTypes.func,  //进行选择后的回调
  value: PropTypes.string,  //值
  disabled: PropTypes.bool  //是否可编辑
};

Location.defaultProps = {
  disabled: false
};

Location.defaultProps = {};

export default Location;
