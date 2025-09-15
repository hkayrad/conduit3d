export class Logger {
    static isDebug: boolean = import.meta.env.VITE_ENVIRONMENT !== 'production';

    static log(message?: any, ...optionalParams: any[]) {
        if (Logger.isDebug)
            console.log(message, ...optionalParams);
    }

    static error(message?: any, ...optionalParams: any[]) {
        if (Logger.isDebug)
            console.error(message, ...optionalParams);
    }

    static warn(message?: any, ...optionalParams: any[]) {
        if (Logger.isDebug)
            console.warn(message, ...optionalParams);
    }
}