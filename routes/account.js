/*
 * GET register page.
 */

exports.register = function(req, res){
    res.render('index', { title: 'Register' });
};

/*
 * GET login page.
 */

exports.login = function(req, res){
    res.render('index', { title: 'Login' });
};

/*
 * GET logout page.
 */

exports.logout = function(req, res){
    res.render('index', { title: 'Logout' });
};