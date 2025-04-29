const http = require("http");
const url = require("url");
const { StringDecoder } = require("string_decoder");
const fs = require("fs");
const path = require("path");
const dataHandler = require("./dataHandler");

dataHandler.initDataFile();

const parseJson = (str, callback) => {
  try {
    const obj = JSON.parse(str);
    callback(false, obj);
  } catch (e) {
    callback(true, {});
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headers = req.headers;
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    if (trimmedPath === "") {
      serveApiDocumentation(res);
      return;
    }

    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer,
    };

    chosenHandler(
      data,
      (statusCode, payload, contentType = "application/json") => {
        statusCode = typeof statusCode == "number" ? statusCode : 200;

        payload = typeof payload == "object" ? payload : {};

        let payloadString;
        if (contentType === "application/json") {
          payloadString = JSON.stringify(payload);
        } else {
          payloadString = payload;
        }

        res.setHeader("Content-Type", contentType);
        res.writeHead(statusCode);
        res.end(payloadString);
      }
    );
  });
});

function serveApiDocumentation(res) {
  const docPath = path.join(__dirname, "api-documentation.html");
  fs.readFile(docPath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error loading API documentation");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
}

const handlers = {};

function createMediaHandler(type) {
  return function (data, callback) {
    const acceptableMethods = ["get", "post", "put", "delete"];

    if (acceptableMethods.indexOf(data.method) > -1) {
      handlers[`_${type}`][data.method](data, callback);
    } else {
      callback(405);
    }
  };
}

handlers.movies = createMediaHandler("movies");
handlers._movies = {};

// Movies - GET
handlers._movies.get = (data, callback) => {
  const mediaData = dataHandler.readData();
  callback(200, mediaData.movies);
};

// Movies - POST
handlers._movies.post = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (
      !err &&
      parsedPayload.title &&
      parsedPayload.director &&
      parsedPayload.year
    ) {
      const mediaData = dataHandler.readData();
      const newMovie = {
        id: dataHandler.getNextId(mediaData.movies),
        title: parsedPayload.title,
        director: parsedPayload.director,
        year: parsedPayload.year,
        genre: parsedPayload.genre || "",
        rating: parsedPayload.rating || 0,
      };
      mediaData.movies.push(newMovie);
      if (dataHandler.writeData(mediaData)) {
        callback(201, newMovie);
      } else {
        callback(500, { error: "Failed to save data" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Movies - PUT
handlers._movies.put = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const mediaData = dataHandler.readData();
      const index = mediaData.movies.findIndex(
        (movie) => movie.id === parsedPayload.id
      );
      if (index !== -1) {
        mediaData.movies[index] = {
          ...mediaData.movies[index],
          ...parsedPayload,
        };
        if (dataHandler.writeData(mediaData)) {
          callback(200, mediaData.movies[index]);
        } else {
          callback(500, { error: "Failed to save data" });
        }
      } else {
        callback(404, { error: "Movie not found" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Movies - DELETE
handlers._movies.delete = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const mediaData = dataHandler.readData();
      const index = mediaData.movies.findIndex(
        (movie) => movie.id === parsedPayload.id
      );
      if (index !== -1) {
        const deletedMovie = mediaData.movies.splice(index, 1)[0];
        if (dataHandler.writeData(mediaData)) {
          callback(200, deletedMovie);
        } else {
          callback(500, { error: "Failed to save data" });
        }
      } else {
        callback(404, { error: "Movie not found" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Series handler
handlers.series = createMediaHandler("series");
handlers._series = {};

// Series - GET
handlers._series.get = (data, callback) => {
  const mediaData = dataHandler.readData();
  callback(200, mediaData.series);
};

// Series - POST
handlers._series.post = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (
      !err &&
      parsedPayload.title &&
      parsedPayload.creator &&
      parsedPayload.seasons
    ) {
      const mediaData = dataHandler.readData();
      const newSeries = {
        id: dataHandler.getNextId(mediaData.series),
        title: parsedPayload.title,
        creator: parsedPayload.creator,
        seasons: parsedPayload.seasons,
        genre: parsedPayload.genre || "",
        year: parsedPayload.year || new Date().getFullYear(),
        rating: parsedPayload.rating || 0,
      };
      mediaData.series.push(newSeries);
      if (dataHandler.writeData(mediaData)) {
        callback(201, newSeries);
      } else {
        callback(500, { error: "Failed to save data" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Series - PUT
handlers._series.put = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const mediaData = dataHandler.readData();
      const index = mediaData.series.findIndex(
        (series) => series.id === parsedPayload.id
      );
      if (index !== -1) {
        mediaData.series[index] = {
          ...mediaData.series[index],
          ...parsedPayload,
        };
        if (dataHandler.writeData(mediaData)) {
          callback(200, mediaData.series[index]);
        } else {
          callback(500, { error: "Failed to save data" });
        }
      } else {
        callback(404, { error: "Series not found" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Series - DELETE
handlers._series.delete = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const mediaData = dataHandler.readData();
      const index = mediaData.series.findIndex(
        (series) => series.id === parsedPayload.id
      );
      if (index !== -1) {
        const deletedSeries = mediaData.series.splice(index, 1)[0];
        if (dataHandler.writeData(mediaData)) {
          callback(200, deletedSeries);
        } else {
          callback(500, { error: "Failed to save data" });
        }
      } else {
        callback(404, { error: "Series not found" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Songs handler
handlers.songs = createMediaHandler("songs");
handlers._songs = {};

// Songs - GET
handlers._songs.get = (data, callback) => {
  const mediaData = dataHandler.readData();
  callback(200, mediaData.songs);
};

// Songs - POST
handlers._songs.post = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (
      !err &&
      parsedPayload.title &&
      parsedPayload.artist &&
      parsedPayload.year
    ) {
      const mediaData = dataHandler.readData();
      const newSong = {
        id: dataHandler.getNextId(mediaData.songs),
        title: parsedPayload.title,
        artist: parsedPayload.artist,
        year: parsedPayload.year,
        genre: parsedPayload.genre || "",
        duration: parsedPayload.duration || "0:00",
      };
      mediaData.songs.push(newSong);
      if (dataHandler.writeData(mediaData)) {
        callback(201, newSong);
      } else {
        callback(500, { error: "Failed to save data" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Songs - PUT
handlers._songs.put = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const mediaData = dataHandler.readData();
      const index = mediaData.songs.findIndex(
        (song) => song.id === parsedPayload.id
      );
      if (index !== -1) {
        mediaData.songs[index] = {
          ...mediaData.songs[index],
          ...parsedPayload,
        };
        if (dataHandler.writeData(mediaData)) {
          callback(200, mediaData.songs[index]);
        } else {
          callback(500, { error: "Failed to save data" });
        }
      } else {
        callback(404, { error: "Song not found" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

// Songs - DELETE
handlers._songs.delete = (data, callback) => {
  parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const mediaData = dataHandler.readData();
      const index = mediaData.songs.findIndex(
        (song) => song.id === parsedPayload.id
      );
      if (index !== -1) {
        const deletedSong = mediaData.songs.splice(index, 1)[0];
        if (dataHandler.writeData(mediaData)) {
          callback(200, deletedSong);
        } else {
          callback(500, { error: "Failed to save data" });
        }
      } else {
        callback(404, { error: "Song not found" });
      }
    } else {
      callback(400, { error: "Missing required fields" });
    }
  });
};

handlers.notFound = (data, callback) => {
  callback(404, { error: "Route not found" });
};

const router = {
  movies: handlers.movies,
  series: handlers.series,
  songs: handlers.songs,
};

// Start the server
// const port = 3000;
// server.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
//   console.log(
//     `Visit http://localhost:${port} in your browser for API documentation`
//   );
// });


const readline = require("readline");

let currentServer;
const port = 3000;

// Function to start the server
function startServer() {
  if (currentServer) {
    console.log("Server is already running.");
    return;
  }
  currentServer = server.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log(`Visit http://localhost:${port} in your browser`);
    console.log(
      `Visit http://localhost:${port}/movies in your browser for movies`
    );
    console.log(
      `Visit http://localhost:${port}/series in your browser for series`
    );
    console.log(
      `Visit http://localhost:${port}/songs in your browser for songs`
    );
  });
}

// Function to stop the server
function stopServer() {
  if (currentServer) {
    currentServer.close(() => {
      console.log("Server stopped.");
      currentServer = null;
    });
  } else {
    console.log("Server is not running.");
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  'Type "start" to run server, "stop" to stop it, or "exit" to quit:'
);

// Listen to terminal input
rl.on("line", (input) => {
  const command = input.trim().toLowerCase();
  if (command === "start") {
    startServer();
  } else if (command === "stop") {
    stopServer();
  } else if (command === "exit") {
    stopServer();
    rl.close();
    process.exit(0);
  } else {
    console.log('Unknown command. Use "start", "stop", or "exit".');
  }
});

startServer();
