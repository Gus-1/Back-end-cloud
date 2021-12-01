module.exports.mustBeAdmin = (req, res, next) => {
    if (req.session !== undefined && req.session.authLevel === "admin"){
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports.mustBeUser = (req, res, next) =>{
    if (req.session !== undefined && (res.session.authLevel === "client" || res.session.authLevel === "admin")){
        next();
    } else {
        res.sendStatus(403);
    }
}