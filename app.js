const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodeScratchExpress');
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
	resalve: false,
	saveUninitialized: true,
	cookie: {secure: true}
}))

//Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next)=>{
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: 	(param, messages, value)=>{
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

app.get('/', (reg, res)=>{
	Article.find({}, (err, articles)=>{
		if (err){
			console.log(err);
		} else {
			res.render('index', { title: 'Articles', articles: articles });
		}
	})
});

// Get Single Article
app.get('/article/:id', (req,res)=>{
	Article.findById(req.params.id, (err, article)=>{
		res.render('article', {
			article: article
		})
		return;
	})
});

//Add route
app.get('/articles/add', (req, res)=>{
	res.render('add_article', {
		title: 'Add Article'
	});
})

// Add Submit POST Route
app.post('/article/add',(req,res)=>{
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;
	article.save((err)=>{
		if(err){
			console.log(err);
			req.flash('danger','Article Added');
			return;
		} else {
			req.flash('success','Article Added');
			res.redirect('/');
		}
	});
});

// Get Single Article
app.get('/article/edit/:id', (req,res)=>{
	Article.findById(req.params.id, (err, article)=>{
		res.render('edit_article', {
			title: 'Edit Article', 
			article: article
		})
		return;
	})
});

// Update Submit POST Route
app.post('/article/edit/:id',(req,res)=>{
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id: req.params.id}

	Article.update(query, article, (err)=>{
		if(err){
			console.log(err);
			return;
		} else {
			res.redirect('/');
		}
	});
});

app.delete('/article/:id', (req,res)=>{
	let query = {_id:req.params.id};

	Article.remove(query, (err)=>{
		if(err){
			console.log(err);
		}
		res.send('Success');
	})

})


app.listen(3000, ()=>{
	console.log('Server started on port 3000 ...');
});