const jsonwebtoken = require('jsonwebtoken');

exports.authorizationMiddleware = (req, res, next) => {
  //gets bearer header from request
  const bearerHeader = req.headers['authorization'];
  //if there is a token
  if (typeof bearerHeader !== 'undefined') {
    //gets only the token from the request header
    const bearerHeaderArray = bearerHeader.split(' ');
    const bearerToken = bearerHeaderArray[1];
    //checks if the bearer token corresponds to the server token
    jsonwebtoken.verify(bearerToken, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        // if the tokens don't match
        res.json({
          error: 'error 401: Unauthorized token',
        });
      } else {
        // if the tokens match
        req.bearerToken = bearerToken;
        req.tokenData = data;
        //next middleware
        next();
      }
    });
  } else {
    // if no token was given
    res.json({
      error: 'error 401: Unauthorized token',
    });
  }
};

exports.adminChecker = (req, res, next) => {
  const { role } = req.tokenData;
  if (role === 3) {
    next();
  } else {
    res.json({
      error: 'error 401: Only admins can access this route',
    });
  }
};