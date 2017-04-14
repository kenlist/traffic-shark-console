var ERROR_EXPIRY = 10000;

var ts_status = {
  OFFLINE: 0,
  ACTIVE: 1,
  INACTIVE: 2,
  OUTDATED: 3,
};

var NOTIFICATION_TYPES = {
  "error": "danger",
  "info": "info",
  "warn": "warning",
  "success": "success",
};

var NotificationPanel = React.createClass({
  render: function() {
    var notifyNodes = this.props.notifications.map(function(item, idx, arr) {
      var timeout = Math.floor((item.expire_at - new Date().getTime()) / 1000)
      var cls = "alert alert-" + (NOTIFICATION_TYPES[item.type] || item.type);
      return (
        <div className={cls} role="alert">
          <div className="row">
            <div className="col-md-11">{item.message}</div>
            <div className="col-md-1">{timeout}</div>
          </div>
        </div>
      );
    });
    if (notifyNodes.length == 0) {
      notifyNodes = (
        <i>No notifications.</i>
      );
    }
    return (
      <div className="panel-group" id="accordionNotify" role="tablist" aria-multiselectable="false">
        <div className="panel panel-default">
          <div className="panel-heading" data-toggle="collapse" data-parent="#accordionNotify" href="#collapseNotify" aria-expanded="true" aria-controls="collapseNotify">
            <h3 className="panel-title">
              notifications{notifyNodes.length}
            </h3>
          </div>
          <div id="collapseNotify" className="panel-collapse collapse in" role="tabpanel">
            <div className="panel-body">
              {notifyNodes}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var TrafficSharkUI = React.createClass({
  mixins: [RecursiveLinkStateMixin], 
  getInitialState: function() {
    test_setting = new TSSettings().getDefaultSettings();
    test_setting["up"]["rate"] = 100;
    test_setting["up"]["delay"]["delay"] = 5;
    test_setting["down"]["rate"] = 150;
    test_setting["down"]["delay"]["delay"] = 5;

    return {
      client: new TSRestClient(this.props.endpoint),
      profiles: {
        // "test": test_setting
      },
      mcontrols: {},
      status: ts_status.OFFLINE,
      notifications: [],
      current_profile: null,
    };
  },

  notify: function(type, msg) {
    this.setState(function(state, props) {
      return {
        notifications: state.notifications.concat({
          expire_at: ERROR_EXPIRY + new Date().getTime(),
          message: msg,
          type: type,
        })
      };
    });
  },

  error: function(prefix, result) {
    if (result.json && result.json.detail) {
        this.notify('error', prefix + JSON.stringify(result.json.detail));
      } else {
        this.notify('error', prefix + '{status:' + result.status + '}');
      }
  },

  expireNotifications: function() {
    this.setState(function(state, props) {
      return {
        notifications: state.notifications.filter(function(item, idx, arr) {
          return item.expire_at >= new Date().getTime();
        })
      }
    });
  },

  componentDidMount: function() {
    this.expiry_interval = setInterval(this.expireNotifications, 1000);
    this.state.client.getProfiles(function(result) {
      if (result.status >= 200 && result.status < 300) {
        this.setState({
          profiles:result.json
        });
      } else {
        this.error('Error: ', result);
      }
    }.bind(this));

    this.onMCRefresh();
  },

  componentWillUnmount: function() {
    if (this.expiry_interval != null) {
      clearInterval(this.expiry_interval);
    }
  },

  onProfileUpdate: function(profile) {
    //todo: update profiles if there is changed(add or update or remove)
    if (!profile.tc_setting) {
      //remove
    //   delete this.state.profiles[profile.name];
      this.forceUpdate();
      return;
    }

    //check profile change
    if (objectEquals(this.state.profiles[profile.name], profile.tc_setting)) {
      // no change
      return;
    }

    this.state.client.addProfile(function(result) {
      //create or edit
      if (result.status >= 200 && result.status < 300) {
        // add success
        this.state.profiles[profile.name] = profile.tc_setting;
        this.forceUpdate();
        this.notify('success', 'Profile Update Success');
      } else {
        this.error('Profile Update Error: ', result);
      }
    }.bind(this), profile);
  },

  onMCRefresh: function(need_notify) {
    this.state.client.getMachineControls(function(result) {
      if (result.status >= 200 && result.status < 300) {
        // alert(JSON.stringify(result))
        this.setState({
          mcontrols:result.json
        });
        if (need_notify) {
          this.notify('success', 'Refresh Success!');
        }
        this.forceUpdate();
      } else {
        this.error('Error: ', result);
      }
    }.bind(this));
  },

  render: function() {
    link_state = this.linkState;
    return (
      <div>
        <NotificationPanel notifications={this.state.notifications} />
        <MachineSettingPanel mcontrols={this.state.mcontrols} notify={this.notify} onMCRefresh={this.onMCRefresh} profiles={this.state.profiles} client={this.state.client} error={this.error} />
        <ProfilePanel link_state={this.props.link_state} notify={this.notify} profiles={this.state.profiles} onProfileUpdate={this.onProfileUpdate} />
      </div>
    )
  }
});