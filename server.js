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


router.get('/download/:project/:directory/:seq/:filename', function(req, res){
  var projectPath = req.params.project;
  var directoryPath = req.params.directory;
  var seqPath = req.params.seq;

  var imagePath = __dirname+'/'+projectPath+'/'+directoryPath+'/'+seqPath+'/'+req.params.filename;
  console.log(imagePath);
  fs.readFile(imagePath, function(error, data){
    if(error != null){
      res.writeHead(404);
      res.end(data);
    }else{
      var imgNameArray = req.params.filename.split('.');
      var ext = imgNameArray[1];
      res.writeHead(200, {'Content-Type': 'image/'+ext});
      res.end(data);
    }
  });
});


router.post('/upload/:project/:directory/:seq', function(req, res){
  req.accepts('application/json');
  var projectPath = req.params.project;
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

    path = path+'/'+directoryPath;
    existsFolder(path);

    path = path+'/'+seqPath+'/';
    existsFolder(path);









    function picSave(pic){
      if(pic != undefined && pic.size != 0){
        fs.readFile(pic.path, function (err, data) {

          function saveImageResize(width, height, srcPath, dstPath){
            im.crop({
              srcPath: srcPath,
              dstPath: dstPath,
              width: width,
              height: height
            }, function(error, stdout, stderror) {

            });
            setTimeout(function() {
              fs.readFile(dstPath, function (err, data) {
                if(data != null && data.length != null && data.length != undefined && data.length > 1024*20){
                  saveImageResize(width-30, (width-30)/5*3, dstPath, dstPath);
                }
              });
            }, 10);
          }

          var picName = pic.name;
          var originName = '';
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
          setTimeout(function() {
            saveImageResize(500, 300, originPath, picPath);
          }, 10);
        });
      }
    }



    function picSaveWeb(pic, picName){
      if(pic != undefined && pic.size != 0){
        fs.readFile(pic.path, function (err, data) {
          function saveImageResize(width, height, originPath, dstPt){
            im.crop({
              srcPath: originPath,
              dstPath: dstPt,
              width: width,
              height: height
            }, function(error, stdout, stderror) {

            });
            setTimeout(function() {
              fs.readFile(picPath, function (err, data) {
                if(data != null && data.length != null && data.length != undefined && data.length > 1024*50){
                  saveImageResize(width-30, (width-30)/5*3, dstPt, dstPt);
                }
              });
            }, 1);
          }


          var originName = '';
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

          setTimeout(function() {
            im.crop({
              srcPath: originPath,
              dstPath: originPath,
              width: 1000,
              height: 500
            }, function(error, stdout, stderror) {
            });
            setTimeout(function() {
              saveImageResize(500, 300, originPath, picPath);
            }, 1);
          }, 1);
        });
      }
    }


    if(req.param('isType') == 'web'){
      picSaveWeb(req.files.pic1, 'pic1.jpeg');
      picSaveWeb(req.files.pic2, 'pic2.jpeg');
      picSaveWeb(req.files.pic3, 'pic3.jpeg');
      picSaveWeb(req.files.pic4, 'pic4.jpeg');
      picSaveWeb(req.files.pic5, 'pic5.jpeg');
      picSaveWeb(req.files.pic6, 'pic6.jpeg');
      picSaveWeb(req.files.pic7, 'pic7.jpeg');
      picSaveWeb(req.files.pic8, 'pic8.jpeg');
    }else{
      picSave(req.files.pic1);
      picSave(req.files.pic2);
      picSave(req.files.pic3);
      picSave(req.files.pic4);
      picSave(req.files.pic5);
      picSave(req.files.pic6);
      picSave(req.files.pic7);
      picSave(req.files.pic8);
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


server.listen(process.env.PORT || 3010, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
