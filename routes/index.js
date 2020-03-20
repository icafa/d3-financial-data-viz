const uuid = require("uuid"); 


module.exports = (router) => {

	router.get('/', function(req, res) {
	  res.render("index.html");
	});
	return router;
};