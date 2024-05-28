const express=require("express");
const {open}=require("sqlite");
const sqlite3=require("sqlite3");
const path=require("path");

let app=express();
app.use(express.json());

let db=null;

const dbPath=path.join(__dirname,"moviesData.db");

const initdbAndserver=async ()=>{
    try{
        db= await open({filename: dbPath,driver: sqlite3.Database});
        app.listen(3000,()=>{
            console.log("server running");
        })
    };
    catch(e){
        console.log(`error is ${e.message}`);
    }
}

initdbAndserver();

getmovienames=a=>{
    return `movieName: ${a.movie_name}`;
}



app.get("/movies/",async (request,response)=>{
    const getQuery=`SELECT * FROM movie`;
    const result=await db.all(getQuery);
    response.send(result.map(a,getmovienames(a)));
})




app.post("/movies/", async (request,response)=>{
    const {directorId,movieName,leadActor}=request.body;
    const postQuery=`INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES (${directorId},${movieName},${leadActor})`
    const postResult=await db.run(postQuery);
    response.send("Movie Successfully Added");
})





app.get("/movies/:movieId/", async (request,response)=>{
    const movieId=request.params;
    const getQuery=`SELECT * FROM movie WHERE movie_id=${movieId}`;
    const getResult=await db.get(getQuery);
    response.send(getResult);
})




app.put("/movies/:movieId/",async (request,response)=>{
    const {movieId}=request.params;
    const {directorId,movieName,leadActor}=request.body;

    const putQuery=`UPDATE movie SET director_id=${directorId},movie_name=${movieName},lead_actor=${leadActor}`;
    const putResult=await db.run(putQuery);
    response.send("Movie Details Updated");

});




app.delete("/movies/:movieId/", async (request,response)=>{
    const movieId=request.params;
    const deleteQuery=`DELETE FROM movie WHERE movie_id=${movieId}`;
    const deleteResult=await db.run(deleteQuery);
    response.send("Movie Removed");
});


getDirec=a=>{
    return `directorId: ${a.director_id},
    directorName: ${a.director_name}`
}

app.get("/directors/",async (request,response)=>{
    const getDirectors=`SELECT * FROM director`;
    const getDirectorsResult=await db.all(getDirectors);
    response.send(getDirectorsResult.map(a,getDirec(a)));
})



getdirectormovies=a=>{
    return `movieName: ${a}`;
}

app.get("/directors/:directorId/movies/",async (request,response)=>{
    const directorId=request.params;
    const getDirectorMoviesQuery=`SELECT movie_name FROM movie WHERE director_id=${directorId}`;
    const result=await db.all(getDirectorMoviesQuery);
    response.send(result.map(a,getdirectormovies(a)));
})

module.exports=app;