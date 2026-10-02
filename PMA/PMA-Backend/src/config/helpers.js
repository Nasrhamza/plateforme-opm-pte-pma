const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function validateEmail(email){
    return email.match(emailRegex);
}

module.exports = {
    validateEmail
}