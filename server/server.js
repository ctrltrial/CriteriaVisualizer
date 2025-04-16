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
      const result = await readCSV('database.csv');
	  const points = result.map(row => ({
		CLUSTER: Number(row.CLUSTER),
		YEAR: Number(row.YEAR),
		X: Number(row.X),
		Y: Number(row.Y),
	  }));
      res.json(points);
    } catch (err) {
      console.error(err.message);
    }
});

app.get("/api/labels", async (req, res) => {
    try {
      const result = await readCSV('labels.csv')
	  const labels = result.map(row => ({
		CLUSTER: Number(row.CLUSTER),
		LABEL: row.LABEL,
		X: Number(row.X),
		Y: Number(row.Y),
	  }));
      res.json(labels);
    } catch (err) {
      console.error(err.message);
    }
});

app.get("/api/ranks", async (req, res) => {
    try {
      const result = await readCSV('labels.csv')
	  const ranks = result.map(row => ({
		CLUSTER: Number(row.CLUSTER),
		LABEL: row.LABEL,
		RANK: Number(row.RANK),
	  }));
      res.json(ranks);
    } catch (err) {
      console.error(err.message);
    }
});

app.listen(443, () => { console.log("Server started on port 443") });
