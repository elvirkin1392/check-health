class HttpException extends Error {
    errorCode: number;

    constructor(errorCode: number, message: string) {
        super(message);
        this.errorCode = errorCode;
    }
}

export default HttpException;
