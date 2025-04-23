const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

// Data storage
let mediaData = {
    movies: [
      { id: 1, title: 'The Batman', genre: 'Action', director: 'Matt Reeves', year: 2022, rating: 7.9 },
      { id: 2, title: 'Top Gun: Maverick', genre: 'Action', director: 'Joseph Kosinski', year: 2022, rating: 8.3 },
      { id: 3, title: 'Bullet Train', genre: 'Action', director: 'David Leitch', year: 2022, rating: 7.3 },
      { id: 4, title: 'John Wick: Chapter 4', genre: 'Action', director: 'Chad Stahelski', year: 2023, rating: 8.0 }
    ],
    series: [
      { id: 1, title: 'The Last of Us', genre: 'Drama', creator: 'Craig Mazin', seasons: 1, year: 2023, rating: 8.9 },
      { id: 2, title: 'Stranger Things', genre: 'Sci-Fi', creator: 'The Duffer Brothers', seasons: 4, year: 2022, rating: 8.7 },
      { id: 3, title: 'The Mandalorian', genre: 'Sci-Fi', creator: 'Jon Favreau', seasons: 3, year: 2023, rating: 8.7 },
      { id: 4, title: 'Wednesday', genre: 'Comedy', creator: 'Alfred Gough', seasons: 1, year: 2022, rating: 8.2 }
    ],
    songs: [
      { id: 1, title: 'Die For You', artist: 'The Weeknd', genre: 'R&B', year: 2022, duration: '4:20' },
      { id: 2, title: 'CUFF IT', artist: 'Beyoncé', genre: 'R&B', year: 2022, duration: '3:45' },
      { id: 3, title: 'Under the Influence', artist: 'Chris Brown', genre: 'R&B', year: 2022, duration: '3:04' },
      { id: 4, title: 'Good Days', artist: 'SZA', genre: 'R&B', year: 2020, duration: '4:39' }
    ]
  };

// Helper functions
const helpers = {
  parseJson: (str, callback) => {
    try {
      const obj = JSON.parse(str);
      callback(false, obj);
    } catch (e) {
      callback(true, {});
    }
  },
  getNextId: (arr) => {
    return arr.length > 0 ? Math.max(...arr.map(item => item.id)) + 1 : 1;
  }
};

// Server logic
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headers = req.headers;
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  
  req.on('end', () => {
    buffer += decoder.end();
    
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' 
      ? router[trimmedPath] 
      : handlers.notFound;
    
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    };
    
    // Route the request to the handler
    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      
      payload = typeof(payload) == 'object' ? payload : {};
      
      const payloadString = JSON.stringify(payload);
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
});

// Define the handlers
const handlers = {};

