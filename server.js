var express = require('express');
var app = express();
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var server_in_use = false;

function lock(){
  server_in_use = true;
}

function unlock(){
  server_in_use = false;
}

app.get('/',function(req,res){
    res.sendfile("index.html");
  });

app.post('/connect',function(req,res){
    var user_name=req.body.name;
    console.log("User name = "+user_name+", password is "+password);
    let msg = {
      type: 'connect',
      data: 'sucess'
    };
    res.send(JSON.stringify(msg));
});

app.post('/basicData', function(req, res){
  if( !server_in_use ){
    server_in_use=true;
    //-----DB request ------



    server_in_use=false;
  }else{

  }
  
    
});

app.listen(3000,function(){
  console.log("Started on PORT 3000");
})