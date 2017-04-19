class ProfileNameSetting extends React.Component {
  render() {
    var link_state = this.props.link_state("name");
    var input = null
    if (this.props.editable) {
      input = <input id="inputProfileName" type="text" className="form-control" placeholder="Please Input Your Profile Name" valueLink={link_state} />
    } else {
      input = <span className="form-control">{link_state.value}</span>;
    }

    return (
      <div className="form-horizontal accordion">
        <div className="form-group">
          <label htmlFor="inputProfileName" className="col-sm-2 control-label">Profile Name</label>
            <div className="col-sm-10">
              {input}
            </div>
          </div>
        </div>
    );
  }
}

class LinkShapingNumberSetting extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var id = this.getIdentifier();
    var link_state = this.props.link_state("tc_setting-" + id);
    return (
      <div className="form-group">
        <label htmlFor={id} className="col-sm-3 control-label">{this.props.text}</label>
        <div className="col-sm-9">
          <input type="number" defaultValue={link_state.value} className="form-control" id={id} placeholder={this.props.placeholder} min="0" max={this.props.max_value} valueLink={link_state} />
        </div>
      </div>
    );
  }
}
IdentifyMixin(LinkShapingNumberSetting);

class CollapseableInputList extends React.Component {
  render() {
    return (
      <fieldset className="accordion-group">
        <legend>{this.props.text}</legend>
        {this.props.children}
      </fieldset>
    );
  }
}

class CollapseableInputGroup extends React.Component {
  state = {collapsed: true}

  handleClick(e) {
    this.setState({collapsed: !this.state.collapsed})
  }

  render() {
    var id = this.getIdentifier.bind(this)();
    var text = this.state.collapsed ? 'Show more' : 'Show less';
    return (
      <div>
        <div className="accordion-heading">
          <a className="accordion-toggle" data-toggle="collapse" data-target={"#" + id} href="#" onClick={this.handleClick.bind(this)}>{text}</a>
        </div>
        <div className="accordion-body collapse" id={id}>
          <div className="accordion-inner">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
IdentifyMixin(CollapseableInputGroup);

class LinkShapingSettings extends React.Component {
  render() {
    var d = this.props.direction;
    return (
      <div>
        <h4>{capitalizeFirstLetter(d) + "link"}:</h4>
        <div className="well" id={d + "_well"}>
          <div className="form-horizontal accordion">
            <CollapseableInputList text="Bandwidth">
              <LinkShapingNumberSetting params={[d, "rate"]} text="Rate" placeholder="in kbps" link_state={this.props.link_state} />
            </CollapseableInputList>
            <CollapseableInputList text="Latency">
              <LinkShapingNumberSetting params={[d, "delay", "delay"]} text="Delay" placeholder="in ms" link_state={this.props.link_state} />
              <CollapseableInputGroup params={[d, "delay", "collapse"]}>
                <LinkShapingNumberSetting params={[d, "delay","jitter"]} text="Jitter" placeholder="in %" link_state={this.props.link_state} />
                <LinkShapingNumberSetting params={[d, "delay", "correlation"]} text="Correlation" placeholder="in %" link_state={this.props.link_state} />
              </CollapseableInputGroup>
            </CollapseableInputList>
            <CollapseableInputList text="Loss">
              <LinkShapingNumberSetting params={[d, "loss", "percentage"]} text="Percentage" placeholder="in %" link_state={this.props.link_state} />
              <CollapseableInputGroup params={[d, "loss", "collapse"]}>
                <LinkShapingNumberSetting params={[d, "loss", "correlation"]} text="Correlation" placeholder="in %" link_state={this.props.link_state} />
              </CollapseableInputGroup>
            </CollapseableInputList>
            <CollapseableInputList text="Corruption">
              <LinkShapingNumberSetting params={[d, "corruption", "percentage"]} text="Percentage" placeholder="in %" link_state={this.props.link_state} />
              <CollapseableInputGroup params={[d, "corruption", "collapse"]}>
                <LinkShapingNumberSetting params={[d, "corruption", "correlation"]} text="Correlation" placeholder="in %" link_state={this.props.link_state} />
              </CollapseableInputGroup>
            </CollapseableInputList>
            <CollapseableInputList text="Reorder">
              <LinkShapingNumberSetting params={[d, "reorder", "percentage"]} text="Percentage" placeholder="in %" link_state={this.props.link_state} />
              <CollapseableInputGroup params={[d, "reorder", "collapse"]}>
                <LinkShapingNumberSetting params={[d, "reorder", "correlation"]} text="Correlation" placeholder="in %" link_state={this.props.link_state} />
                <LinkShapingNumberSetting params={[d, "reorder", "gap"]} text="Gap" placeholder="integer" link_state={this.props.link_state}/>
              </CollapseableInputGroup>
            </CollapseableInputList>
          </div>
        </div>
      </div>
    );
  }
}

class ProfileSettingPanel extends React.Component {
  state = {
    name: this.props.name,
    tc_setting: this.props.tc_setting ? this.props.tc_setting : new TSSettings().getDefaultSettings()
  }

  handleConfirmClick(e) {
    // alert(JSON.stringify(this.state));
    if (this.props.onProfileConfirm) {
      this.props.onProfileConfirm(this.state);
    }
    hidePanel();
  }

  handleCancelClick(e) {
    hidePanel();
  }

  render() {
    var link_state = this.linkState.bind(this);

    return (
      <div>
          <button id="rightButton" type="button" className="btn btn-success pull-right" onClick={this.handleConfirmClick.bind(this)}>
            Confirm
          </button>        
          <button id="leftButton" type="button" className="btn btn-danger pull-right" onClick={this.handleCancelClick.bind(this)}>
            Cancel
          </button>
      
        <div className="page-header">
          <h1><small>{this.props.name ? "Edit" : "New"} Profile</small></h1>
        </div>
        
        <ProfileNameSetting link_state={link_state} editable={!this.props.name} />

        <div className="row">
          <div className="col-md-6">
            <LinkShapingSettings direction="up" link_state={link_state} />
          </div>        
          <div className="col-md-6">
            <LinkShapingSettings direction="down" link_state={link_state} />
          </div>
        </div>

      </div>
    );
  }
}
RecursiveLinkStateMixin(ProfileSettingPanel)
