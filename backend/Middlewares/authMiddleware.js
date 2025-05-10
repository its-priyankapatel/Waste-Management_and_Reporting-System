const JWT = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized,no token provided",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    // Verify token
    const decoded = JWT.verify(token, process.env.SECRET_KEY);

    // Attach user info to request
    req.user = {
      _id: decoded.userId,
      role: decoded.role,
    };

    next(); // move to the next middleware or controller
  } catch (error) {
    console.log(error);

    return res.status(401).send({
      success: false,
      message: "Unauthorized, invalid token",
    });
  }
};

const roleAuthorization = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).send({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleAuthorization };
