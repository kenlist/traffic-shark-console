class Arrow extends React.Component {
  render() {
    var arrow_left = null;
    var arrow_right = null;
    if (this.props.d == "l2r") {
      arrow_right = (<span className="arrow right"></span>);
    } else if (this.props.d = "r2l") {
      arrow_left = (<span className="arrow left"></span>);
    }

    return (
      <div className="arrow-container">
        <span className="arrow-text">{this.props.text_left}</span>
        {arrow_left}
        <span className="arrow-link"></span>
        <span className="arrow-text">{this.props.text}</span>
        <span className="arrow-link"></span>
        {arrow_right}
        <span className="arrow-text">{this.props.text_right}</span>
      </div>
    )
  }
}


class TrafficCaptureExampleTab extends React.Component {
  state = {
    data: [],
    height: 300
  }

  componentDidMount() { 
  }

  getPacketTopLayer(pkt) {
    var sortable_layer = [];
    for (var layer in pkt) {
      if (pkt[layer].hasOwnProperty('_idx_')) {
        if (layer != "raw") {
          sortable_layer.push([layer, pkt[layer]['_idx_']]);
        }
      }
    }

    sortable_layer.sort(function(a, b) {
      return a[1] - b[1];
    });

    return sortable_layer[sortable_layer.length - 1][0]
  }

  render() {
    if (!this.props.active) {
      return null;
    }

    return (
      <div className="example-container">
        {
          this.props.active.map(function(raw_packet) {
            if (!raw_packet.ip) {
              return null;
            }

            var top_layer = this.getPacketTopLayer(raw_packet);
            if (top_layer == "tcp") {
              return null;
            }

            var d = "l2r";
            var dst_ip = null;
            if (raw_packet.ip.src == this.props.ip) {
              dst_ip = raw_packet.ip.dst;
            } else {
              d = "r2l";
              dst_ip = raw_packet.ip.src;
            }

            return (
              <Arrow d={d} text_left={this.props.ip} text_right={dst_ip} text={top_layer}></Arrow>)
          }.bind(this))
        }
      </div>
    );
  }
}
