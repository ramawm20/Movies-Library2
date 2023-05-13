'use strict'

//declerations
const express = require("express");
const cors = require("cors")
const server = express();
require('dotenv').config();
const pg = require('pg')
server.use(cors())
const PORT = process.env.PORT;
const axios = require("axios")
const data = require("./data.json")
const apikey = process.env.APIkey;
const DBURL=process.env.DatabaseUrl;
server.use(express.json())


const client = new pg.Client(`${DBURL}`)
//calling functions
server.get('/', home)
server.get('/favorite', favorite)
server.get('/trending', trending)
server.get('/search', search)
server.get('/genres', genres)
server.get('/favactor', favActor)
server.get('/getMovies', getMovies)
server.post('/getMovies', addMovies)
server.delete('/getMovies/:id', deleteMovie)
server.put('/getMovies/:id', updateMovie)
server.get('/getMovies/:id', getSpecificMovie)
server.get('*', notFound)


server.use(errorHandler)

//home function to display home 
function home(req, res) {
    function Movies(title, posterPath, overview) {
        this.title = title;
        this.postPath = posterPath;
        this.overview = overview;
    }
    let movie1 = new Movies(data.title, data.poster_path, data.overview)
    res.send(movie1);
}

//favorite function to display favorite page
function favorite(req, res) {
    res.send("Welcome to favorite page")
}

//page not found function to handle not found pages
function notFound(req, res) {
    res.status(404).send("Page not found")
}

//lab14
//constructor
function Movies(id, title, release_date, poster_path, overview) {
    this.id = id
    this.title = title
    this.date = release_date;
    this.path = poster_path
    this.overview = overview
}

//trending function to display trending page
async function trending(req, res) {
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apikey}&language=en-US`
    let result = await axios.get(url)
    console.log(result.data);
    let mapResult = result.data.results.map(item => {
        let m = new Movies(item.id, item.original_title, item.release_date, item.backdrop_path, item.overview)
        return m;
    })
    res.send(mapResult)
}

//search function to display search page
function search(req, res) {
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&language=en-US&query=The&page=2`
    axios.get(url)
        .then(result => {
            let r = result.data;
            res.send(r)
        }
        )
        .catch((error) => {
            errorHandler(error,req,res)
        })
}

//genres function to display type of movies in general
function genres(req, res) {
    let url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apikey}&language=en-US`
    try {
        axios.get(url)
            .then(result => {
                let r = result.data
                res.send(r)
            })
            .catch((error) => {
               errorHandler(error,req,res)
            })

    }
    catch (error) {
        errorHandler(error, req, res)
    }
}

//favActor function that display info of one of my favorite actors
function favActor(req, res) {
    let url = `https://api.themoviedb.org/3/person/287?api_key=${apikey}&language=en-US`
    axios.get(url)
        .then(result => {
            let r = result.data;
            res.send(r)
        }
        )
        .catch((error) => {
            errorHandler(error, req, res)
        })
        

}

//lab 15 functions
//get all movies function
function getMovies(req, res) {
    const sql = 'SELECT * FROM favoriteMovie'
    client.query(sql)
        .then(data => {
            res.send(data.rows)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })

}

//add movie to the DB
function addMovies(req, res) {
    const movie = req.body;
    console.log(movie);
    const sql = `INSERT INTO favoriteMovie (title, summary, years, comment)
    VALUES ($1, $2, $3, $4);`
    const values = [movie.title, movie.summary, movie.years, movie.comment];
    client.query(sql, values)
        .then(data => {
            res.status(201).send("Your data added successfully, Congrats")
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })

}

//lab 16 functions
//function to delete specific movie from DB
function deleteMovie(req, res) {
    const { id } = req.params;
    const sql = `DELETE FROM favoriteMovie WHERE id=${id}`
    client.query(sql)
        .then((data) => {
            res.status(200).send(data)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })

}

//function to ubdate specific movie 
function updateMovie(req, res) {

    const { id } = req.params;
    console.log(req.body);
    const sql = `UPDATE favoriteMovie SET comment= $1 WHERE id=${id};`

    const { comment } = req.body;
    const values = [comment];

    client.query(sql, values)
        .then((data) => {
            res.status(205).send(data)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}

//function to get specific movie by the id
function getSpecificMovie(req, res) {
    const { id } = req.params;
    const sql = `SELECT * FROM favoriteMovie WHERE id=${id}`

    client.query(sql)
        .then((data) => {
            res.status(200).send(data.rows)
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}


//error handler function
function errorHandler(error, req, res) {
    const err = {
        status: 500,
        message: error
    }
    res.status(500).send(err);
}

//connect to the server
client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Listening on ${PORT} : I am ready `);
        })
    })
