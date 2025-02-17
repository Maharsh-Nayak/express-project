const express = require('express');
const app = express();
const mysql = require('mysql2');
const { faker } = require('@faker-js/faker');
const path = require('path');
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
});

let createRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password()
    ];
}
let data=[];
let q="select * from user";
try{
    connection.query(
        q,(err, results) => {
            if(err) throw err;
            data=results;
            console.log(data);
        }
    );
}catch(err){
    console.log(err);
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


app.get("/posts", (req, res) => {
    res.render('index', {data});
});

// Starting all curd operations : 

//New account creation
app.get("/posts/new", (req, res) => {
    res.render('newAccount');
});
app.post("/posts/new", (req, res) => {
    const { userid, username, email, password } = req.body;
    let q="insert into user values (?,?,?,?)";
    let value=[userid, username, email, password];
    try{
        connection.query(
            q,value,(err, results) => {
                if(err) throw err;
                console.log(results);
            }
        );
    }
    catch(err){
        console.log(err);
    }
    data.push({userid, username, email, password});
    res.redirect('/posts');
});

//Edit Account
app.get("posts/edit/:id" , (req, res) => {
    const { id } = req.params;
    const user = data.find(p => p.userid === id);
    res.render('edit', { user });
});
app.patch("/posts/edit/:id", (req, res) => {
    let {id} = req.params;
    data.find(p => p.userid === id).username = req.body.username;
    res.redirect('/posts');
});

//Delete Account
app.delete("/posts/delete/:id", (req, res) => {
    let {id}= req.params;
    data.splice(data.findIndex(p => p.userid === id), 1);
    let q="delete from user where userid=?";
    let value=[id];
    try{
        connection.query(
            q, value, (err, results) => {
                if(err) throw err;
                console.log(results);
            }
        );
    }
    catch(err){
        console.log(err);
    }
    res.redirect('/posts');
});
