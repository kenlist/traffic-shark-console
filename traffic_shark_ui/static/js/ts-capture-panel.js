class CaptureControlButton extends React.Component {
  render() {
    var btn = null;
    if (this.props.is_capturing) {
      btn = <button type="button" className="btn btn-warning pull-right right-button" onClick={this.props.onStopClick}>Stop Capture</button>
    } else {
      btn = <button type="button" className="btn btn-primary pull-right right-button" onClick={this.props.onStartClick}>Start Capture</button>
    }
    return btn;
  }
}

class TabControl extends React.Component {
  componentDidMount() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      if (this.props.onTabChange) {
        this.props.onTabChange(e.target.getAttribute("aria-controls"));
      }
    }.bind(this))
  }

  componentWillUnmount() {
  }

  render() {
    // console.log(this.props.packets)
    if (this.props.is_capturing || this.props.packets && this.props.packets.length != 0) {
      return (
        <div>
          <ul className="nav nav-tabs" role="tablist">
            {this.props.children.map(function(child) {
              return (
                <li role="presentation" className={child.props.active ? "active" : ""}>
                  <a href={"#" + child.props.name} aria-controls={child.props.name} role="tab" data-toggle="tab">
                    {child.props.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="tab-content">
            {this.props.children.map(function(child) {
              var output_child = child;
              if (child.props.active && child.props.active.length == 0) {
                output_child = (
                  <img className="loading-img" src='static/image/loading.gif'/>
                );
              }

              return (
                <div role="tabpanel" className={"tab-pane" + (child.props.active ? " active" : "")} id={child.props.name}>
                  {output_child}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      return (<div>Capture is not started yet.</div>)
    }
  }
}

class CapturePanel extends React.Component {
  state = {
    active_tab_name:"traffic-general",
    packets:[],
    fetch_interval:2000 // update per 2 secs
  }

  handleStartCaptureClick(mac, e) {
    this.props.client.startCapture(function(result) {
      if (result.status >= 200 && result.status < 300) {
        this.props.mcontrol['is_capturing'] = true;
        this.props.notify('success', 'Start Capture Success: ' + mac);
        this.forceUpdate();

        this.fetch_timer = setInterval(this.fetchPacketData.bind(this), this.state.fetch_interval);
        this.fetchPacketData();
      } else {
        this.props.error('Start Capture Failed: ', result);
      }
    }.bind(this), mac, $('#capture-packet-filter').val());
  }

  handleStopCaptureClick(mac, e) {
    this.props.client.stopCapture(function(result) {
      if (result.status >= 200 && result.status < 300) {
        this.props.mcontrol['is_capturing'] = false;

        this.props.notify('success', 'Stop Capture Success: ' + mac);
        this.forceUpdate();

        clearInterval(this.fetch_timer);
      } else {
        this.props.error('Stop Capture Failed: ', result);
      }
    }.bind(this), mac);
  }

  handleCancelClick(e) {
    hidePanel();
  }

  handleTabChange(tab_name) {
    this.setState({
      active_tab_name:tab_name
    });
  }

  fetchPacketData() {
    this.props.client.getCapturePackets(function(result) {
      if (result.status >= 200 && result.status < 300) {
          var packets = JSON.parse(result.json)
          this.setState({
            packets:packets
          });
      } else {
        this.props.error('GetPackets Error: ', result);
      }
    }.bind(this), this.props.mac);
  }

  activePackets(name) {
    return this.state.active_tab_name == name ? this.state.packets : null;
  }

  componentDidMount() {
    if (this.props.mcontrol['is_capturing']) {
      this.fetch_timer = setInterval(this.fetchPacketData.bind(this), this.state.fetch_interval);
      this.fetchPacketData();
    }

    this.capture_filter = this.props.mcontrol['capture_filter'];

    this.refs.captureFilterInput.value = this.capture_filter;
  }

  componentWillUnmount() {
    if (this.fetch_timer != null) {
      clearInterval(this.fetch_timer);
    }
  }

  render() {
    var is_capturing = this.props.mcontrol['is_capturing'];

    return(
      <div>
        <CaptureControlButton is_capturing={is_capturing} onStartClick={this.handleStartCaptureClick.bind(this, this.props.mac)} onStopClick={this.handleStopCaptureClick.bind(this, this.props.mac)} />
        <button type="button" className="btn btn-danger pull-right left-button" onClick={this.handleCancelClick.bind(this)}>
          Cancel
        </button>
      
        <div className="page-header">
          <h1><small>CapturePanel [{this.props.mac + "-" + this.props.ip}]</small></h1>
        </div>

        <div className="input-group filter-box">
          <span className="input-group-addon" id="capture-packet-filter-desc">{"host " + this.props.ip + " and "}</span>
          <input type="text" className="form-control" id="capture-packet-filter" aria-describedby="capture-packet-filter-desc" disabled={is_capturing} placeholder="custom packets filter" ref="captureFilterInput"/>
        </div>

        <TabControl is_capturing={is_capturing} packets={this.state.packets} onTabChange={this.handleTabChange.bind(this)} packets={this.state.packets}>
          <TrafficCaptureGeneralTab name="traffic-general" label="General" active={this.activePackets("traffic-general")} mac={this.props.mac} />
          <TrafficCaptureDetailTab name="traffic-detail" label="Detail" active={this.activePackets("traffic-detail")} mac={this.props.mac}/>
        </TabControl>
      </div>
    );
  }
}
