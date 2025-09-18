export class Logger {
    static isDebug: boolean = import.meta.env.VITE_ENVIRONMENT !== 'production';

    static debug(message?: any, ...optionalParams: any[]) {
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

    static table(tabularData?: any, properties?: string[]) {
        if (Logger.isDebug)
            console.table(tabularData, properties);
    }
}