var ProfileNameSetting = React.createClass({
  render: function() {
    link_state = this.props.link_state("name");
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
});

var LinkShapingNumberSetting = React.createClass({
  mixins: [IdentifyableObject],
  render: function() {
    id = this.getIdentifier();
    link_state = this.props.link_state("tc_setting-" + id);
    return (
      <div className="form-group">
        <label htmlFor={id} className="col-sm-3 control-label">{this.props.text}</label>
        <div className="col-sm-9">
          <input type="number" defaultValue={link_state.value} className="form-control" id={id} placeholder={this.props.placeholder} min="0" max={this.props.max_value} valueLink={link_state} />
        </div>
      </div>
    );
  }
});

var CollapseableInputList = React.createClass({
  render: function() {
    return (
      <fieldset className="accordion-group">
        <legend>{this.props.text}</legend>
        {this.props.children}
      </fieldset>
    );
  }
});

var CollapseableInputGroup = React.createClass({
  mixins: [IdentifyableObject],
  getInitialState: function () {
    return {collapsed: true};
  },

  handleClick: function (e) {
    this.setState({collapsed: !this.state.collapsed})
  },

  render: function () {
    id = this.getIdentifier();
    var text = this.state.collapsed ? 'Show more' : 'Show less';
    return (
      <div>
        <div className="accordion-heading">
          <a className="accordion-toggle" data-toggle="collapse" data-target={"#" + id} href="#" onClick={this.handleClick}>{text}</a>
        </div>
        <div className="accordion-body collapse" id={id}>
          <div className="accordion-inner">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

var LinkShapingSettings = React.createClass({
  render: function() {
    d = this.props.direction;
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
});

var ProfileSettingPanel = React.createClass({
  mixins: [RecursiveLinkStateMixin],
  getInitialState: function() {
    return {
      name: this.props.name,
      tc_setting: this.props.tc_setting ? this.props.tc_setting : new TSSettings().getDefaultSettings()
    };
  },

  handleConfirmClick: function(e) {
    // alert(JSON.stringify(this.state));
    if (this.props.onProfileConfirm) {
      this.props.onProfileConfirm(this.state);
    }
    hidePanel();
  },

  handleCancelClick: function(e) {
    hidePanel();
  },

  render: function() {
    link_state = this.linkState;

    return (
      <div>
          <button id="confirmButton" type="button" className="btn btn-success pull-right" onClick={this.handleConfirmClick}>
            Confirm
          </button>        
          <button id="cancelButton" type="button" className="btn btn-danger pull-right" onClick={this.handleCancelClick}>
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
});

function showPanel() {
  $('#modalOverlay').show();
  $('#modalContainer').show();
}

function hidePanel() {
  $('#modalOverlay').hide();
  $('#modalContainer').hide();
  React.unmountComponentAtNode(document.getElementById('modalContainer'));
}
