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

//Update Function
const update = (data) => {
  const paths = graph.selectAll('path').data(pie(data))
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
