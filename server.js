const express = require('express');
const app = express();
const port = 3000;
const request = require('request');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');

const serviceAccount = require('./key.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/weather', (req, res) => {
  res.render('signup_login');
});

app.post('/signupsubmit', (req, res) => {
  const { name, email, pwd } = req.body;
  db.collection('users')
    .add({
      name,
      email,
      password: pwd,
    })
    .then(() => {
      res.render('signup_login');
    });
});

app.post('/signinsubmit', (req, res) => {
  const { email, pwd } = req.body;
  db.collection('users')
    .where('email', '==', email)
    .where('password', '==', pwd)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.render('weather');
      } else {
        res.render('loginfail');
      }
    });
});

app.post('/weathersubmit', (req, res) => {
  const location = req.body.location;
  request(
    `http://api.weatherapi.com/v1/current.json?key=120e0245e244433388d51546241702&q=${location}&aqi=no`,
    (error, response, body) => {
      if (error) {
        console.error('Error:', error);
        res.render('weather');
      } else {
        const data = JSON.parse(body);
        if (data.error) {
          res.render('weather');
        } else {
          const { region, country, localtime: loctime } = data.location;
          const { temp_c, temp_f, condition, wind_kph, humidity: humi, feelslike_c: feels_c, feelslike_f: feels_f } = data.current;
          const icon = data.current.condition.icon;
          res.render('location', {
            location,
            region,
            country,
            condition: condition.text,
            loctime,
            temp_c,
            temp_f,
            icon,
            wind_kph,
            feels_c,
            feels_f,
            humi,
          });
        }
      }
    }
  );
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
