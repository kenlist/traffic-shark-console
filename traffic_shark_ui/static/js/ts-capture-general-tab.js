class TrafficChart extends React.Component {
  constructor(props, ...others) {
    super(props, ...others);
    this.Chart = createG2(chart => {
      chart.col('time', {
        type: 'time',
        mask: 'HH:MM:ss',
        tickCount: 12
      });
      // chart.col(props.data_key, {
      //   alias: props.key_name
      // })
      chart.legend({
        position: 'bottom'
      });
      chart.axis('time', {
        tickLine: {
          stroke: '#000',
          value: 6
        },
        title: null
      })
      chart.axis(props.data_key, {
        tickLine: {
          stroke: '#000',
          value: 6
        },
        // labels: {
        //   label: {
        //     fill: '#000'
        //   }
        // },
        line: {
          stroke: '#000'
        },
        title: null
      });
      if (props.reflect_y) {
        chart.coord().reflect('y')
      }
      chart.guide().text(['min', 'max'], props.key_name);

      chart.line().position('time*' + props.data_key).color(props.color).shape('line').size(2);
      chart.render();

      chart.on('tooltipchange', function(ev) {
        var item = ev.items[0];
        item.value = item.value + props.unit;
      });
    });
  }

  render() {
    return (<this.Chart {...this.props} />);
  }
}

class TrafficCaptureGeneralTab extends React.Component {
  state = {
    shape: 'line',
    data: [],
    height: 200,
    plotCfg: {
      margin: [10, 10, 50, 120],
    },
  }

  formatTrafficUnit(size) {
    if (size < 1024) {
      return {scale: 1, name: 'bytes'}
    } else if (size < 1024 * 1024) {
      return {scale: 1024, name: 'kb'}
    } else if (size < 1024 * 1024 * 1024) {
      return {scale: 1024 * 1024, name: 'mb'}
    } else {
      return {scale: 1024 * 1024 * 1024, name: 'gb'}
    }
  }

  convertPackets(raw_packets) {
    // console.log(raw_packets)
    var datas_with_time = {}
    for (var i in raw_packets) {
      var pkt = raw_packets[i];
      var traffic_size = pkt.ether._len_;
      var up_traffic_size = pkt.ether.src == this.props.mac ? traffic_size : 0;
      var down_traffic_size = pkt.ether.dst == this.props.mac ? traffic_size : 0;

      date_str = new Date(pkt._time_).format('yyyy-MM-dd hh:mm:ss');
      if (datas_with_time[date_str]) {
        datas_with_time[date_str].up_traffic += up_traffic_size;
        datas_with_time[date_str].down_traffic += down_traffic_size;
      } else {
        datas_with_time[date_str] = {
          up_traffic: up_traffic_size,
          down_traffic: down_traffic_size
        }
      }
    }

    var max_up_traffic = 0;
    var max_down_traffic = 0;

    var datas = [];
    for (var date_str in datas_with_time) {
      var d_up_traffic = datas_with_time[date_str].up_traffic;
      var d_down_traffic = datas_with_time[date_str].down_traffic;

      datas.push({
        time: date_str,
        up_traffic: d_up_traffic,
        down_traffic: d_down_traffic
      });

      max_up_traffic = max_up_traffic > d_up_traffic ? max_up_traffic : d_up_traffic;
      max_down_traffic = max_down_traffic > d_down_traffic ? max_down_traffic : d_down_traffic;
    }

    var up_traffic_unit = this.formatTrafficUnit(max_up_traffic);
    var down_traffic_unit = this.formatTrafficUnit(max_down_traffic);

    for (var i in datas) {
      datas[i].up_traffic = Math.round(datas[i].up_traffic/up_traffic_unit.scale * 100) / 100;
      datas[i].down_traffic = Math.round(datas[i].down_traffic/down_traffic_unit.scale * 100) / 100;
    }

    return {
      datas: datas,
      up_unit_name: up_traffic_unit.name,
      down_unit_name: down_traffic_unit.name
    }
  }

  componentDidMount() { 
  }

  render() {
    var result = this.convertPackets(this.props.active);
    // console.log(result.datas)

    if (result.datas.length == 0) {
      return <div></div>
    } else {
      return <div>
        <TrafficChart
          shape={this.state.shape}
          data={result.datas}
          width={$('#traffic-general').width()}
          height={this.state.height}
          plotCfg={{margin: [20, 20, 30, 50]}}
          data_key="up_traffic"
          key_name={"上行流量(" + result.up_unit_name + ")"}
          color="#293c55"
          unit = {result.up_unit_name}
        />
        <TrafficChart
          shape={this.state.shape}
          data={result.datas}
          width={$('#traffic-general').width()}
          height={this.state.height}
          plotCfg={{margin: [10, 20, 50, 50]}}
          data_key="down_traffic"
          key_name={"下行流量(" + result.down_unit_name + ")"}
          color="#B03A5B"
          unit = {result.down_unit_name}
          reflect_y={true}
        />
      </div>
    }
  }
}
