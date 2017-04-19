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
  render() {
    return (
      <div>
        <ul className="nav nav-pills" role="tablist">
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
            return (
              <div role="tabpanel" className={"tab-pane" + (child.props.active ? " active" : "")} id={child.props.name}>
                {child}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class CapturePanel extends React.Component {
  handleStartCaptureClick(mac, e) {
    this.props.client.startCapture(function(result) {
      if (result.status >= 200 && result.status < 300) {
        this.props.mcontrol['is_capturing'] = true;

        this.props.notify('success', 'Start Capture Success: ' + mac);
        this.forceUpdate();
      } else {
        this.props.error('Start Capture Failed: ', result);
      }
    }.bind(this), mac);
  }

  handleStopCaptureClick(mac, e) {
    this.props.client.stopCapture(function(result) {
      if (result.status >= 200 && result.status < 300) {
        this.props.mcontrol['is_capturing'] = false;

        this.props.notify('success', 'Stop Capture Success: ' + mac);
        this.forceUpdate();
      } else {
        this.props.error('Stop Capture Failed: ', result);
      }
    }.bind(this), mac);
  }

  handleCancelClick(e) {
    hidePanel();
  }

  render() {
    return(
      <div>
        <CaptureControlButton is_capturing={this.props.mcontrol['is_capturing']} onStartClick={this.handleStartCaptureClick.bind(this, this.props.mac)} onStopClick={this.handleStopCaptureClick.bind(this, this.props.mac)} />
        <button type="button" className="btn btn-danger pull-right left-button" onClick={this.handleCancelClick.bind(this)}>
          Cancel
        </button>
      
        <div className="page-header">
          <h1><small>CapturePanel [{this.props.mac + "-" + this.props.ip}]</small></h1>
        </div>

        <TabControl>
          <TrafficCaptureGeneralTab name="traffic-general" label="General" active={true}/>
          <TrafficCaptureClassifyTab name="traffic-classify" label="Classify" />
        </TabControl>
      </div>
    );
  }
}
