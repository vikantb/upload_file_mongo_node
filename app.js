
const express=require('express');
const mongoose=require('mongoose');
const fs=require('fs');
const path=require('path');
const bodyParser=require('body-parser');
const multer=require('multer');
const ejs=require('ejs');

const app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname+"/upload"));
app.set('view engine','ejs');

var url='mongodb+srv://**:**@cluster0.7zx0w.mongodb.net/vicky?retryWrites=true&w=majority';
mongoose.connect(url,
    {
      useNewUrlParser:true,
      useUnifiedTopology:true  
    });

var model=mongoose.model('files',{
      file:Buffer,
      path:String,
      contentType:String
});

var storage=multer.diskStorage({
     destination:'./uploads',
     filename:function (req,file,cb){
         cb(null,Date.now()+file.originalname)
     }
});

var upload=multer({
   storage:storage,
//    limits:{fileSize:9999999999},
   
   fileFilter:(req,file,cb)=>{
    //  return cb(new Error('cant upload'),false);
    return cb(null,true);
   }
}).single("imgUpload");

app.get("/",(req,res)=>{
    
    res.render("index");
});

app.post("/",(req,res)=>{
  
    upload(req,res,(err)=>{
        if(err){
            res.render('index',{msg:err.message});
            console.log(err.message);
        }
        else{
            var f=req.file;
            if(!f){
                res.render('index',{msg:'! Please select the file first..'});
                console.log("please upload file");
            }
            else{
                var obj={
                    file:fs.readFileSync(f.path),
                    path:f.path,
                    contentType:f.mimetype
                }
                model.create(obj,(err,item)=>{
                   if(err){
                       console.log(err);
                       res.render('index',{msg:err});
                   }
                   else{
                    res.render('index',{msg:"file uploaded.."});
                    console.log(f);
                   }
                 });
           }
        }
    })
   
});

app.listen(process.env.PORT || 4545,()=>{
    console.log("server connected to port 4545.......")
});