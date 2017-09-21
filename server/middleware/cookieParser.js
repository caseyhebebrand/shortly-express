const parseCookies = (req, res, next) => {
  req.cookies = {};
  if (req.headers.cookie) {
    var array = req.headers.cookie.split('; ');
    array.forEach(function(cookieStr) {
      var tuple = cookieStr.split('=');
      req.cookies[tuple[0]] = tuple[1];
    });
    console.log(req.cookies);
    next();
  } else {
    next();
  }
  
  
}; 

module.exports = parseCookies;