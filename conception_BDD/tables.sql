create table Alumni (
     idAlumni int not null auto_increment,
     name varchar(45),
   	 firstName varchar(45),
     mail varchar(100) unique not null,
     dateNaissance DATE,
   	 gender varchar(45),
     country varchar(45), 
     fabric varchar(45),
     promo varchar(45),
     dispo date,
     github varchar(100),
     portfolio varchar(100),
     twitter varchar(100),
     stackOF varchar(100),
     description varchar(500),
     cv varchar(100),
     pass varchar(250),
     primary key (idAlumni)
 );

 create table PM (
     idPM int not null auto_increment,
     titlePM varchar(100),
     contentPM varchar (500),
     idSender INT not null,
     idReceiver INT not null,
     primary key (idPM),
     foreign key (idSender) references Alumni(idAlumni),
     foreign key (idReceiver) references Alumni(idAlumni)
 );
create table Type (
  	idType int not null auto_increment,
  	nameType VARCHAR(100),
  	primary key (idType)
);
create table Post (
	idPost int not null auto_increment,
  	titlePost VARCHAR(100),
  	contentPost VARCHAR(5000),
  	datePost DATE,
  	idAlumni INT not null,
  	idType INT not null,
  	primary key (idPost),
  	foreign key (idAlumni) references Alumni(idAlumni),
	foreign key (idType) references Type(idType)
);
create table Comment (
  	idComment int not null auto_increment,
  	titleComment VARCHAR(100),
  	contentComment VARCHAR(500),
  	dateComment DATE,
  	idAlumni INT not null,
  	idPost INT not null,
  	primary key (idComment),
  	foreign key (idAlumni) references Alumni(idAlumni),
	foreign key (idPost) references Post(idPost)
);
 
