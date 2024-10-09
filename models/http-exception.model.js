class HttpException extends Error {
    errorCode;

    constructor(errorCode, message) {
        super(message);
        this.errorCode = errorCode;
    }
}

export default HttpException;