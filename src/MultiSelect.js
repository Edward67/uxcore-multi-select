/**
 * MultiSelect Component for uxcore
 * @author peijie.dpj
 *
 * Copyright 2014-2015, Uxcore Team, Alinw.
 * All rights reserved.
 */


let {Dropdown, Menu} = require('uxcore-dropdown');
let CheckboxGroup = require('uxcore-checkbox-group');
let Button = require('uxcore-button');
let assign = require('object-assign');

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };

    this.lastValue = this.props.value || [];
  }

  handleClick(type) {
    this.setState({
      visible: type == null ? !this.state.visible : type
    })
  }

  handleChange(value) {
    let me = this,
      props = this.props;

    let newValue = [];
    if (props.maxSelect && value.length > props.maxSelect) {
      newValue = me.lastValue;
    } else {
      newValue = value;
      me.lastValue = value;
    }

    props.onChange(newValue);
  }

  handleSelectAll() {
    let me = this,
      props = this.props;

    let valueList = [];
    if (props.disabled) {
      return;
    } else {
      React.Children.map(props.children, function (item) {
        if (!item.props.disabled || me._hasSelected.call(me, item.props.value)) {
          valueList.push(item.props.value);
        }
      });
    }

    props.onChange(valueList);
  }

  handleClear() {
    let me = this,
      props = this.props;

    let valueList = [];

    if (props.disabled) {
      return;
    } else {
      React.Children.map(props.children, function (item) {
        if (item.props.disabled && me._hasSelected.call(me, item.props.value)) {
          valueList.push(item.props.value);
        }
      })
    }

    props.onChange(valueList);
  }

  handleSubmit() {
    let me = this,
      props = this.props;

    let labelList = [],
        valueList = [];

    React.Children.map(props.children, function (item) {
      if (me._hasSelected.call(me, item.props.value)) {
        labelList.push(item.props[props.optionLabelProp]);
        valueList.push(item.props.value);
      }
    });

    props.onSubmit(valueList, labelList);

    me.setState({
      visible: false
    })
  }

  _processLabel(type) {
    let me = this,
      props = this.props;

    let res = [];
    res = React.Children.map(props.children, function (item) {
      if (me._hasSelected.call(me, item.props.value)) {
        switch (type) {
          case 'content':
            return <span className={`${me.props.prefixCls}-selection__choice__content`}>{item.props[props.optionLabelProp]}
              <span className={`${me.props.prefixCls}-selection__choice__break`}>{props.titleBreakStr}</span></span>;
            break;

          case 'title':
            return item.props[props.optionLabelProp] + props.titleBreakStr
            break;
        }
      }
    });

    if (res.length == 0) {
      switch (type) {
        case 'content':
          res = <span className={`${me.props.prefixCls}-selection__placeholder`}>{me.props.placeholder}</span>
          break;

        case 'title':
          res = [me.props.placeholder];
              break;
      }
    } else {
      if (type == 'title') {
        let len = res.length;
        res[len - 1] = res[len - 1].slice(0, res[len - 1].length - 1);
      }
    }

    return type == 'title' ? res.join('') : res;
  }

  _hasSelected(value) {
    let me = this;

    return me.props.value.indexOf(value) != -1;
  }

  _handleVisbleChange(visible) {
    this.setState({
      visible: visible
    })
  }

  render() {
    let me = this,
      props = this.props;

    // 检查是否可以点击 全选
    let canSelectItemNumbers = 0;

    React.Children.map(props.children, function (item, index) {
      !item.props.disabled && canSelectItemNumbers++;
    });

    let menu =
      <div className={`${me.props.prefixCls}-dropdown-border`}>
        <div className={`${me.props.prefixCls}-content`}>
          <CheckboxGroup onChange={me.handleChange.bind(me)}
                         value={me.props.value}>
            {React.Children.map(props.children, function (item, index) {
                return <CheckboxGroup.Item {...item.props} key={index} jsxdisabled={me.props.disabled} />
              })
            }
          </CheckboxGroup>

        </div>
        <div className={`${me.props.prefixCls}-footer`}>
          {!!props.maxSelect && <p>最多选{props.maxSelect}个</p>}
          <Button additionClass={`${me.props.prefixCls}-button${props.showSelectAll ? '' : '-hidden'}`}
                  size="small"
                  disabled={(props.maxSelect && (props.maxSelect < canSelectItemNumbers)) ? true : false}
                  onClick={me.handleSelectAll.bind(me)}>全选
          </Button>

          <Button additionClass={`${me.props.prefixCls}-button${props.showClear ? '' : '-hidden'}`}
                  size="small"
                  onClick={me.handleClear.bind(me)}>清空
          </Button>

          <Button additionClass={`${me.props.prefixCls}-button`}
                  size="small"
                  onClick={me.handleSubmit.bind(me)}>确认
          </Button>
        </div>
      </div>;


    let cls = [];
    cls.push(me.props.prefixCls);
    cls.push(props.className);
    cls.push(me.state.visible ? `${me.props.prefixCls}-open` : '');
    cls = cls.join(' ');

    return (
      <div>
        <Dropdown overlay={menu}
                  minOverlayWidthMatchTrigger={false}
                  visible={me.state.visible}
                  onVisibleChange={me._handleVisbleChange.bind(me)}
                  trigger="click"
                  overlayClassName={`${me.props.prefixCls}-dropdown ${props.dropdownClassName}`}>
            <span className={`${cls} ${props.className} ${me.props.prefixCls}-${me.props.disabled ? 'disabled' : 'enabled'}`}>
                <span className={`${me.props.prefixCls}-selection ${me.props.prefixCls}-selection--multiple`}>
                    <span className={`${me.props.prefixCls}-selection--multiple--content`} title={me._processLabel('title')}>
                        {me._processLabel('content')}
                    </span>
                    <span className={`${me.props.prefixCls}-arrow`}></span>
                </span>
            </span>
        </Dropdown>
      </div>
    );
  }
}

MultiSelect.defaultProps = {
  prefixCls: 'kuma-multi-select',
  className: '',
  dropdownClassName: '',
  value: [],
  disabled: false,
  placeholder: '',
  titleBreakStr: "、",
  optionLabelProp: "text",
  showSelectAll: true,
  showClear: true,
  onChange: function(){},
  onSubmit: function(){}
}

MultiSelect.propTypes = {
  prefixCls: React.PropTypes.string,
  className: React.PropTypes.string,
  dropdownClassName: React.PropTypes.string,
  value: React.PropTypes.array,
  disabled: React.PropTypes.bool,
  maxSelect: React.PropTypes.number,
  placeholder: React.PropTypes.string,
  titleBreakStr: React.PropTypes.string,
  optionLabelProp: React.PropTypes.string,
  showSelectAll: React.PropTypes.bool,
  showClear: React.PropTypes.bool,
  onChange: React.PropTypes.func,
  onSubmit: React.PropTypes.func
}


// http://facebook.github.io/react/docs/reusable-components.html

MultiSelect.Item = CheckboxGroup.Item;

MultiSelect.displayName = "MultiSelect";

module.exports = MultiSelect;
