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


router.get('/:project/:resources/:separation/:directory/:seq/:filename', function(req, res){
  var projectPath = req.param.project;
  var resourcesPath = req.param.resources;
  var separationPath = req.param.separation;
  var directoryPath = req.param.directory;
  var seqPath = req.param.seq;

  var imagePath = __dirname+'/'+projectPath+'/'+resourcesPath+'/'+separationPath+'/'+directoryPath+'/'+seqPath+'/'+req.params.filename;
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



router.post('/upload/:projectPath/:resources/:separation/:directory/:seq', function(req, res){
  req.accepts('application/json');
  var projectPath = req.param.project;
  var resourcesPath = req.param.resources;
  var separationPath = req.param.separation;
  var directoryPath = req.param.directory;
  var seqPath = req.param.seq;

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

    var path = __dirname;

    path = path+'/'+projectPath+'/';
    existsFolder(path);

    path = path+'/'+resourcesPath+'/';
    existsFolder(path);

    path = path+'/'+separationPath+'/';
    existsFolder(path);

    path = path+'/'+directoryPath+'/';
    existsFolder(path);

    path = path+'/'+seqPath+'/';
    existsFolder(path);

    function picSave(pic){
      if(pic != undefined && pic.size != 0){
        fs.readFile(pic.path, function (err, data) {
          var picName = pic.name;
          var picPath = path+picName;
          fs.writeFile(picPath, data, function (err) {});
        });
      }
    }

    picSave(req.files.pic1);
    picSave(req.files.pic2);
    picSave(req.files.pic3);
    picSave(req.files.pic4);
    picSave(req.files.pic5);
    picSave(req.files.pic6);
    picSave(req.files.pic7);
    picSave(req.files.pic8);

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
