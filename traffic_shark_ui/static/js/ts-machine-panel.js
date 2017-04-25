class RefreshButton extends React.Component {
  render() {
    var button_values = [
      {
        message: "Refresh",
        css: "warning"
      },
      {
        message: "Refresh",
        css: "success"
      }
    ];

    // content = button_values[this.props.status];
    var content = button_values[1];
    return (
      <button type="button" id={this.props.id} className={"btn btn-" + content.css + " pull-right"} onClick={this.props.onClick}>
        {content.message}
      </button>
    )
  }
}

class ControlButton extends React.Component {
  render() {
    var btn = null;
    if (this.props.is_shaping) {
      btn = <button type="button" className="btn btn-warning btn-sm" disabled={this.props.disabled} onClick={this.props.onUnshapeClick}>Turn Off</button>
    } else {
      btn = <button type="button" className="btn btn-primary btn-sm" disabled={this.props.disabled} onClick={this.props.onShapeClick}>Turn On</button>
    }
    return btn;
  }
}

class UpdateButton extends React.Component {
  render() {
    return <button type="button" className="btn btn-default btn-sm rightbtn" disabled={this.props.disabled} onClick={this.props.onClick}>Update</button>
  }
}

class CaptureButton extends React.Component {
  render() {
    return <button type="button" className="btn btn-default btn-sm rightbtn" onClick={this.props.onClick}>Capture</button>
  }
}

class ProfileSelector extends React.Component {
  onSelectChange(e) {
    if (this.props.onProfileChange) {
      this.props.onProfileChange(this.props.mac, e.target.value);
    }
  }

  render() {
    var options = [];
    for (var name in this.props.profiles) {
      options.push(<option value={name}>{name}</option>);
    }

    return (
      <select className="form-control" onChange={this.onSelectChange.bind(this)} disabled={this.props.disabled} value={this.props.current_name ? this.props.current_name : false}>
        <option disabled selected value={false}> -- select a profile -- </option>
        {options}
      </select>
    )
  }
}

class MachineSettingPanel extends React.Component {
  handleRefreshClick(e) {
    if (e.type = 'click') {
      if (this.props.onMCRefresh) {
        this.props.onMCRefresh(true);
      }
    }
  }

  checkAndUpdateMC(mac, next_step) {
    var mc = this.props.mcontrols[mac];
    if (mc['new_profile_name'] && mc['profile_name'] != mc['new_profile_name']) {
      var update_mc = {
        mac: mac,
        state: {
          ip: mc['ip'],
          profile_name: mc['new_profile_name'],
        }
      }

      this.props.client.updateMachineControl(function(result) {
        if (result.status >= 200 && result.status < 300) {
          mc['profile_name'] = mc['new_profile_name']

          this.props.notify('success', 'Update Success!');
          this.forceUpdate();
          if (next_step) {
            next_step();
          }
        } else {
          this.props.error('Update MachineControl Failed: ', result);
        }
      }.bind(this), update_mc);
    } else if (next_step) {
      next_step();
    }
  }

  handleUpdateClick(mac, e) {
    if (e.type == 'click') {
      this.checkAndUpdateMC(mac);
    }
  }

  handleShapeClick(mac, e) {
    if (e.type == 'click') {
      // check profile
      this.checkAndUpdateMC(mac, function() {
        this.props.client.shapeMachine(function(result) {
          if (result.status >= 200 && result.status < 300) {
            this.props.mcontrols[mac]['is_shaping'] = true;

            this.props.notify('success', 'Shape Machine Success: ' + mac);
            this.forceUpdate();
          } else {
            this.props.error('Shape Machine Failed: ', result);
          }
        }.bind(this), mac);

      }.bind(this));
    }
  }

  handleUnshapeClick(mac, e) {
    if (e.type == 'click') {
      this.props.client.unshapeMachine(function(result) {
        if (result.status >= 200 && result.status < 300) {
          this.props.mcontrols[mac]['is_shaping'] = false;

          this.props.notify('success', 'Unshape Machine Success: ' + mac);
          this.forceUpdate();
        } else {
          this.props.error('Unshape Machine Failed: ', result);
        }
      }.bind(this), mac);
    }
  }

  handleCaptureClick(mac, ip, e) {
    if (e.type == 'click') {
      ReactDOM.render(
        <div className="mb-content">
          <CapturePanel notify={this.props.notify} onProfileConfirm={null} mac={mac} ip={ip} client={this.props.client} mcontrol={this.props.mcontrols[mac]} error={this.props.error} />
        </div>, document.getElementById('modalContainer'));
      showPanel();
    }
  }

  onProfileChange(mac, new_profile_name) {
    var mc = this.props.mcontrols[mac];
    mc["new_profile_name"] = new_profile_name;
    this.forceUpdate();
  }

  // <RefreshButton id="refresh_button" onClick={this.handleRefreshClick} />
  render() {
    function getSortedMCList(mcontrols) {
      var mc_list = [];
      for (var mac in mcontrols) {
        var mc = mcontrols[mac];
        mc['mac'] = mac;
        mc_list.push(mc);
      }

      mc_list.sort(function(o, p) {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
          a = o['last_update_time'];
          b = p['last_update_time'];
          return b - a;
        }
      });
      return mc_list;
    };

    var mc_render_list = null;
    var mc_list = getSortedMCList(this.props.mcontrols);
    if (mc_list.length > 0) {
      mc_render_list = [];
      for (var i in mc_list) {
        var mc = mc_list[i];
        var mac = mc['mac'];
        var profile_name = mc["new_profile_name"] ? mc["new_profile_name"] : mc["profile_name"]
        var is_control_disabled = !mc["online"] || !profile_name;
        var is_update_disabled = !mc["new_profile_name"] || mc["new_profile_name"] == mc["profile_name"];
        mc_render_list.push(
          <tr>
            <td>{Number(i) + 1}</td>
            <td>
              <kbd className={mc["online"] ? "online" : "offline"}>{mac}</kbd>
              <div><code>{mc["online"] ? mc["ip"] : "offline"}</code></div>
            </td>
            <td>
              <ProfileSelector profiles={this.props.profiles} current_name={profile_name} onProfileChange={this.onProfileChange.bind(this)} mac={mac} disabled={!mc["online"]}/>
            </td>
            <td>
              <ControlButton is_shaping={mc["is_shaping"]} onShapeClick={this.handleShapeClick.bind(this, mac)} onUnshapeClick={this.handleUnshapeClick.bind(this, mac)} disabled={is_control_disabled}/>
              <UpdateButton disabled={is_update_disabled} onClick={this.handleUpdateClick.bind(this, mac)} />
              <CaptureButton onClick={this.handleCaptureClick.bind(this, mac, mc["ip"])} />
            </td>
          </tr>
        );
      }
    }

    return (
      <div className="panel-group" id="accordion3" role="tablist" aria-multiselectable="false">
        <div className="panel panel-default">
          <div className="panel-heading" data-toggle="collapse" data-parent="#accordion3" href="#collapseMachineSettings" aria-expanded="true" aria-controls="collapseMachineSettings">
              <h4 className="panel-title">
                  Machine Settings
              </h4>
          </div>
          <div id="collapseMachineSettings" className="panel-collapse collapse in" role="tabpanel">
            <div className="panel-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Machine Address</th>
                    <th>Profile</th>
                    <th>Control</th>
                  </tr>
                </thead>
                <tbody>
                  {mc_render_list}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}