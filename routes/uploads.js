/**
 * Created by tammyrobinson on 3/22/17.
 */
// dependencies
var express = require('express');
var router  = express.Router();

var multer  = require('multer');
var path    = require('path');
var fs      = require('fs');
var jsonfile= require('jsonfile');

// multer storage setup
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var path = './tmp'; // Make sure this path exists
        if(!fs.existsSync(path))
            fs.mkdirSync(path);
        cb(null, path);
    },
    filename   : function (req, file, cb) {
        // var ext  = path.extname(file.originalname);
        // var name = file.fieldname + '-' + Date.now() + ext;
        cb(null, file.originalname);
    }
});

var upload = multer({
    storage: storage
}).any('file');

var file = 'data/uploads.json';

router.get('/', function (req, res){
    //send json response containing uploaded docs data
    jsonfile.readFile(file, function(err, data){
        if(err)
            return res.status(err.statusCode).send(err);

        res.json(data);
    });
});

router.post('/', function (req, res) {
    var docs = [];

    // error handling for multer upload
    upload(req, res, function (err) {
        if(err)
            return res.send(err);

        var obj, key;

        obj = {};
        key = req.files[0].originalname;

        // obj[key] = req.files[0];
        obj = req.files[0];

        // read existing data from file
        jsonfile.readFile(file, function (err, data) {
            if(err)
               console.error(err);

            console.log(data);

            if(data.length > 0){
                docs = data;
                
                // check that key doesn't already exist, if so don't add to docs array
                
                var dupeExist = function(upl) {
                    return docs.some(function (el) {
                        return el.originalname === upl.originalname;
                    })
                };

                if(dupeExist(obj)){
                    return;
                }else {
                    console.log(obj.originalname, ': This item doesn\'t exist in uploads.json. Adding ...');
                    docs.push(obj);
                }
            }else
                docs.push(obj);


            console.log('successful upload: ' + key);
            console.log(docs);

            jsonfile.writeFile(file, docs, function (err) {
                if(err){
                    console.error(err);
                    return res.status(400).send('Upload did not write to JSON file');
                }
            });
        });

        res.status(200).send('Success');
    });

});

module.exports = router;

