const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

// check connection
db.once('open', ()=>{
	console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err)=>{
	console.log(err);
});

const app = express();

// Bring in Models
let Article = require('./models/article');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parse Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Middleware
app.use(session({
	secret: 'keyboard cat',
	resalve: true,
	saveUninitialized: true
}))

//Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next)=>{
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: 	(param, msg, value)=>{
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length)
			formParam += '[' + namespace.shift() + ']'; 
		return {
			param: formParam,
			msg: msg,
			value: value
		}; 

	}	
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Home Route
app.get('/', (reg, res)=>{
	Article.find({}, (err, articles)=>{
		if (err){
			console.log(err);
		} else {
			res.render('index', { title: 'Articles', articles: articles });
		}
	})
});

// Route Files
let articles = require('./routes/articles')	;
let users = require('./routes/users')	;
app.use('/articles', articles);
app.use('/users', users);

app.listen(3000, ()=>{
	console.log('Server started on port 3000 ...');
});