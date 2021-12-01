const process = require('process');
const jwt = require('jsonwebtoken');

module.exports.identification = async (req, res, next) => {
    const headerAuth = req.get('authorization');
    if (headerAuth !== undefined && headerAuth.includes("Bearer")){
        const jwtToken = headerAuth.split(' ')[1];
        try{
            const decodedJwtToken = jwt.verify(jwtToken, "qwertyuiopasdfghjklzxcvbnm123456");
            req.session = decodedJwtToken.value;
            req.session.authLevel = decodedJwtToken.status;
            next();
        } catch (e) {
            console.error(e);
            res.sendStatus(e instanceof jwt.TokenExpiredError ? 401 : (e instanceof jwt.JsonWebTokenError ? 400 : 500));
        }
    } else {
        res.sendStatus(401);
    }
}