require("dotenv").config();

const   express          = require("express"),
        app              = express(),
        bodyParser       = require("body-parser"),
        mongoose         = require("mongoose"),
        session          = require("express-session"),
        flash            = require("connect-flash"),
        MongoStore       = require("connect-mongo")(session),
        nodemailer       = require("nodemailer");

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
    secret: process.env.SECRETCODE,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    cookie: {
        maxAge: 180 * 60 * 1000
    }
}));

// MomentJS configuration
app.locals.moment = require("moment");

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

// Post route
app.post("/", function(req,res) {
    if (req.body) {
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAILUSERNAME,
            pass: process.env.GMAILPW
        }
    });
    var mailOptions = {
        from: 'Bonpreu Foods ' + process.env.GMAILUSERNAME,
        //to: 'repuestosotomayorca@gmail.com',
        to: process.env.GMAILUSERNAME,
        replyTo: req.body.email,
        subject: 'Repuestos Sotomayor - Nuevo Mensaje',
        text: 'Tiene un mensaje con los próximos detalles: Nombre Completo: ' + req.body.name + ', Número: ' + req.body.mobile + ', Message: ' + req.body.message,
        // Full message with mobile number > html: '<p><img src="https://www.bonpreufoods.com/images/logo-only-small.png"></p><h3>You have a submission with the following details:</h3><ul><li>Name: ' + req.body.name + ' </li><li>Phone: ' + req.body.phone + ' </li><li>Email: ' + req.body.email + ' </li><li>Country: ' + req.body.country + ' </li><li>State: ' + req.body.state + ' </li></ul><p><h3>Message</h3>: <br/> ' + req.body.message + ' </p>'
        html: '<p><img src="https://www.bonpreufoods.com/images/logo-only-small.png"></p><h3>Ha recibido un nuevo mensaje con los próximos detalles:</h3><ul><li>Nombre Completo: ' + req.body.name + ' </li><li>Número: ' + req.body.number + ' </li><li>Email: ' + req.body.email + ' </li></ul><br><p><h3>Mensaje completo:</h3>: ' + req.body.message + ' </p><br><p>Este ha sido un correo es automatizado, favor no responder a este correo.</p>'
    };
    // Sending message
    smtpTransport.sendMail(mailOptions, function(err) {
        if (err) {
            req.flash("error", "Algo salió mal. Si este problema persiste por favor póngase en contacto con nosotros para arreglar este problema, nos disculpamos de antemano.");
            return res.redirect("/");
        } else {
            req.flash('success', "¡Su mensaje ha sido enviado con éxitosamente! Nos pondremos en contacto con usted lo más pronto posible.") ;
            return res.redirect('/');
        }
    });
    } else {
        req.flash("error", "Por favor, déjenos un mensaje llenando las casillas respectivas.");
        res.redirect('/');
    }
})

// Error 404 route
app.get("*", function(req, res) {
    res.render("error");
});

// Tell express to listen to requests
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("SERVER HAS STARTED ON PORT: " + process.env.PORT);
});