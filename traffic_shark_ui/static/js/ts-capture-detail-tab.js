class PacketDetailTabControl extends React.Component {
  render() {
    var pkt = this.props.pkt;

    var sortable_layer = [];
    for (var layer in pkt) {
      if (pkt[layer].hasOwnProperty('_idx_')) {
        sortable_layer.push([layer, pkt[layer]['_idx_']]);
      }
    }

    sortable_layer.sort(function(a, b) {
      return b[1] - a[1];
    });

    var ul_count = 0;
    var content_count = 0;

    return (<div className="accordian-body collapse" id={pkt._time_  * 10000}>
        <ul className="nav nav-pills nav-stacked col-xs-1" role="tablist">
          {

            sortable_layer.map(function(sl) {
              var sl_idx = sl[0] + pkt._time_ * 10000;
              ul_count++;
              return (<li role="presentation" className={ul_count == 1 ? "active" : ""}>
                  <a href={"#" + sl_idx} aria-controls={sl_idx} role="tab" data-toggle="tab">
                    {sl[0]}
                  </a>
                </li>);
            })
          }
        </ul>
        <div className="tab-content col-xs-11">
          {
            sortable_layer.map(function(sl) {
              var sl_idx = sl[0] + pkt._time_ * 10000;
              content_count++;

              var pkt_layer_output = [];
              var layer = pkt[sl[0]];
              for (var key in layer) {
                if (key[0] == '_') {    //private key
                  continue;
                }
                pkt_layer_output.push(<li className="col-xs-3">[{key}] : {layer[key]}</li>);
              }

              return (<div role="tabpanel" className={"tab-pane " + (content_count == 1 ? "active" : "")} id={sl_idx}>
                  <ul className="list-inline">
                    {pkt_layer_output}
                  </ul>
                </div>)
            })
          }
        </div>
      </div>);
  }
}

class TrafficCaptureDetailTab extends React.Component {
  getPacketLayerPath(pkt) {
    var sortable_layer = [];
    for (var layer in pkt) {
      if (pkt[layer].hasOwnProperty('_idx_')) {
        sortable_layer.push([layer, pkt[layer]['_idx_']]);
      }
    }

    sortable_layer.sort(function(a, b) {
      return a[1] - b[1];
    });

    var layer_path = "";
    for (var sl in sortable_layer) {
      layer_path += sortable_layer[sl][0] + (sl == sortable_layer.length - 1 ? "" : "/");
    }

    return layer_path;
  }

  render() {
    var raw_packets = this.props.active ? this.props.active.reverse() : [];
    // console.log(raw_packets);
    
    var packet_rows = [];
    for (var idx in raw_packets) {
      var pkt = raw_packets[idx];

      if (!pkt.ip) {
        continue;
      }

      var td_className = "col-xs-2 " + (idx == 0 ? "first-row" : "");
      packet_rows.push(
        <tr data-toggle="collapse" data-target={"#" + pkt._time_ * 10000} className="accordion-toggle">
          <td className={td_className}>{new Date(pkt._time_).format('yyyy-MM-dd hh:mm:ss +S')} </td>
          <td className={td_className}>{pkt.ip.src} </td>
          <td className={td_className}>{pkt.ip.dst} </td>
          <td className={td_className}>{pkt.ether._len_} bytes</td>
          <td className={td_className}>{this.getPacketLayerPath(pkt)}</td>
        </tr>);

      packet_rows.push(
        <tr>
          <td colSpan={5} className="hiddenRow">
            <PacketDetailTabControl pkt={pkt} />
          </td>
        </tr>);
    }

    return (
      <div>
        <div className="capture-detail-header">
          <table className="table table-condensed">
            <thead>
              <tr>
                <th className="col-xs-2">Time</th>
                <th className="col-xs-2">Source IP</th>
                <th className="col-xs-2">Destination IP</th>
                <th className="col-xs-2">Packet Size</th>
                <th className="col-xs-2">Packet Layers</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="capture-detail-content">
          <table className="table table-condensed">
            <tbody>
              {packet_rows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
