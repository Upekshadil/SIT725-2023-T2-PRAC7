let express = require('express');
let app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://upekshadilval:admin123@cluster0.hbdjagh.mongodb.net/?retryWrites=true&w=majority";
let port = process.env.port || 3000;
let collection;

let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.use(express.static(__dirname + '/'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

io.on('connection',(socket)=>{
    console.log('a client has connected');
    socket.on('disconnect', () => {
        console.log('a client has disconnected');
    });

    setInterval(()=>{
        socket.emit('number', parseInt(Math.random()*10));
    }, 1000)
});

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function runDBConnection() {
    try {
        await client.connect();
        collection = client.db().collection('anime');
        console.log(collection);
    } catch(ex) {
        console.error(ex);
    }
}

app.get('/', function (req,res) {
    res.render('index.html');
});

app.get('/api/anime', (req,res) => {
    getAllAnime((err,result)=>{
        if (!err) {
            res.json({statusCode:200, data:result, message:'get all data successful'});
        }
    });
});

app.post('/api/anime', (req,res)=>{
    let anime = req.body;
    postAnime(anime, (err, result) => {
        if (!err) {
            res.json({statusCode:201, data:result, message:'success'});
        }
    });
});

function postAnime(anime,callback) {
    collection.insertOne(anime,callback);
}

function getAllAnime(callback){
    collection.find({}).toArray(callback);
}

http.listen(port, ()=>{
    console.log('express server started');
    runDBConnection();
});