const mysql = require('mysql');
let connection = mysql.createConnection({
	host: 'den1.mysql5.gear.host',
	user: 'simplon',
	password: 'Nv9Cx8S?h5?R',
	database: 'simplon'
});
module.exports= connection;