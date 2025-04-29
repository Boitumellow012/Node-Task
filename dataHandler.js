const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "mediaData.json");

const defaultData = {
  movies: [
    {
      id: 1,
      title: "The Batman",
      genre: "Action",
      director: "Matt Reeves",
      year: 2022,
      rating: 7.9,
    },
    {
      id: 2,
      title: "Top Gun: Maverick",
      genre: "Action",
      director: "Joseph Kosinski",
      year: 2022,
      rating: 8.3,
    },
    {
      id: 3,
      title: "Bullet Train",
      genre: "Action",
      director: "David Leitch",
      year: 2022,
      rating: 7.3,
    },
    {
      id: 4,
      title: "John Wick: Chapter 4",
      genre: "Action",
      director: "Chad Stahelski",
      year: 2023,
      rating: 8.0,
    },
  ],
  series: [
    {
      id: 1,
      title: "The Last of Us",
      genre: "Drama",
      creator: "Craig Mazin",
      seasons: 1,
      year: 2023,
      rating: 8.9,
    },
    {
      id: 2,
      title: "Stranger Things",
      genre: "Sci-Fi",
      creator: "The Duffer Brothers",
      seasons: 4,
      year: 2022,
      rating: 8.7,
    },
    {
      id: 3,
      title: "The Mandalorian",
      genre: "Sci-Fi",
      creator: "Jon Favreau",
      seasons: 3,
      year: 2023,
      rating: 8.7,
    },
    {
      id: 4,
      title: "Wednesday",
      genre: "Comedy",
      creator: "Alfred Gough",
      seasons: 1,
      year: 2022,
      rating: 8.2,
    },
  ],
  songs: [
    {
      id: 1,
      title: "Die For You",
      artist: "The Weeknd",
      genre: "R&B",
      year: 2022,
      duration: "4:20",
    },
    {
      id: 2,
      title: "CUFF IT",
      artist: "Beyoncé",
      genre: "R&B",
      year: 2022,
      duration: "3:45",
    },
    {
      id: 3,
      title: "Under the Influence",
      artist: "Chris Brown",
      genre: "R&B",
      year: 2022,
      duration: "3:04",
    },
    {
      id: 4,
      title: "Good Days",
      artist: "SZA",
      genre: "R&B",
      year: 2020,
      duration: "4:39",
    },
  ],
};

function initDataFile() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
    console.log("Data file created with default data");
  }
}

function readData() {
  try {
    const rawData = fs.readFileSync(dataPath);
    return JSON.parse(rawData);
  } catch (err) {
    console.error("Error reading data file:", err);
    return null;
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing to data file:", err);
    return false;
  }
}

module.exports = {
  initDataFile,
  readData,
  writeData,
  getNextId: (arr) =>
    arr.length > 0 ? Math.max(...arr.map((item) => item.id)) + 1 : 1,
};
