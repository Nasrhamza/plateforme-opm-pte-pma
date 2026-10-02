module.exports = (err, req, res, next)=>{
    const code = err.status || 500;
    return res.status(code).send({ message : err.message, err : err.err || false });
}