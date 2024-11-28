
/*exports.homeRoute = (req, res) => {
    // Check if JWT token is present in request cookies
  const jwtToken = req.cookies.jwt;
  if (jwtToken) {
    // Redirect to indexafterlogin route
    res.redirect("/login");
  } else {
    // Render the index page
    res.render("sign_page");
  }
  };
  */

exports.homeRoute = (req, res) => {
    res.render("index");
  };
  exports.signup = (req, res) => {
      res.render("sign_page");
    };
exports.admin = (req, res) => {
    res.render("admin");
  };
exports.alreadylogin = (req, res) => {
    res.render("login");
  };
  
