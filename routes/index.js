
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Home' });
};

/*
 * GET about page.
 */

exports.about = function(req, res){
    res.render('about', { title: 'About' });
};

/*
 * GET search page.
 */

exports.search = function(req, res){
    res.render('search', { title: 'Search' });
};