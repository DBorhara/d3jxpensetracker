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

const angles = pie([
  { name: 'Rent', cost: 900 },
  { name: 'Food', cost: 400 },
  { name: 'Gas', cost: 100 },
]);

const arcPath = d3
  .arc()
  .outerRadius(radius)
  .innerRadius(radius / 2);
