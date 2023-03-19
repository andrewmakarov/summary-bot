import * as Sentry from '@sentry/node';
// import * as Tracing from '@sentry/tracing';

export const initLog = () => {
    Sentry.init({
        dsn: process.env.LOG_TOKEN,
        tracesSampleRate: 1.0,
    });
};

export const log = (userId: string, text: string) => {
    Sentry.withScope((scope) => {
        scope.setLevel('error');
        scope.setUser({
            id: userId,
        });
        Sentry.captureMessage(text);
    });
};
