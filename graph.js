const dimensions = { height: 300, width: 300, radius: 150 };
const { width, height, radius } = dimensions;
const center = { x: width / 2 + 5, y: height / 2 + 5 };

const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', width + 150)
  .attr('height', height + 150);

const graph = svg
  .append('g')
  .attr('transform', `translate(${center.x},${center.y})`);

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

const arcPath = d3
  .arc()
  .outerRadius(radius)
  .innerRadius(radius / 2);

const color = d3.scaleOrdinal(d3.schemeTableau10);

const legendGroup = svg
  .append('g')
  .attr('transform', `translate(${width + 40}, 10)`);

const legend = d3.legendColor().shape('rect').shapePadding(5).scale(color);

//Update Function
const update = (data) => {
  //update color scale
  color.domain(data.map((d) => d.name));

  legendGroup.call(legend).selectAll('text').attr('fill', 'white');

  //join pie to path elements
  const paths = graph.selectAll('path').data(pie(data));

  //Exit selection
  paths.exit().transition().duration(750).attrTween('d', arcTweenExit).remove();

  //handle current DOM updates

  paths.transition().duration(1000).attrTween('d', arcTweenUpdate);

  paths
    .enter()
    .append('path')
    .attr('class', 'arc')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('fill', (d) => color(d.data.name))
    .each(function (d) {
      this._current = d;
    })
    .transition()
    .duration(1000)
    .attrTween('d', arcTweenEnter);
};

// data array and firestore call
let data = [];

db.collection('expenses').onSnapshot((response) => {
  response.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    let index = data.findIndex((item) => item.id === doc.id);
    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'removed':
        data[index] = doc;
        break;
      case 'modified':
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});

const arcTweenEnter = (d) => {
  let i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  let i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

function arcTweenUpdate(d) {
  //interpolate between current object(this._current) and object change(d)
  let i = d3.interpolate(this._current, d);
  //Update the current prop with updated new data(d or i(1))
  this._current = i(1); // >> d

  return function (t) {
    return arcPath(i(t));
  };
}
