const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (name.value && cost.value) {
    const item = {
      name: name.value,
      cost: parseInt(cost.value, 10),
    };
    db.collection('expenses')
      .add(item)
      .then((res) => {
        error.textContent = '';
        name.value = '';
        cost.value = '';
      });
  } else {
    error.textContent = 'Please enter a name AND cost value before submitting';
  }
});
