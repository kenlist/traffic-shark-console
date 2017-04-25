function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * RecursiveLinkStateMixin is a LinkState alternative that can update keys in
 * a dictionnary recursively.
 * You can either give it a string of keys separated by a underscore (_)
 * or a list of keys
 */
var RecursiveLinkStateMixin = function (klass) {
  var LinkStateObject = {
    linkState(path) {
      function setPath(obj, path, value) {
        var leaf = resolvePath(obj, path);
        leaf.obj[leaf.key] = value;
      }

      function getPath(obj, path) {
        var leaf = resolvePath(obj, path);
        return leaf.obj[leaf.key];
      }

      function resolvePath(obj, keys) {
        if (typeof keys === 'string') {
          keys = keys.split('-');
        }
        var lastIndex = keys.length - 1;
        var current = obj;
        for (var i = 0; i < lastIndex; i++) {
          var key = keys[i];
          current = current[key];
        }
        return {
          obj: current,
          key: keys[lastIndex]
        };
      }

      return {
        value: getPath(this.state, path),
        requestChange: function(newValue) {
          setPath(this.state, path, newValue);
          this.forceUpdate();

          if (this.onlinkStateChange) {
            this.onlinkStateChange(newValue);
          }
        }.bind(this)
      };
    }
  }

  return mixins({
    linkState: mixins.ONCE,
  })(klass.prototype, LinkStateObject);
};

var IdentifyMixin = function(klass) {
  var IdentifyableObject = {
    getIdentifier() {
      return this.props.params.join('-');
    }
  };

  return mixins({
    getIdentifier: mixins.ONCE,
  })(klass.prototype, IdentifyableObject);
};


function objectEquals(x, y) {
  if (typeof(x) === 'number') {
    x = x.toString();
  }
  if (typeof(y) === 'number') {
    y = y.toString();
  }
  if (typeof(x) != typeof(y)) {
    return false;
  }

  if (Array.isArray(x) || Array.isArray(y)) {
    return x.toString() === y.toString();
  }

  if (x === null && y === null) {
    return true;
  }

  if (typeof(x) === 'object' && x !== null) {
    var x_keys = Object.keys(x);
    var y_keys = Object.keys(y);
    if (x_keys.sort().toString() !== y_keys.sort().toString()) {
      console.error('Object do not have the same keys: ' +
        x_keys.sort().toString() + ' vs ' +
        y_keys.sort().toString()
      );
      return false;
    }
    var equals = true;
    x_keys.forEach(function (key, index) {
        equals &= objectEquals(x[key], y[key]);
    });
    return equals;
  }
  return x.toString() === y.toString();
}

//for test
    // if (!window.test_notify) {
    //   var p = this.props;
    //   var t = setTimeout(function() {
    //     p.notify("warn", JSON.stringify(p.link_state("settings")));
    //   }, 100);
    //   window.test_notify = true;
    // }

// for modal box
function showPanel() {
  $('#modalOverlay').show();
  $('#modalContainer').show();
}

function hidePanel() {
  $('#modalOverlay').hide();
  $('#modalContainer').hide();
  ReactDOM.unmountComponentAtNode(document.getElementById('modalContainer'));
}

Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}