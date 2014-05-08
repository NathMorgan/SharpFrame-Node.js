
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * GET search page.
 */

exports.search = function(req, res){
    res.render('index', { title: 'Search' });
};