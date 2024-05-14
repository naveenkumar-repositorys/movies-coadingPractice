let express = require("express");
let path = require("path");

let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let app = express();

let dbPath = path.join(__dirname, "moviesData.db");
let db = null;

app.use(express.json());

let convertDbObject = (eachItem) => {
  return {
    movieId: eachItem.movie_id,
    directorId: eachItem.director_id,
    movieName: eachItem.movie_name,
    leadActor: eachItem.lead_actor,
  };
};

let convertDbObjectToResponseObject = (dbFile) => {
  return {
    movieName: dbFile.movie_name,
  };
};

let initializationDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log("Db Error: ${error}");
    process.exit(1);
  }
};

initializationDbAndServer();

//API- 1

app.get("/movies/", async (request, response) => {
  let moviesList = `SELECT * FROM movie`;
  let obtainedDb = await db.all(moviesList);
  const convertedArray = obtainedDb.map((eachObject) =>
    convertDbObjectToResponseObject(eachObject)
  );

  //console.log(convertedArray);
  response.send(convertedArray);
});

//API-2

app.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  let newMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},
        "${movieName}",
        "${leadActor}"        
    );`;
  obtainedDb = await db.run(newMovieQuery);
  //console.log(obtainedDb);
  response.send("Movie Successfully Added");
});

// API-3

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let requiredMovieQuery = `SELECT * FROM movie 
    WHERE movie_id = ${movieId};`;
  let foundDb = await db.get(requiredMovieQuery);
  let requiredFormat = foundDb.map((eachItem) => convertDbObject(eachItem));
  console.log(requiredFormat);
});
