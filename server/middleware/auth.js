let admin= require("../config/firebase.js");
const authMiddleware = async (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({error: 'Unauthorized'});
  }

  const token= authHeader.split(' ')[1];

  try {
    const decodedToken=await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({error: 'Unauthorized'});
  }
}

module.exports = authMiddleware;