var express = require('express');
var server_in_use = 0;
const columns = {};
const waiting_list = [];
var app = express();
var bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const axios = require('axios')
	
	


columns['TEMPERATURA'] = '"temp_dry_bulb"';
columns['TEMPERATURA2'] = '"temp_wet_bulb"';
columns['PRESSÃO'] = '"level_pressure_on_station"';
columns['DIREÇÃO DO VENTO'] = '"wind_direction"';
columns['VELOCIDADE DO VENTO'] = '"wind_speed"';

var capitals = [
  'PORTO VELHO',
'MANAUS',
'RIO BRANCO',
'CAMPO GRANDE',
'MACAPÁ',
'BRASÍLIA',
'BOA VISTA',
'CUIABÁ',
'PALMAS',
'TERESINA',
'SÃO PAULO',
'RIO DE JANEIRO',
'BELÉM',
'SÃO LUÍS',
'GOIÂNIA',
'SALVADOR',
'MACEIÓ',
'PORTO ALEGRE',
'CURITIBA',
'FLORIANOPOLIS',
'BELO HORIZONTE',
'FORTALEZA',
'RECIFE',
'JOÃO PESSOA',
'ARACAJU',
'NATAL',
'VITÓRIA',
];


var cont = 0;

function lock(){
  server_in_use = 1;
}

function unlock(){
  server_in_use = 0;
}


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




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

app.post('/add',function(req,res){
  server_in_use++;
  cont++
  console.log(cont+"  Add "+server_in_use)
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
        columns: columns,
        capitais: capitals
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


  let start = req.body.start;
  let end = req.body.end;


  let parameter = req.body.parameter;

  

  var date1 = ' "'+req.body.start+'" ';
  var date2 = ' "'+req.body.end+'" ';
  var city  = ' "'+req.body.city+'" ';
  var query   = `SELECT `+parameter+` , measure_date FROM measurements_daily INNER JOIN weather_stations 
         ON measurements_daily.weather_station_id = weather_stations.id 
         WHERE weather_stations.name =`+ city + ` and measurements_daily.measure_date>` + date1 + ` and measurements_daily.measure_date<` + date2;
  console.log(query)


  db.all(query, [], (err, rows) => {
    if (err){
      console.log(err.message);
    }else{
      //console.log(rows)
      let msg = {
        type: 'visualise',
        data: rows,
      };
      res.send(JSON.stringify(msg));      
    }
  });
});


app.post('/randomForest',function(req,res){
  console.log("POST RANDOMFOREST");
  //console.log(req.body);
  console.log("server status: "+server_in_use);
  if( server_in_use == 0){
    server_in_use=1;
    console.log("server status: "+server_in_use);

    // PYTHON CALL
    
    axios.post('http://localhost:5000/server', {
      data: req.body
    })
    .then((response) => {
      let columns = Object.keys(response.data);

      let x = [];
      let label = [];
      for(let i = 1 ; i < columns.length ; i++){
        x.push( response.data[columns[i]] );
        label.push( columns[i] );
      }
      let msg = {
        x: x,
        label: label
      }
      server_in_use=0;

      res.send(JSON.stringify(msg))
    })
    .catch((error) => {
      console.error(error)
    })
  }else{
    // add to waiting list
    // waiting list response
    // test se ja esta na list dai nao adiciona
    
    console.log("pasosu wainting list")
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