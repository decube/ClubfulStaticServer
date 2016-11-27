//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var express = require('express');
var fs = require('fs');



//image resize
var im = require('imagemagick');



var router = express();
var server = http.createServer(router);
router.use(express.logger('dev'));
router.use(express.json());
router.use(express.urlencoded());
router.use(express.bodyParser());
router.use(express.methodOverride());
router.use(express.cookieParser('your secret here'));
router.use(express.session());
router.use(express.static(path.resolve(__dirname, 'client')));


router.get('/:project/:resources/:separation/:directory/:seq/:filename', function(req, res){
  var projectPath = req.params.project;
  var resourcesPath = req.params.resources;
  var separationPath = req.params.separation;
  var directoryPath = req.params.directory;
  var seqPath = req.params.seq;

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



router.post('/upload/:project/:resources/:separation/:directory/:seq', function(req, res){
  req.accepts('application/json');
  var projectPath = req.params.project;
  var resourcesPath = req.params.resources;
  var separationPath = req.params.separation;
  var directoryPath = req.params.directory;
  var seqPath = req.params.seq;

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

    path = path+'/'+projectPath;
    existsFolder(path);

    path = path+'/'+resourcesPath;
    existsFolder(path);

    path = path+'/'+separationPath;
    existsFolder(path);

    path = path+'/'+directoryPath;
    existsFolder(path);

    path = path+'/'+seqPath+'/';
    existsFolder(path);

    function picSave(pic){
      if(pic != undefined && pic.size != 0){
        fs.readFile(pic.path, function (err, data) {
          var picName = pic.name;
          var originName = ""
          var nameArray = picName.split('.');
          var dot = nameArray[nameArray.length-1]
          for(var i=0; i<nameArray.length; i++){
            if(nameArray[i] != dot){
              originName += nameArray[i];
            }
          }
          originName += "_origin."+dot;

          var picPath = path+picName;
          var originPath = path+originName;

          fs.writeFile(originPath, data, function (err) {});

          function saveImageResize(width, height){
            im.resize({
              srcPath: originPath,
              dstPath: picPath,
              width: width,
              height: height
            }, function(error, stdout, stderror) {
            });
            fs.readFile(picPath, function (err, data) {
              if(data.length > 1024*50){
                saveImageResize(width-30, (width-30)/5*3);
              }
            });
          }
          saveImageResize(500, 300);
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
