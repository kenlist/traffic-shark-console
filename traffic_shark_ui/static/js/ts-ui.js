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

class NotificationPanel extends React.Component {
  render() {
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
};

class TrafficSharkUI extends React.Component {
  constructor(props) {
    super(props)
    // test_setting = new TSSettings().getDefaultSettings();
    // test_setting["up"]["rate"] = 100;
    // test_setting["up"]["delay"]["delay"] = 5;
    // test_setting["down"]["rate"] = 150;
    // test_setting["down"]["delay"]["delay"] = 5;

    this.state = {
      client: new TSRestClient(this.props.endpoint),
      profiles: {
        // "test": test_setting
      },
      mcontrols: {},
      status: ts_status.OFFLINE,
      notifications: [],
      current_profile: null,
    };
  }

  notify(type, msg) {
    this.setState((prevState, props) => {
      return {
        notifications: prevState.notifications.concat({
          expire_at: ERROR_EXPIRY + new Date().getTime(),
          message: msg,
          type: type,
        })
      };
    });
  }

  error(prefix, result) {
    if (result.json && result.json.detail) {
      this.notify('error', prefix + JSON.stringify(result.json.detail));
    } else {
      this.notify('error', prefix + '{status:' + result.status + '}');
    }
  }

  expireNotifications() {
    this.setState((prevState, props) => {
      return {
        notifications: prevState.notifications.filter(function(item, idx, arr) {
          return item.expire_at >= new Date().getTime();
        })
      };
    });
  }

  componentDidMount() {
    this.expiry_interval = setInterval(this.expireNotifications.bind(this), 1000);
    this.state.client.getProfiles(function(result) {
      if (result.status >= 200 && result.status < 300) {
        this.setState({
          profiles:result.json
        });
      } else {
        this.error('GetProfiles Error: ', result);
      }
    }.bind(this));

    this.onMCRefresh();
  }

  componentWillUnmount() {
    if (this.expiry_interval != null) {
      clearInterval(this.expiry_interval);
    }
  }

  onProfileUpdate(profile) {
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
  }

  onMCRefresh(need_notify) {
    this.state.client.getMachineControls(function(result) {
      if (result.status >= 200 && result.status < 300) {
        this.setState({
          mcontrols:result.json
        });
        if (need_notify) {
          this.notify('success', 'Refresh Success!');
        }
        this.forceUpdate();
      } else {
        this.error('Refresh Machine Controls Error: ', result);
      }
    }.bind(this));
  }

  render() {
    return (
      <div>
        <NotificationPanel notifications={this.state.notifications} />
        <MachineSettingPanel mcontrols={this.state.mcontrols} notify={this.notify.bind(this)} onMCRefresh={this.onMCRefresh.bind(this)} profiles={this.state.profiles} client={this.state.client} error={this.error.bind(this)} />
        <ProfilePanel notify={this.notify.bind(this)} profiles={this.state.profiles} onProfileUpdate={this.onProfileUpdate.bind(this)} />
      </div>
    )
  }
}


