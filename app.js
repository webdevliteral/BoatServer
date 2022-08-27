const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    {MongoClient} = require('mongodb');
const http = require('http');
const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const PORT = 3000;
const mongoURL = 'mongodb+srv://dbAdmin:M73zgyd5r@cluster0.qcudk.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(mongoURL);
const cookieParser = require('cookie-parser');
const sessions = require('express-session');


const database = 'BoatBoys';
const oneDay = 1000*60*60*24;
var session;

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets/public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(sessions({
    secret: "makesurethisstayssecret",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}));

app.set("view engine", "ejs");

async function ValidateAndRegister(userInfo){
    //TODO: Salt password
    await client.connect();
    const db = client.db(database);
    const collection = db.collection('UserData');
    const insertResult = await collection.insertOne({username: userInfo.username, password: userInfo.password });
    await client.close();
}

async function ValidateAndLogin(userInfo){
    //TODO: Salt password
    await client.connect();
    const db = client.db(database);
    const collection = db.collection('UserData');
    const result = await collection.findOne({username: userInfo.username, password: userInfo.password});
    await client.close();
    if(!result) {
        console.log('Couldnt find that account!');
        return;
    }
        
    return result;
}

app.post('/register', async(req, res) => {
    await ValidateAndRegister(req.body);

    res.redirect('/');
});

app.post('/login', async(req, res) => {
    let userData = await ValidateAndLogin(req.body);
    session = req.session;
    session.userid = userData.username;
    res.redirect('/');
});

app.use(function(req, res, next){
    if(!session)
        next();
    res.locals.session = req.session;
    next();
});

app.get('/', (req, res) => {
    if(!session) {
        res.render("index");
    } else {
        session = req.session;
        res.render("index");
    }
    
});

app.get('/register', (req, res) => {
    res.render("register");
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/rps', (req, res) => {
    res.render('rps');
});

app.get('/draw', (req, res) => {
    //RESPONSES AND END
    res.render('draw');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    session = null;
    res.redirect('/');
});

//DRAW FUNCTIONS

//SOCKET IO
io.on('connection', (socket) => {
    socket.on('startDrawing', (mousePos) => {
        io.emit('startDrawing', mousePos);
    });
    socket.on('activeDrawing', (mousePos) => {
        io.emit('activeDrawing', mousePos);
    });
    socket.on('stoppedDrawing', (mousePos) => {
        io.emit('stoppedDrawing', mousePos);
    });
    socket.on('disconnect', (socket) => {
        console.log('A user has left the draw page.');
    });
});

server.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});