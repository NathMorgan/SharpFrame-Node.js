/*
 * GET register page.
 */

exports.register = function(req, res){
    res.render('register', { title: 'Register' });
};

/*
 * GET login page.
 */

exports.login = function(req, res){
    res.render('login', { title: 'Login' });
};

/*
 * GET logout page.
 */

exports.logout = function(req, res){
    res.render('logout', { title: 'Logout' });
};