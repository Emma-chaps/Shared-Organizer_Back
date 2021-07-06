const jsonwebtoken = require('jsonwebtoken');

exports.authorizationMiddleware = (req, res, next) => {
  // gets bearer header from request
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
        res.status(401).json({
          error: 'Unauthorized token',
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
    res.status(401).json({
      error: 'Unauthorized token',
    });
  }
};

exports.adminChecker = (req, res, next) => {
  const { role } = req.tokenData;
  if (role === 3) {
    next();
  } else {
    res.status(403).json({
      error: 'Only admins can access this route',
    });
  }
};

exports.renewToken = (req, res, next) => {
  const { role, idMember, groupId, firstname } = req.tokenData;
  //creates JWT payload
  const jwtContent = {
    idMember,
    role,
    groupId,
    firstname,
  };
  //creates JWT encryption options
  const jwtOptions = {
    algorithm: 'HS256',
    expiresIn: '24h',
  };
  //sends back all info + token signature
  res.json({
    token: jsonwebtoken.sign(jwtContent, process.env.JWT_SECRET, jwtOptions),
  });
};
