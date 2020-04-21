const dimensions = { height: 300, width: 300, radius: 150 };
const { width, height, radius } = dimensions;
const center = { x: width / 2 + 5, y: height / 2 + 5 };

//Canvas
const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', width + 150)
  .attr('height', height + 150);

// Graph/Pie
const graph = svg
  .append('g')
  .attr('transform', `translate(${center.x},${center.y})`);

//Donut Values/Cost Values in Chart
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

// Donut Values/Cost Angles in Chart
const arcPath = d3
  .arc()
  .outerRadius(radius)
  .innerRadius(radius / 2);

//Ordinal Color Scale
const color = d3.scaleOrdinal(d3.schemeTableau10);

//Legend SVG
const legendGroup = svg
  .append('g')
  .attr('transform', `translate(${width + 40}, 10)`);

//Legend Color
const legend = d3
  .legendColor()
  .shape('path', d3.symbol().type(d3.symbolSquare)())
  .shapePadding(5)
  .scale(color);

//Tooltip Library
const tooltip = d3
  .tip()
  .attr('class', 'tip card')
  .html((d) => {
    let content = `<div class="name">${d.data.name}</div>`;
    content += `<div class="cost">${d.data.cost}<div>`;
    content += `<div class="delete">Click Slice to Delete<div>`;
    return content;
  });

//Invoke Tooltip
graph.call(tooltip);

//Update Function
const update = (data) => {
  //update color scale
  color.domain(data.map((d) => d.name));

  //Call Legend and Color
  legendGroup.call(legend);
  legendGroup.selectAll('text').attr('fill', 'white');

  //Join Pie to Path Elements
  const paths = graph.selectAll('path').data(pie(data));

  //Exit selection
  paths.exit().transition().duration(750).attrTween('d', arcTweenExit).remove();

  //handle current DOM updates with transition/tween

  paths.transition().duration(1000).attrTween('d', arcTweenUpdate);

  //Enter Selection with transition/tween
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

  //Events
  graph
    .selectAll('path')
    .on('mouseover', (d, i, n) => {
      tooltip.show(d, n[i]); // this in the arrow function is n[i]
      handleMouseOver(d, i, n);
    })
    .on('mouseout', (d, i, n) => {
      tooltip.hide();
      handleMouseOut(d, i, n);
    })
    .on('click', handleClick);
};

// data array
var data = [];

//firestore call
db.collection('expenses')
  .orderBy('cost')
  .onSnapshot((response) => {
    response.docChanges().forEach((change) => {
      const doc = { ...change.doc.data(), id: change.doc.id };

      const index = data.findIndex((item) => item.id === doc.id);
      switch (change.type) {
        case 'added':
          data.push(doc);
          break;
        case 'modified':
          data[index] = doc;
          break;
        case 'removed':
          data = data.filter((item) => item.id !== doc.id);
          break;
        default:
          break;
      }
    });
    //Invoke Update
    update(data);
  });

//Arc Tween Enter with Angles
const arcTweenEnter = (d) => {
  let i = d3.interpolate(d.endAngle - 0.1, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// Arc Tween Exit with Angles
const arcTweenExit = (d) => {
  let i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// Update function for arcTween Updates
function arcTweenUpdate(d) {
  //interpolate between current object(this._current) and object change(d)
  let i = d3.interpolate(this._current, d);
  //Update the current prop with updated new data(d or i(1))
  this._current = i(1); // >> d

  return function (t) {
    return arcPath(i(t));
  };
}

//Event Handlers
//MouseOver Events
const handleMouseOver = (d, i, n) => {
  d3.select(n[i])
    .transition('onHoverFillChange')
    .duration(300)
    .attr('fill', '#fff');
};
//MouseOut Events
const handleMouseOut = (d, i, n) => {
  d3.select(n[i])
    .transition('onHoverFillChange')
    .duration(300)
    .attr('fill', color(d.data.name));
};
//Click Events
const handleClick = (d) => {
  const id = d.data.id;
  db.collection('expenses').doc(id).delete();
};
