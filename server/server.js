const csv = require('csv-parser');
const fs = require('fs');
const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors());

async function readCSV(filePath) {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

app.get("/api/points", async (req, res) => {
    try {
      const result = await readCSV('database.csv')
      res.json(result);
    } catch (err) {
      console.error(err.message);
    }
  });

  app.get("/api/labels", async (req, res) => {
    try {
      const result = await readCSV('labels.csv')
      res.json(result);
    } catch (err) {
      console.error(err.message);
    }
  });

app.listen(443, () => { console.log("Server started on port 443") });
