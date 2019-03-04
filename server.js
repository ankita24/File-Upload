'use strict';

var express = require('express');
var cors = require('cors');
var bodyParser=require('body-parser')
var multer=require('multer')
var MongoClient=require('mongodb').MongoClient
var router = express.Router();
var formidable=require('formidable')
var fs=require('fs')
// require and use "multer"...
var url=process.env.MLAB_URI
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use("/",router)
// parse application/json
app.use(bodyParser.json())
app.use(cors());
//app.use(upload)
app.use('/public', express.static(process.cwd() + '/public'));
/*MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("db1");
  dbo.createCollection("fil", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    db.close();
  });
});*/


var storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'')
},
  filename:(req,file,cb)=> {
    console.log(file.mimetype)
    cb(null, file.fieldname + '-' + Date.now())
  }
})
var upload=multer({storage:storage})

var insertDocuments=function(db,filepath,callback){
  var collection=db.collection("fil")
  collection.insertOne({'imagePath':filepath})
  .then(function(num){
    //console.log(num)
    callback(null,num)
  })
}



router.post('/api/fileanalyse',upload.single('upfile'),function(req,res){
  
  MongoClient.connect(url,(err,db)=>{
    //console.log(req.file.filename)
    insertDocuments(db,''+ req.file.filename, () => {
      db.close()
      var stats = fs.statSync(req.file.filename)
      var fileSizeInBytes = stats["size"]
      console.log(req.file.filename.mimetype)
      res.json({name:req.file.originalname,type:req.file.mimetype,size:fileSizeInBytes});
    })
  })
})



app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
  });

app.get('/hello', function(req, res){
  res.json({greetings: "Hello, API"});
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});
