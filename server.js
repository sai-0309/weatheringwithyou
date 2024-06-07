const express = require('express')
const app = express()
const port = 3000
const request = require("request");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get('/weather', (req, res) => {
  res.render("signup_login");
})

app.get('/signupsubmit', (req, res) => {
  const name = req.query.name;
  const email = req.query.email;
  const pwd = req.query.pwd;
  db.collection("users")
    .add({
      name: name,
      email: email,
      password: pwd,
    })
    .then(() => {
      res.render("signup_login");
    });
});

app.get('/locsubmit', (req, res) => {
  res.render("weather");
});

app.get('/logfail', (req, res) => {
  res.render("signup_login");
});


app.get('/signinsubmit', (req, res) => {
  const email = req.query.email;
  const password = req.query.pwd;
  db.collection("users")
    .where("email", "==", email)
    .where("password", "==", password)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        //query my database with all the users only when login is succefull
            res.render("weather");
      } else {
        res.render("loginfail");
       
      }
    });      
});

app.get('/weathersubmit',(req,res) =>{
  const location = req.query.location;
  request(
    'http://api.weatherapi.com/v1/current.json?key=120e0245e244433388d51546241702&q='+location+'&aqi=no', function (error, response, body){
      if("error" in JSON.parse(body))
      {
        if((JSON.parse(body).error.code.toString()).length > 0)
        {
          res.render("weather");
        }
      }
      else
      {
        const region = JSON.parse(body).location.region;
        const country= JSON.parse(body).location.country;
        const loctime = JSON.parse(body).location.localtime;
        const temp_c = JSON.parse(body).current.temp_c;
        const temp_f = JSON.parse(body).current.temp_f;
        const icon = JSON.parse(body).current.condition.icon;
        const wind_kph = JSON.parse(body).current.wind_kph;
        const humi = JSON.parse(body).current.humidity;
        const feels_c = JSON.parse(body).current.feelslike_c;
        const feels_f = JSON.parse(body).current.feelslike_f;
        const condition = JSON.parse(body).current.condition.text;
        res.render('location',{location:location,region:region,country:country,condition:condition,loctime:loctime,temp_c:temp_c,temp_f:temp_f,icon:icon,wind_kph:wind_kph,feels_c:feels_c,feels_f:feels_f,humi:humi});
      } 
    }
    );
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})