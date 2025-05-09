const csv = require('csv-parser');
const fs = require('fs');
const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors());

function getFileName(plot, type) {
  const key = plot.toLowerCase();
  const base = key === "breast cancer"
    ? "breast_cancer"
    : key === "lung cancer"
    ? "lung_cancer"
    : key === "gi oncology"
    ? "gi_oncology"
    : null;

  if (!base) return null;

  return `${base}_${type}.csv`;
}

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
      const fileName = getFileName(req.query.plot, "points");

      const result = await readCSV(fileName);
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
      const fileName = getFileName(req.query.plot, "labels");

      console.log("Reading file:", fileName);
      const result = await readCSV(fileName);
      console.log("CSV rows:", result.slice(0, 3)); // show first few rows
      const labels = result.map(row => ({
        CLUSTER: Number(row.CLUSTER),
        LABEL: row.LABEL,
        X: Number(row.X),
        Y: Number(row.Y),
      }));
      res.json(labels);
    } catch (err) {
      console.log("Error Fetching Labels");
      console.error(err.message);
    }
});

app.get("/api/ranks", async (req, res) => {
    try {
      const fileName = getFileName(req.query.plot, "labels");
      const result = await readCSV(fileName);
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

app.listen(4000, () => { console.log("Server started on port 4000") });
