const fastCsv = require('fast-csv');
const fs = require('fs');
const mongoose = require('mongoose');
const User = mongoose.model("User");

const dbActions = require('./../../services/db/actions');


exports.exportCsvData = (req, res) => {
  var dir = './src/server/public/export';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let path = './src/server/public/export/db_data.csv';
  const writeStream = fs.createWriteStream(path);

  User.find({}).lean().exec((err, docs) => {
    // mongoose.disconnect();

    docs.forEach((item) => {
      item.chartData = JSON.stringify(item.chartData);
    })

    if (docs && docs.length === 0) {
      console.log('users not found');
      return;
    }

    if (err) {
      return console.error('error', err);
    }

    console.log('docs', docs);
    fastCsv
        .write(docs, { headers: true })
        .pipe(writeStream)
        .on('finish', () => {
          res.status(200).download(path);
        });

  })
};


exports.importCsvData = (req, res) => {
  // const readStream = fs.createReadStream('./src/server/public/db_data.csv');
  // const readStream = fs.createReadStream(JSON.parse(req.body.data));
  let parsedData = JSON.parse(req.body.data);
  let usersArr = [];

  parsedData.forEach((item) => {
    if (item.email && item.name && item.createdAt &&
        item.password && item.role && item.isAdmin) {
      if (!usersArr) {
        usersArr = [];
      }

      let isAdmin = typeof item.isAdmin == 'string' ? JSON.parse(item.isAdmin) : item.isAdmin

      let user = {
        name: item.name,
        email: item.email,
        password: item.password,
        role: item.role,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        isAdmin: isAdmin,
        chartData: {
          sales: Math.random() * 100,
          expenses: Math.random() * 100,
          profit: Math.random() * 100,
        },
      };

      usersArr.push(user);
    }
  })

  dbActions.insertUsers(req, res, usersArr);

  // let csvData = [];
  // let csvStream = fastCsv
  //   .parse({headers: true})
  //   .on('error', error => console.error(error))
  //   .on('data', (data) => {
  //     delete data._id;
  //
  //     if(data.chartData) {
  //       csvData.push(data);
  //     }
  //
  //   })
  //   .on('data-invalid', (row, rowNumber) => console.log(`Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}]`))
  //   .on('end', (rows) => {
  //     console.log('csv-data-end', rows);
  //
  //     dbActions.insertUsers(csvData);
  //     res.send(200);
  //   });

  // readStream.pipe(csvStream);

};