// Movies handler
handlers.movies = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._movies[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._movies = {};

// Movies - GET
handlers._movies.get = (data, callback) => {
  callback(200, mediaData.movies);
};

// Movies - POST
handlers._movies.post = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.title && parsedPayload.director && parsedPayload.year) {
      const newMovie = {
        id: helpers.getNextId(mediaData.movies),
        title: parsedPayload.title,
        director: parsedPayload.director,
        year: parsedPayload.year
      };
      mediaData.movies.push(newMovie);
      callback(201, mediaData.movies);
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Movies - PUT
handlers._movies.put = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const index = mediaData.movies.findIndex(movie => movie.id === parsedPayload.id);
      if (index !== -1) {
        mediaData.movies[index] = { ...mediaData.movies[index], ...parsedPayload };
        callback(200, mediaData.movies);
      } else {
        callback(404, { error: 'Movie not found' });
      }
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Movies - DELETE
handlers._movies.delete = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const index = mediaData.movies.findIndex(movie => movie.id === parsedPayload.id);
      if (index !== -1) {
        mediaData.movies.splice(index, 1);
        callback(200, mediaData.movies);
      } else {
        callback(404, { error: 'Movie not found' });
      }
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Series handler
handlers.series = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._series[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._series = {};

// Series - GET
handlers._series.get = (data, callback) => {
  callback(200, mediaData.series);
};

// Series - POST
handlers._series.post = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.title && parsedPayload.creator && parsedPayload.seasons) {
      const newSeries = {
        id: helpers.getNextId(mediaData.series),
        title: parsedPayload.title,
        creator: parsedPayload.creator,
        seasons: parsedPayload.seasons
      };
      mediaData.series.push(newSeries);
      callback(201, mediaData.series);
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Series - PUT
handlers._series.put = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const index = mediaData.series.findIndex(series => series.id === parsedPayload.id);
      if (index !== -1) {
        mediaData.series[index] = { ...mediaData.series[index], ...parsedPayload };
        callback(200, mediaData.series);
      } else {
        callback(404, { error: 'Series not found' });
      }
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Series - DELETE
handlers._series.delete = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const index = mediaData.series.findIndex(series => series.id === parsedPayload.id);
      if (index !== -1) {
        mediaData.series.splice(index, 1);
        callback(200, mediaData.series);
      } else {
        callback(404, { error: 'Series not found' });
      }
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Songs handler
handlers.songs = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._songs[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._songs = {};

// Songs - GET
handlers._songs.get = (data, callback) => {
  callback(200, mediaData.songs);
};

// Songs - POST
handlers._songs.post = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.title && parsedPayload.artist && parsedPayload.year) {
      const newSong = {
        id: helpers.getNextId(mediaData.songs),
        title: parsedPayload.title,
        artist: parsedPayload.artist,
        year: parsedPayload.year
      };
      mediaData.songs.push(newSong);
      callback(201, mediaData.songs);
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Songs - PUT
handlers._songs.put = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const index = mediaData.songs.findIndex(song => song.id === parsedPayload.id);
      if (index !== -1) {
        mediaData.songs[index] = { ...mediaData.songs[index], ...parsedPayload };
        callback(200, mediaData.songs);
      } else {
        callback(404, { error: 'Song not found' });
      }
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

// Songs - DELETE
handlers._songs.delete = (data, callback) => {
  helpers.parseJson(data.payload, (err, parsedPayload) => {
    if (!err && parsedPayload.id) {
      const index = mediaData.songs.findIndex(song => song.id === parsedPayload.id);
      if (index !== -1) {
        mediaData.songs.splice(index, 1);
        callback(200, mediaData.songs);
      } else {
        callback(404, { error: 'Song not found' });
      }
    } else {
      callback(400, { error: 'Missing required fields' });
    }
  });
};

handlers.notFound = (data, callback) => {
  callback(404, { error: 'Route not found' });
};

// Define a request router
const router = {
  'movies': handlers.movies,
  'series': handlers.series,
  'songs': handlers.songs
};

// // Start the server
// const port = 3000;
// server.listen(port, () => {
//   console.log(`Server is listening on port ${port}`);
//   console.log(`Visit http://localhost:${port} in your browser`);
// });

const readline = require('readline');

let currentServer;
const port = 3000;

// Function to start the server
function startServer() {
  if (currentServer) {
    console.log('Server is already running.');
    return;
  }
  currentServer = server.listen(port, () => {
    console.log(`Server started on port ${port}`);
    console.log(`Visit http://localhost:${port} in your browser`);
    console.log(`Visit http://localhost:${port}/movies in your browser for movies`);
    console.log(`Visit http://localhost:${port}/series in your browser for series`);
    console.log(`Visit http://localhost:${port}/songs in your browser for songs`);
  });
}

// Function to stop the server
function stopServer() {
  if (currentServer) {
    currentServer.close(() => {
      console.log('Server stopped.');
      currentServer = null;
    });
  } else {
    console.log('Server is not running.');
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Type "start" to run server, "stop" to stop it, or "exit" to quit:');

// Listen to terminal input
rl.on('line', (input) => {
  const command = input.trim().toLowerCase();
  if (command === 'start') {
    startServer();
  } else if (command === 'stop') {
    stopServer();
  } else if (command === 'exit') {
    stopServer();
    rl.close();
    process.exit(0);
  } else {
    console.log('Unknown command. Use "start", "stop", or "exit".');
  }
});

startServer();
