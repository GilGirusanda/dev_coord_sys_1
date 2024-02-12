const express = require('express');
const Datastore = require('nedb');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
app.listen(port, () => console.log('listening at '+port));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const database = new Datastore({ filename: 'database.db', autoload: true });
// database.loadDatabase();

app.get('/api', (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

app.post('/api', (request, response) => {
  const data = request.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;
  database.insert(data);
  response.json(data);
});

app.delete('/api', (request, response) => {
  database.remove({}, { multi: true }, function (err, numRemoved) {
  if (err) {
    console.error('Error clearing NeDB:', err);
  } else {
    console.log('Cleared NeDB. Removed', numRemoved, 'documents.');
  }
});
});