require("dotenv").config();

const   express          = require("express"),
        app              = express(),
        bodyParser       = require("body-parser"),
        mongoose         = require("mongoose"),
        session          = require("express-session"),
        flash            = require("connect-flash"),
        MongoStore       = require("connect-mongo")(session);

//Mongoose Database
const url = (process.env.DATABASEURL);
mongoose.connect(url, { useNewUrlParser: true });

// Body parser, xpress sanitizer, method override and flash configurations
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Session configuration
app.use(session({
    secret: "I love my girlfriend",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    cookie: {
        maxAge: 180 * 60 * 1000
    }
}));

// Flash config
app.use(flash());
app.use(function(req, res, next) {
    res.locals.session = req.session;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");  
    next();
});

// Index route
app.get("/", function(req, res) {
    // res.send('Hello World!');
    res.render("index");
});

// Error 404 route
app.get("*", function(req, res) {
    res.render("error");
});

console.log(process.env.PORT);
console.log(process.env.IP);
console.log(process.env.DATABASEURL)

// Tell express to listen to requests
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("SERVER HAS STARTED");
});