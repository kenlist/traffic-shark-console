class ProfilePanel extends React.Component {
  onNewProfile(profile) {
    if (!profile.name) {
      this.props.notify("error", "New Profile failed: You must input a profile name!");
      return;
    }

    if (this.props.profiles[profile.name]) {
      this.props.notify("error", "New Profile failed: already has a profile name: [" + profile.name + "]!");
      return;
    }

    if (this.props.onProfileUpdate) {
      this.props.onProfileUpdate(profile);
    }
  }

  handleNewClick(e) {
    ReactDOM.render(
    <div className="mb-content">
      <ProfileSettingPanel notify={this.props.notify} onProfileConfirm={this.onNewProfile.bind(this)} />
    </div>, document.getElementById('modalContainer'));
    showPanel();
  }

  handleEditClick(profile_name, e) {
    var tc_setting = this.props.profiles[profile_name];
    ReactDOM.render(
    <div className="mb-content">
      <ProfileSettingPanel name={profile_name} tc_setting={tc_setting} onProfileConfirm={this.props.onProfileUpdate} />
    </div>, document.getElementById('modalContainer'));
    showPanel();
  }

  handleRemoveClick(profile_name, e) {
    if (e.type == "click") {
      if (confirm('Do you really want to remove profile:[' + profile_name + ']?')) {
        if (this.props.onProfileUpdate) {
          this.props.onProfileUpdate({
            name: profile_name
          })
        }
      }
    }
  }

  render() {
    function renderProperty(obj, keys, unit) {
      if (typeof keys === 'string') {
        keys = keys.split('-');
      }
      var current = obj;
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        current = current[key];
      }

      if (current) {
        return <code>{current}{unit}</code>
      }

      return null;
    }

    function renderProfile(profile, d) {
      var d_profile = profile[d];

      return (
        <span>
        {d}:
        {renderProperty(d_profile, "rate", "kbps")}
        {renderProperty(d_profile, "delay-delay", "(s)delay")}
        {renderProperty(d_profile, "loss-percentage", "%loss")}
        {renderProperty(d_profile, "reorder-percentage", "%reorder")}
        {renderProperty(d_profile, "corruption-percentage", "%corruption")}
        </span>
      );
    }

    var profile_list = null;
    if (Object.keys(this.props.profiles).length > 0) {
      profile_list = [];
      var count = 1;
      for (var name in this.props.profiles) {
        profile_list.push(
          <tr>
            <td>{count++}</td>
            <td><kbd>{name}</kbd></td>
            <td>
              <div className="vcenter propstr">{renderProfile(this.props.profiles[name], "up")}</div>
              <div className="vcenter propstr">{renderProfile(this.props.profiles[name], "down")}</div>
            </td>
            <td>
              <button type="button" className="btn btn-primary btn-sm firstbtn" onClick={this.handleEditClick.bind(this, name)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={this.handleRemoveClick.bind(this, name)}>
                Remove
              </button>
            </td>
          </tr>
        );
      }
    }

    return (
      <div className="panel-group" id="accordion-profile" role="tablist" aria-multiselectable="false">
        <div className="panel panel-default">
          <div className="panel-heading" data-toggle="collapse" data-parent="#accordion-profile" href="#collapseProfile" aria-expanded="true" aria-controls="collapseProfile">
              <h4 className="panel-title">
                  Network Profiles
              </h4>
          </div>
          <div id="collapseProfile" className="panel-collapse collapse in" role="tabpanel">
            <div className="panel-body">
              <button type="button" id="new_profile_button" className="btn btn-success pull-right" onClick={this.handleNewClick.bind(this)}>
                New Profile
              </button>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Profile Name</th>
                    <th>Setting</th>
                    <th>Control</th>
                  </tr>
                </thead>
                <tbody>
                  {profile_list}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
