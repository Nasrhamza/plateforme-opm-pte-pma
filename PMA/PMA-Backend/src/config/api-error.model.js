class ApiError extends Error {
    constructor(message, status, err) {
        super(message);
        this.status = status;
        this.err = err
    }
}

module.exports = ApiError;