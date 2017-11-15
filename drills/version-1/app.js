const API_URL = 'https://quiet-bayou-99554.herokuapp.com/api/v1/contacts';

function createNode(element) {
  return document.createElement(element);
}

function append(parent, el) {
  return parent.appendChild(el);
}

const ul = document.getElementById('characters');

function getData() {
  fetch(API_URL)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      let characters = data.data;
      return characters.map(function(character) {
        let li = createNode('li'),
          img = createNode('img'),
          span = createNode('span'),
          p = createNode('p');
        img.src = character.imageURL;
        span.innerHTML = `${character.name}: ${character.phone}`;
        p.innerHTML = `${character.message}`;
        append(li, img);
        append(li, span);
        append(li, p);
        append(ul, li);
      });
    });
}

getData();
