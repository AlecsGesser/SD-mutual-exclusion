var express = require('express');
var server_in_use = 0;
const columns = {};
var waiting_list = [];
let numero_clients = 0;
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
//---------------------------------------------------------------------MUTEX----------------------------------------------------------------------------//
function lock() {
  server_in_use = 1;
  console.log("Server LOCKED")
}

function unlock() {
  server_in_use = 0;
  console.log("Server UNLOCKED")
}


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/debug', function (req, res) {
  console.log("POST DEBUG");
  //----------------------------------------------------------------ANSWER TO CLIENT--------------------------------------------------------------------------//
  res.sendfile("index.html");
});

app.post('/connect', function (req, res) {
  console.log("POST CONNECT");
  console.log("User name =  " + req.body.username);
  let msg = {
    type: 'connect',
    data: 'sucess'
  };
  //----------------------------------------------------------------ANSWER TO CLIENT--------------------------------------------------------------------------
  res.send(JSON.stringify(msg));
});

app.post('/getcols', function (req, res) {
  console.log("POST SELECT");

  var db = new sqlite3.Database('../clima.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
      return;
    } else {
      console.log('Connected to the in-disk SQlite database.');
    }
  });

  let query = ` SELECT * FROM measurements_daily INNER JOIN weather_stations limit 1`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log(err.message);
    } else {
      let columns = Object.keys(rows[0]);
      let msg = {
        type: 'select',
        columns: columns,
        capitais: capitals
      };
      // ----------------------------------------------------------------ANSWER TO CLIENT--------------------------------------------------------------------------
      res.send(JSON.stringify(msg));
    }
  });
});


app.post('/visualise', function (req, res) {
  console.log("POST VISUALISE");
  // ----------------------------------------------------------------DATABSE CONNECTION --------------------------------------------------------------------------

  var db = new sqlite3.Database('../clima.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
      return;
    } else {
      console.log('Connected to the in-disk SQlite database.');
    }
  });


  let start = req.body.start;
  let end = req.body.end;


  let parameter = req.body.parameter;



  var date1 = ' "' + req.body.start + '" ';
  var date2 = ' "' + req.body.end + '" ';
  var city = req.body.city;
  var query = `SELECT ` + parameter + `, measure_date FROM measurements_daily INNER JOIN weather_stations 
         ON measurements_daily.weather_station_id = weather_stations.id 
         WHERE weather_stations.name LIKE '%`+ city + `%' and measurements_daily.measure_date>` + date1 + ` and measurements_daily.measure_date<` + date2;
  console.log(query)

  
         

  // ----------------------------------------------------------------DATABSE QUERY --------------------------------------------------------------------------

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log(err.message);
    } else {
      //console.log(rows)
      let msg = {
        type: 'visualise',
        data: rows,
      };
      //----------------------------------------------------------------ANSWER TO CLIENT--------------------------------------------------------------------------
      res.send(JSON.stringify(msg));
    }
  });
});


app.post('/randomForest', function (req, res) {
  console.log("POST RANDOMFOREST");
  console.log("data: "+req.body.city)
  //console.log(req.body);
  if (server_in_use == 0) {
    lock();
    //--------------------------------------------LOCK SERVER---------------------------------------------------------

    //---------------------------------------------------- PYTHON CALL---------------------------------------------

    axios.post('http://localhost:5000/server', {
      data: req.body
    })
      .then((response) => {
        let columns = Object.keys(response.data);
        let x = [];
        let label = [];

        for (let i = 1; i < columns.length; i++) {
          x.push(response.data[columns[i]]);
          label.push(columns[i]);
        }

        let msg = {
          x: x,
          label: label,
          list: waiting_list
        }

        waiting_list = [];
        numero_clients = 0;

        //--------------------------------------------UNLOCK SERVER---------------------------------------------------------
        unlock();
        res.send(JSON.stringify(msg))
      })
      .catch((error) => {
        //console.error(error)
      })
  } else {
    // -------------------------------------------WAITING LIST MANAGER---------------------------------------------------------------
    var cont = -1;
    for (let i = 0; i < waiting_list.length; i++) {
      if (waiting_list[i] === req.body.username) {
        cont = i;
      }
    }
    if (cont == -1) {
      waiting_list.push(req.body.username);
      numero_clients++;
    }
    if (waiting_list.length === 0) {
      waiting_list.push(req.body.username);
      numero_clients++;
    }

    let aa = {
      type: 'waiting',
      list: waiting_list,
    };
    //----------------------------------------------------------------ANSWER TO CLIENT--------------------------------------------------------------------------
    res.send(JSON.stringify(aa));
  }


});

app.listen(3000, function () {
  console.log("Started on PORT 3000");
})