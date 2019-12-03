var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const columns = {};
const waiting_list = [];


columns['TEMPERATURA'] = '"temp_dry_bulb"';
columns['TEMPERATURA2'] = '"temp_wet_bulb"';
columns['PRESSÃO'] = '"level_pressure_on_station"';
columns['DIREÇÃO DO VENTO'] = '"wind_direction"';
columns['VELOCIDADE DO VENTO'] = '"wind_speed"';



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var server_in_use = false;

function lock(){
  server_in_use = true;
}

function unlock(){
  server_in_use = false;
}

app.get('/debug',function(req,res){
  console.log("POST DEBUG");
  res.sendfile("index.html");
});


app.post('/connect',function(req,res){
  console.log("POST CONNECT");
  console.log("User name =  "+req.body.username);
  let msg = {
    type: 'connect',
    data: 'sucess'
  };
  res.send(JSON.stringify(msg));
});


app.post('/basicData', function(req, res){
  console.log("POST BASICDATA");
    
    //-----DB request ------//
    
    
    var db = new sqlite3.Database('../clima.db', sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(err.message);
      return;
      }else{
        console.log('Connected to the in-disk SQlite database.');
      }
    });



    var date1 = ' "2017-01-01" ';
    var date2 = ' "2017-01-03" ';
    var city  = ' "FLORIANOPOLIS"';
    var query   = `SELECT * FROM measurements_daily INNER JOIN weather_stations 
           ON measurements_daily.weather_station_id = weather_stations.id 
           WHERE weather_stations.name =`+ city + ` and measurements_daily.measure_date>` + date1 + ` and measurements_daily.measure_date<` + date2
           +`limit 1`;

    
    db.all(query, [], (err, rows) => {
      if (err){
        console.log(err.message);
      }else{
        let msg = {
            type: 'basicData',
            data: rows
          }
        console.log("sent:  type:"+ msg.type+"  // response: "+msg.response +  " // basic data from: " + msg.data[0].name+"  // Lines of data : "+msg.data.length);
        res.send(JSON.stringify(msg));
      }
    }); 

    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Close the database connection.');
    });

});


app.post('/select',function(req,res){
  console.log("POST SELECT");

  var db = new sqlite3.Database('../clima.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    return;
    }else{
      console.log('Connected to the in-disk SQlite database.');
    }
  });

  let query = ` SELECT * FROM measurements_daily INNER JOIN weather_stations limit 1`;

  db.all(query, [], (err, rows) => {
    if (err){
      console.log(err.message);
    }else{
      let columns = Object.keys(rows[0]);
      let msg = {
        type: 'select',
        columns: columns
      };
      res.send(JSON.stringify(msg));      
    }
  }); 
});


app.post('/visualise',function(req,res){
  console.log("POST VISUALISE");

  var db = new sqlite3.Database('../clima.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    return;
    }else{
      console.log('Connected to the in-disk SQlite database.');
    }
  });

  let StartDate = req.body.StartDate;
  let endDate = req.body.StartDate;

  let city = req.body.city;


  




  



});


app.post('/randomForest',function(req,res){
  console.log("POST RANDOMFOREST");
  console.log(req.body);
  if( !server_in_use){
    lock();
    // PYTHON CALL

    let variable = [
      ['temp', 0.8],
      ['temp', 0.8],
      ['temp', 0.8]

    ]

    let msg = {
      data : variable
    }

    res.send(JSON.stringify(msg));





    unlock();
  }else{
    // add to waiting list
    // waiting list response
    // test se ja esta na list dai nao adiciona

    waiting_list.push(req.body.username);
    console.log('username: ', req.body.username);
    console.log('list: '+waiting_list);


    
    let msg = {
      type: 'waiting',
      list: waiting_list
    };
  
    res.send(JSON.stringify(msg));
  }
  

});







app.listen(3000,function(){
  console.log("Started on PORT 3000");
})