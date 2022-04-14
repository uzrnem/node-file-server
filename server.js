const express = require('express');

const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

const app = express();

let mainDir = path.join(__dirname, 'files');
if (!fs.existsSync(mainDir)){
  fs.mkdirSync(mainDir);
}

app.use('/list', (req, res) => {
  console.log('listing /', req.query.path)
  let dir = path.join(__dirname, 'files/', req.query.path.replace('}{', '/'));
  if (!fs.existsSync(dir)){
    res.status(200).send( []);
    return
  }
  var files = fs.readdirSync(dir)
    .map(function(file) {
      lstats = fs.lstatSync(path.resolve(dir, file))
      childCount = null
      if (lstats.isDirectory()) {
        childCount = fs.readdirSync(path.resolve(dir, file)).length
      }
      return {
        name: file,
        time: lstats.mtime.getTime(),
        childCount: childCount,
        isDir: lstats.isDirectory(),
        size: lstats.size
      }; 
    })
    //.sort(function(a, b) { return a.name.toLowerCase() > b.name.toLowerCase(); })
    .sort(function(a, b) {
      if (a.isDir == b.isDir) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1
        } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1
        } else return 0
      }
      if (a.isDir) {
        return -1
      } else {
        return 1
      }
    });
  res.status(200).send( JSON.stringify(files));
});

app.use('/upload', (req, res) => {
  let filePath = req.query.path.replace('}{', '/')
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.debug("files : ", files)
    
    var oldpath = files.file.filepath;
    var newpath = 'files/' + filePath + files.file.originalFilename;
    console.log("uploading ", oldpath, " : ", newpath)
    fs.readFile(oldpath, function (err, data) {
      if (err) throw err;
      console.debug('File read!');

      // Write the file
      fs.writeFile(newpath, data, function (err) {
          if (err) throw err;
          res.write('File uploaded and moved!');
          res.end();
          console.debug('File written!');
      });

      // Delete the file
      fs.unlink(oldpath, function (err) {
          if (err) throw err;
          console.debug('File deleted!');
      });
    });
  });
})

app.use('/delete', (req, res) => {
  let filePath = req.query.path.replace('}{', '/')
  console.log("deleting filePath: ", filePath)
  let file = path.join(__dirname, 'files/', filePath)
  fs.unlinkSync(file)
  res.status(200).send('File Deleted Succesfully..!');
  res.end();
})

app.use('/', express.static('files'));
app.use('/', express.static('public'));

// listen for requests
const port = process.env.PORT || 9040;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
