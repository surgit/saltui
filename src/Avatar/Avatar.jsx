/**
 * Avatar Component for SaltUI
 *
 *
 * Copyright 2014-2017, SaltUI Team.
 * All rights reserved.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { unitize } from '../Style';
import Context from '../Context';

const avatarColors = ['#78C06E', '#3BC2B5', '#78919D', '#5EC9F6', '#F6BF26'];
const defaultSrc = 'https://img.alicdn.com/tps/TB1.IgIKpXXXXbgXpXXXXXXXXXX-116-116.png';
const global = Context.getGlobal('avatar') || {};
const iconWrapperStyle = {
  position: 'absolute',
  lineHeight: 1,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

export default class Avatar extends Component {
  static hashCode = (strKey, isLong) => {
    const MAX_VALUE = 0x7fffffff;
    const MIN_VALUE = -0x80000000;
    const intValue = (num) => {
      if (num > MAX_VALUE || num < MIN_VALUE) {
        return num & 0xFFFFFFFF; // eslint-disable-line no-bitwise
      }
      return num;
    };

    let hash = 0;
    if (typeof strKey === 'string') {
      for (let i = 0, l = strKey.length; i < l; i += 1) {
        hash = (hash * 31) + strKey.charCodeAt(i);
        if (!isLong) {
          hash = intValue(hash);
        }
      }
    }
    return hash;
  };

  static formatName = (name, customFilter) => {
    let formattedName = name;
    const isEnglishName = /^[A-Za-z,. ]+$/.test(formattedName);
    const defaultNameFilter = prevName => prevName.replace(/[()（）\d]/g, '');
    const filter = customFilter || defaultNameFilter;
    formattedName = filter(formattedName).replace(/[,. ]+/g, isEnglishName ? ' ' : '');
    if (formattedName.indexOf(' ') !== -1) {
      formattedName = formattedName.split(' ').map(p => p.slice(0, 1)).join('');
    }
    return isEnglishName
      ? formattedName.slice(0, 2)
      : formattedName.slice(formattedName.length - 2, formattedName.length);
  };

  static displayName = 'Avatar';

  static propTypes = {
    className: PropTypes.string,
    colors: PropTypes.array,
    defaultColor: PropTypes.string,
    defaultSrc: PropTypes.string,
    hashCode: PropTypes.func,
    icon: PropTypes.element,
    isLong: PropTypes.bool,
    name: PropTypes.string,
    size: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    src: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    colors: global.colors || avatarColors,
    defaultColor: '',
    defaultSrc: global.defaultSrc || defaultSrc,
    hashCode: global.hashCode || Avatar.hashCode,
    icon: null,
    isLong: false,
    name: '',
    size: 'normal',
    src: '',
    style: {},
  };

  getStyle() {
    let size;
    switch (this.props.size) {
      case 'normal':
        size = '40px';
        break;
      case 'large':
        size = '48px';
        break;
      default:
        size = unitize(this.props.size);
    }
    return {
      width: size,
      height: size,
      lineHeight: size,
      fontSize: '14px',
      position: 'relative',
      ...this.props.style,
    };
  }

  render() {
    const { props } = this;
    const style = this.getStyle();
    if ((!props.name && !props.icon) || props.src) {
      return (
        <img
          ref={(r) => { this.root = r; }}
          className={classnames(Context.prefixClass('avatar'), { [props.className]: !!props.className })}
          src={props.src || props.defaultSrc}
          style={style}
          alt=""
        />
      );
    }
    if (props.defaultColor) {
      style.backgroundColor = props.defaultColor;
      if (console && console.warn) {
        console.warn('Avatar: defaultColor is deprecated, use colors instead.');
      }
    } else if (props.colors.length === 1) {
      [style.backgroundColor] = props.colors;
    } else {
      const hashCode = props.hashCode(props.name, props.isLong);
      style.backgroundColor = props.colors[Math.abs(hashCode) % props.colors.length];
    }
    return (
      <div
        ref={(r) => { this.root = r; }}
        className={classnames(Context.prefixClass('avatar'), { [props.className]: !!props.className })}
        style={style}
      >
        {
          props.icon
            ? <span style={iconWrapperStyle}>{props.icon}</span>
            : Avatar.formatName(props.name, props.filter)
        }
      </div>
    );
  }
}
