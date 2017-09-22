const parseCookies = (req, res, next) => {
  var cookieStr = req.get('Cookie') || '';

  parsedCookieObj = cookieStr.split('; ').reduce((obj, cookie) => {
    if (cookie.length) {
      let index = cookie.indexOf('=');
      let key = cookie.slice(0, index);
      let token = cookie.slice(index + 1);
      obj[key] = token;
    }
    return obj;
  }, {});

  req.cookies = parsedCookie;
  next();
};

module.exports = parseCookies;
