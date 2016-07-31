//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var fs = require('fs');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);


router.use(express.logger('dev'));
router.use(express.json());
router.use(express.urlencoded());
router.use(express.bodyParser());
router.use(express.methodOverride());
router.use(express.cookieParser('your secret here'));
router.use(express.session());

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}


router.get('/resources/:separation/:directory/:seq/:filename', function(req, res){
  var imagePath = __dirname+'/resources/'+req.params.separation+'/'+req.params.directory+'/'+req.params.seq+'/'+req.params.filename;
  console.log(imagePath);
  fs.readFile(imagePath, function(error, data){
    if(error != null){
      res.writeHead(404);
      res.end(data);
    }else{
      var imgNameArray = req.params.filename.split('.');
      var ext = imgNameArray[1];
      res.writeHead(200, {'Content-Type': req.params.separation+'/'+ext});
      res.end(data);
    }
  });
});
router.post('/upload/resources/image/court/:seq', function(req, res){
  req.accepts('application/json');
  var seq = req.params.seq;

  try{



    function existsFolder(url){
      var folderCheck = false;
      try{
        folderCheck = fs.lstatSync(url).isDirectory();
      }catch(ee){
        folderCheck = false;
      }
      if(!folderCheck){
        fs.mkdir(url, function(err) {
          if(err) throw err;
        });
      }
    }

    var resourcesPath = __dirname+'/resources/';
    existsFolder(resourcesPath);

    var imagePath = resourcesPath+'image/';
    existsFolder(imagePath);

    var courtPath = imagePath+'court/';
    existsFolder(courtPath);

    var directoryPath = courtPath+seq+'/';
    existsFolder(directoryPath);

    var pic1 = req.files.pic1;
    var pic2 = req.files.pic2;
    var pic3 = req.files.pic3;
    var pic4 = req.files.pic4;

    if(pic1 != undefined && pic1.size != 0){
      fs.readFile(pic1.path, function (err, data) {
        var picName = pic1.name;
        var picPath = directoryPath+picName;
        fs.writeFile(picPath, data, function (err) {});
      });
    }

    if(pic2 != undefined && pic2.size != 0){
      fs.readFile(pic2.path, function (err, data) {
        var picName = pic2.name;
        var picPath = directoryPath+picName;
        fs.writeFile(picPath, data, function (err) {});
      });
    }

    if(pic3 != undefined && pic3.size != 0){
      fs.readFile(pic3.path, function (err, data) {
        var picName = pic3.name;
        var picPath = directoryPath+picName;
        fs.writeFile(picPath, data, function (err) {});
      });
    }

    if(pic4 != undefined && pic4.size != 0){
      fs.readFile(pic4.path, function (err, data) {
        var picName = pic4.name;
        var picPath = directoryPath+picName;
        fs.writeFile(picPath, data, function (err) {});
      });
    }

    res.json({
      code:0,
      msg:'성공'
    });
  }catch(e){
    res.json({
      code:-1,
      msg:'실패'
    });
  }
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
