function TSRestClient(endpoint) {
  this.endpoint = endpoint || '/api/v1/';
  function _add_ending_slash(string) {
    if (string[string.length - 1] != '/') {
      string += '/';
    }
    return string;
  }

  this.endpoint = _add_ending_slash(this.endpoint);

  this.api_call = function (method, urn, callback, data) {
    urn = _add_ending_slash(urn);
    // console.log("[" + method + "]" + this.endpoint + urn + "?" + JSON.stringify(data))
    $.ajax({
      url: this.endpoint + urn,
      dataType: 'json',
      type: method,
      data: data && JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      complete: function(xhr, status) {
        var rc = {
          status: (xhr.status ? xhr.status : status),
          json: xhr.responseJSON,
        };

        if (callback != undefined) {
          callback(rc);
        }
      },
      timeout: 10000
    });
  };
}

TSRestClient.prototype.getProfiles = function(callback) {
  this.api_call('GET', 'profile', callback);
}

TSRestClient.prototype.addProfile = function(callback, profile) {
  this.api_call('POST', 'profile', callback, profile);
}

TSRestClient.prototype.removeProfile = function(callback, name) {
  this.api_call('DELETE', 'profile', callback, name);
}

TSRestClient.prototype.getMachineControls = function(callback) {
  this.api_call('GET', 'mc', callback)
}

TSRestClient.prototype.updateMachineControl = function(callback, mc) {
  this.api_call('PATCH', 'mc', callback, mc);
}

TSRestClient.prototype.shapeMachine = function(callback, mac) {
  this.api_call('POST', 'mc', callback, mac);
}

TSRestClient.prototype.unshapeMachine = function(callback, mac) {
  this.api_call('DELETE', 'mc', callback, mac);
}

TSRestClient.prototype.getCapturePackets = function(callback, mac) {
  this.api_call('GET', 'capture/' + mac, callback);
}

TSRestClient.prototype.startCapture = function(callback, mac) {
  this.api_call('POST', 'capture', callback, mac);
}

TSRestClient.prototype.stopCapture = function(callback, mac) {
  this.api_call('DELETE', 'capture', callback, mac);
}

function TSSettings() {
  this.defaults = {
    'up': {
      'rate': null,
      'delay': {
        'delay': 0,
        'jitter': 0,
        'correlation': 0
      },
      'loss': {
        'percentage': 0,
        'correlation': 0
      },
      'reorder': {
        'percentage': 0,
        'correlation': 0
      },
      'corruption': {
          'percentage': 0,
          'correlation': 0
      },
      'iptables_options': Array(),
    },
    'down': {
      'rate': null,
      'delay': {
        'delay': 0,
        'jitter': 0,
        'correlation': 0
      },
      'loss': {
        'percentage': 0,
        'correlation': 0
      },
      'reorder': {
        'percentage': 0,
        'correlation': 0,
        'gap': 0
      },
      'corruption': {
          'percentage': 0,
          'correlation': 0
      },
      'iptables_options': Array(),
    }
  };

  this.getDefaultSettings = function() {
    return $.extend(true, {}, this.defaults);
  };

  this.mergeWithDefaultSettings = function(data) {
    return $.extend(true, {}, this.defaults, data);
  };
}






