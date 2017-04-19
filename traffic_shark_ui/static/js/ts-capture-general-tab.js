class TrafficCaptureGeneralTab extends React.Component {
  render() {
    var data = [
      {genre: 'Sports', sold: 275},
      {genre: 'Strategy', sold: 115},
      {genre: 'Action', sold: 120},
      {genre: 'Shooter', sold: 350},
      {genre: 'Other', sold: 150},
    ];
    var chart = null;
    chart_props = {
      id: 'c1',
      width : 600,
      height : 400
    }

    return(
      <div id="c1">
      </div>
    );
  }
}

// {
//         chart = new G2.Chart(chart_props)
//       }

        // chart.source(data, {
        //   genre: {
        //     alias: '游戏种类'
        //   },
        //   sold: {
        //     alias: '销售量'
        //   }
        // });

        // chart.interval().position('genre*sold').color('genre')
        // chart.render()