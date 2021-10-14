const express = require('express');
const app = express();
const port = 3000;

const mysql = require('mysql');
const con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "expressjs-crud-mysql"
});
con.connect(function(err) {
	if (err) throw err;
	console.log("Database Connected!");
});

let notices = [];

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	let s_sql_get_users = "SELECT * FROM users";
	con.query(s_sql_get_users, function (err, results, fields) {
		if (err) throw err;
		res.render('pages/index', {
			users: results
		});
	});
});

app.get('/user-add', (req, res) => {
	res.render('pages/user-add');
});

app.post('/user-add', function (req, res) {
	notices = [];
	let fName = req.body.txtFName || '';
	let lName = req.body.txtLName || '';
	if(fName != '' && lName != '') {
		let s_sql_count_exist = `SELECT COUNT(*) AS users_count FROM users WHERE first_name = '${fName}' AND last_name = '${lName}'`;
		con.query(s_sql_count_exist, function (err, results, fields) {
			if (err) throw err;
			if(results[0].users_count >= 1) {
				notices.push('User already exist');
				res.render('pages/user-add', {
					notices: notices
				});
			}
			else {
				let s_sql_insert = `INSERT INTO users (first_name, last_name) VALUES ('${fName}', '${lName}')`;
				con.query(s_sql_insert, function (err, result) {
					if (err) throw err;
					notices.push('User Added');
					res.render('pages/user-add', {
						notices: notices
					});
				});
			}
		});
	}
	else {
		res.render('pages/user-add');
	}

});

app.get('/user-edit/:userId', function (req, res) {
	notices = [];
	let userId = req.params.userId || '';
	if(userId != '') {
		let s_sql_get_user = `SELECT * FROM users WHERE id = '${userId}' LIMIT 1`;
		con.query(s_sql_get_user, function (err, results, fields) {
			if (err) throw err;
			if(results.length > 0) {
				res.render('pages/user-edit', {
					result: results[0]
				});
			}
			else {
				notices.push('User NOT Found');
				res.render('pages/user-edit', {
					notices: notices
				});
			}
		});
	}
	else {
		res.redirect('/');
	}
});

app.post('/user-edit/:userId', function (req, res) {
	notices = [];
	let fName = req.body.txtFName || '';
	let lName = req.body.txtLName || '';
	let userId = req.params.userId || '';
	if (fName != '' && lName != '' && userId != '') {
		let s_sql_update_user = `UPDATE users SET first_name = '${fName}', last_name = '${lName}' WHERE id = '${userId}'`;
		con.query(s_sql_update_user, function (err, result) {
			if (err) throw err;
			notices.push('User Updated');
			res.render('pages/user-edit', {
				notices: notices,
				result: {id: userId, first_name: fName, last_name: lName}
			});
		});
	}
	else {
		res.redirect('/');
	}
});

app.post('/user-delete/:userId', function (req, res) {
	notices = [];
	let userId = req.params.userId || '';
	if (userId != '') {
		let s_sql_delete_user = `DELETE FROM users WHERE id = '${userId}'`;
		con.query(s_sql_delete_user, function (err, result) {
			if (err) throw err;
			notices.push('User Deleted');
			res.render('pages/user-deleted', {
				notices: notices
			});
		});
	}
	else {
		res.redirect('/');
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
});