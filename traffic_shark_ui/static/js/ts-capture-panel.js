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
  handleCancelClick(e) {
    hidePanel();
  }

  render() {
    return(
      <div>
        <button id="rightButton" type="button" className="btn btn-primary pull-right" onClick={this.handleCancelClick}>
          Start
        </button>
        <button id="leftButton" type="button" className="btn btn-danger pull-right" onClick={this.handleCancelClick}>
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
