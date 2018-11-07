const express = require('express'),
app = express(),
mysql = require('mysql'),
bodyparser = require('body-parser'),
session = require('express-session'),
bcrypt = require('bcrypt-nodejs'),
connection=require('./bdd.js'),
flash = require('express-flash'),
cookieParser = require('cookie-parser'),
ent=require('ent');
//les fichiers statiques se trouveront dans le dossier public
app.use(express.static('public'));
//Differents use pour les flash messages
app.use(cookieParser());
app.use(flash());
//Utilisation de express session
app.use(session({secret: 'ssshhhhh',
	resave: true,
	saveUninitialized: true}
	));
//Preparation à l'utilisation de express session
let sess;
//Utilisation de body-parser par le serveur
app.use(bodyparser.urlencoded({extended: false}));

// Définition du moteur de template
app.set('view engine', 'ejs');

// Définition de la route racine
app.get("/", function (req, res) {
	sess=req.session;
	//si on a un username on redirige à l'index. Sinon on va à la connexion
	if(sess.mail){
		//listing de tous les posts 
		let listpost="select * from post,alumni,type where post.idAlumni=alumni.idAlumni and post.idType = type.idType"
		connection.query(listpost,(error,resultpost,field)=>{
			let listtype="select * from type"
			connection.query(listtype, (errtype,restype,fieldtype)=>{
				res.render('index',{name:sess.name, firstName:sess.firstName, mail:sess.mail, posts:resultpost, types:restype});
			})
		})
	}else{
		res.render('choice');
	}
});

app.get("/filter/:id", (req, res) => {
	sess=req.session;
	if(sess.mail){
		//listing de tous les posts 
		let listpost="select * from post,alumni,type where post.idAlumni=alumni.idAlumni and post.idType = type.idType and post.idType="+req.params.id;
		connection.query(listpost,(error,resultpost,field)=>{
			let listtype="select * from type"
			connection.query(listtype, (errtype,restype,fieldtype)=>{
				res.render('index',{name:sess.name, firstName:sess.firstName, mail:sess.mail, posts:resultpost, types:restype});
			})
		})
	}else{
		res.render('choice');
	}
});

app.get("/read/:id", (req,res) => {
	sess=req.session;
	//si on a un mail alumni on redirige vers la page du post. Sinon on va à la connexion
	if(sess.mail){
		//affichage du post 
		let affpost="select * from post,alumni,type where post.idAlumni=alumni.idAlumni and post.idType = type.idType and post.idPost="+req.params.id;
		connection.query(affpost,(error,respost,field)=>{
			//affichage des types de post pour le menu
			let listtype="select * from type"
			connection.query(listtype, (errtype,restype,fieldtype)=>{
				//affichage des commentaires liés au post
				let listcomm="select * from comment,alumni where comment.idAlumni=alumni.idAlumni and idPost="+req.params.id;
				connection.query(listcomm, (errcom,rescom,fieldcom)=>{
					res.render('read',{name:sess.name, firstName:sess.firstName, mail:sess.mail, post:respost[0], types:restype, comments:rescom});
				})
				
			})
		})
	}else{
		res.render('choice');
	}
})

app.get('/addcomment/:id',(req,res)=>{
	sess=req.session;
	if(sess.mail){
		res.render('addcomment',{idPost:req.params.id});
	}else{
		res.render('choice');
	}
})

app.post('/addcomment/:id', (req,res)=>{
	sess=req.session;
	if(sess.mail){
		let titleComment=ent.encode(req.body.titleComment);
		let contentComment=ent.encode(req.body.contentComment);
		let idAlumni=req.session.idAlumni;
		let idPost=req.params.id;
		let reqaddC=`insert into comment (titleComment,contentComment,dateComment,idAlumni,idPost)values('${titleComment}','${contentComment}',NOW(),${idAlumni},${idPost})`;
		connection.query(reqaddC, (error,results,field)=>{
			console.log(reqaddC);
			res.redirect('/read/'+idPost);
		})
	}else{
		res.render('choice');
	}
})

//Page login
app.get('/login', function(req,res){
	res.render('login',{login:'Connect'});
});
//Page register
app.get('/register',function(req,res){
	res.render('login');
});

//Deconnexion
app.get('/logout',function(req,res){
	req.session.destroy((err)=> {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/');
		}
	});
});

//Lors d'une tentative de connexion
app.post('/login',function(req,res){
	sess=req.session;
	let mail=ent.encode(req.body.mail);
	let password=ent.encode(req.body.password);
	let connect=`SELECT * FROM Alumni WHERE mail='${mail}'`;
	connection.query(connect,function(error,results,field){
		if(error){
			console.log(error);
		}
		else if(results.length>0){
			if (bcrypt.compareSync(password, results[0].pass)) {
				sess.idAlumni=results[0].idAlumni;
				sess.mail=mail;
				sess.name=results[0].name;
				sess.firstName=results[0].firstName;
				res.redirect('/');
			}else{
				req.flash('Error','Mauvais Login/Mot de passe !');
				res.redirect('/login');
			}
		}else{
			req.flash('Error','Mauvais Login/Mot de passe !');
			res.redirect('/login');
		}
	})
});
//Lors d'une inscription
app.post('/register',function(req,res){
	let pass=ent.encode(req.body.password);
	let mail=ent.encode(req.body.mail);
	let name=ent.encode(req.body.name);
	let firstName=ent.encode(req.body.firstName);
	//on vérifie d'abord que le nom d'utilisateur n'existe pas déjà
	let exist=`SELECT * FROM Alumni WHERE mail='${mail}'`;
	connection.query(exist, function(errEx,resEx,fieldEx){
		if (resEx.length!=0){
			req.flash('Error','Le nom d\'utilisateur existe déjà !');
			res.redirect('/register');
		}else{
			bcrypt.hash(pass,null,null,function(err,hash){
				let createAccount = `INSERT INTO Alumni (name,firstName,mail,pass) VALUES ('${name}','${firstName}','${mail}','${hash}')`;
				connection.query(createAccount,function(error,results,field){
					if(error){
						console.log(error);
					}else{
						res.redirect('/');
					}
				});
			})
		}
	})
});
app.get('/addpost',(req,res)=>{
	sess=req.session;
	if(sess.mail){
		let reqtype="SELECT * from type";
		connection.query(reqtype, (error,results,field)=>{
			res.render('addpost',{types:results});
		});
	}else{
		res.render('choice');
	}
})
app.post('/addpost',(req,res)=>{
	var sess=req.session;
	console.log(sess);
	if(sess.mail){
		let titlePost=ent.encode(req.body.titlePost);
		let contentPost=ent.encode(req.body.contentPost);
		let idType=ent.encode(req.body.type);
		let idAlumni=req.session.idAlumni;
		let reqadd=`insert into post (titlePost,contentPost,datePost,idAlumni,idType)values('${titlePost}','${contentPost}',NOW(),${idAlumni},${idType})`;
		connection.query(reqadd, (error,results,field)=>{
			console.log(reqadd)
			res.redirect('/');
		});
	}else{
		res.render('choice');
	}
})

// Lancement du serveur
const server = app.listen(process.env.PORT || 8080, (req, res) =>
	console.log('Server Ready')
	);
