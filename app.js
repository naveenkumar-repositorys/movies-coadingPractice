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

let getDirectorsNames = (dbResponse) => {
  return {
    directorName: dbResponse.director_name,
  };
};

const onlyDirectorMovies = (dbResponse) => {
  return {
    movieName: dbResponse.movie_name,
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
    WHERE 
        movie_id = ${movieId};`;
  let foundDb = await db.get(requiredMovieQuery);
  //console.log(foundDb);
  let requiredFormat = convertDbObject(foundDb);
  //console.log(requiredFormat);
  response.send(requiredFormat);
});

//API-4

app.put("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let { directorId, movieName, leadActor } = request.body;
  const updatedQuery = `UPDATE  movie
    SET 
        director_id = ${directorId},
        movie_name = "${movieName}",
        lead_actor = "${leadActor}"
    WHERE 
        movie_id = ${movieId};`;

  let dbResponse = await db.run(updatedQuery);
  //console.log(dbResponse);
  response.send("Movie Details Updated");
});

//API-5

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let deleteQuery = `DELETE FROM movie
    WHERE 
        movie_id = ${movieId};`;
  let deletedDb = await db.run(deleteQuery);
  //console.log(deletedDb);
  response.send("Movie Removed");
});

//API-6

app.get("/directors/", async (request, response) => {
  let gettingListOfDirectorsQuery = `SELECT * FROM director`;
  let dbResponse = await db.all(gettingListOfDirectorsQuery);
  let getObjectEle = dbResponse.map((eachEle) => getDirectorsNames(eachEle));
  //console.log(getObjectEle);
  response.send(getObjectEle);
});

// API-7

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  const moviesOFDirectorQuery = `SELECT * FROM movie 
        WHERE 
            director_id = ${directorId};`;
  let dbResponse = await db.all(moviesOFDirectorQuery);
  let responseObject = dbResponse.map((eachItem) =>
    onlyDirectorMovies(eachItem)
  );
  console.log(responseObject);
  response.send(responseObject);
});

module.exports = app;

