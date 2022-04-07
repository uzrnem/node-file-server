const express = require('express');

const fs = require('fs');
const path = require('path');

const app = express();

app.use('/list', (req, res) => {
  let dir = path.join(__dirname, 'files');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  fs.readdir(dir, (err, files) => {
    if(err){
      res.status(400).send( err )
    }else{
      res.status(200).send( JSON.stringify(files));
    }
  })
});

app.use('/upload', (req, res) => {
  let fileName = path.basename(req.url);
  console.log("uploading ", fileName)
  let file = path.join(__dirname, 'files', fileName)
  req.pipe(fs.createWriteStream(file));
  req.on('end', () => {
    res.status(200).send('File Uploaded Succesfully..!');
    res.end();
  })
})

app.use('/delete', (req, res) => {
  let fileName = path.basename(req.url);
  console.log("deleting ", fileName)
  let file = path.join(__dirname, 'files', fileName)
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
