/**
 * Logger used throughout the application to allow configuration of
 * the log level required for the messages.
 */
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger._CheckLimit = function (message, limit) {
        var entry = Logger._LogLimitOutputs[message];
        if (!entry) {
            entry = { limit: limit, current: 1 };
            Logger._LogLimitOutputs[message] = entry;
        }
        else {
            entry.current++;
        }
        return entry.current <= entry.limit;
    };
    Logger._GenerateLimitMessage = function (message, messageType) {
        var entry = Logger._LogLimitOutputs[message];
        if (!entry || !Logger.MessageLimitReached) {
            return;
        }
        if (entry.current === entry.limit) {
            switch (messageType) {
                case 0:
                    Logger.Log(Logger.MessageLimitReached.replace(/%LIMIT%/g, "" + entry.limit).replace(/%TYPE%/g, "log"));
                    break;
                case 1:
                    Logger.Warn(Logger.MessageLimitReached.replace(/%LIMIT%/g, "" + entry.limit).replace(/%TYPE%/g, "warning"));
                    break;
                case 2:
                    Logger.Error(Logger.MessageLimitReached.replace(/%LIMIT%/g, "" + entry.limit).replace(/%TYPE%/g, "error"));
                    break;
            }
        }
    };
    Logger._AddLogEntry = function (entry) {
        Logger._LogCache = entry + Logger._LogCache;
        if (Logger.OnNewCacheEntry) {
            Logger.OnNewCacheEntry(entry);
        }
    };
    Logger._FormatMessage = function (message) {
        var padStr = function (i) { return (i < 10 ? "0" + i : "" + i); };
        var date = new Date();
        return "[" + padStr(date.getHours()) + ":" + padStr(date.getMinutes()) + ":" + padStr(date.getSeconds()) + "]: " + message;
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Logger._LogDisabled = function (message, limit) {
        // nothing to do
    };
    Logger._LogEnabled = function (message, limit) {
        if (limit !== undefined && !Logger._CheckLimit(message, limit)) {
            return;
        }
        var formattedMessage = Logger._FormatMessage(message);
        console.log("BJS - " + formattedMessage);
        var entry = "<div style='color:white'>" + formattedMessage + "</div><br>";
        Logger._AddLogEntry(entry);
        Logger._GenerateLimitMessage(message, 0);
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Logger._WarnDisabled = function (message, limit) {
        // nothing to do
    };
    Logger._WarnEnabled = function (message, limit) {
        if (limit !== undefined && !Logger._CheckLimit(message, limit)) {
            return;
        }
        var formattedMessage = Logger._FormatMessage(message);
        console.warn("BJS - " + formattedMessage);
        var entry = "<div style='color:orange'>" + message + "</div><br>";
        Logger._AddLogEntry(entry);
        Logger._GenerateLimitMessage(message, 1);
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Logger._ErrorDisabled = function (message, limit) {
        // nothing to do
    };
    Logger._ErrorEnabled = function (message, limit) {
        if (limit !== undefined && !Logger._CheckLimit(message, limit)) {
            return;
        }
        var formattedMessage = Logger._FormatMessage(message);
        Logger.errorsCount++;
        console.error("BJS - " + formattedMessage);
        var entry = "<div style='color:red'>" + formattedMessage + "</div><br>";
        Logger._AddLogEntry(entry);
        Logger._GenerateLimitMessage(message, 2);
    };
    Object.defineProperty(Logger, "LogCache", {
        /**
         * Gets current log cache (list of logs)
         */
        get: function () {
            return Logger._LogCache;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clears the log cache
     */
    Logger.ClearLogCache = function () {
        Logger._LogCache = "";
        Logger._LogLimitOutputs = {};
        Logger.errorsCount = 0;
    };
    Object.defineProperty(Logger, "LogLevels", {
        /**
         * Sets the current log level (MessageLogLevel / WarningLogLevel / ErrorLogLevel)
         */
        set: function (level) {
            if ((level & Logger.MessageLogLevel) === Logger.MessageLogLevel) {
                Logger.Log = Logger._LogEnabled;
            }
            else {
                Logger.Log = Logger._LogDisabled;
            }
            if ((level & Logger.WarningLogLevel) === Logger.WarningLogLevel) {
                Logger.Warn = Logger._WarnEnabled;
            }
            else {
                Logger.Warn = Logger._WarnDisabled;
            }
            if ((level & Logger.ErrorLogLevel) === Logger.ErrorLogLevel) {
                Logger.Error = Logger._ErrorEnabled;
            }
            else {
                Logger.Error = Logger._ErrorDisabled;
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * No log
     */
    Logger.NoneLogLevel = 0;
    /**
     * Only message logs
     */
    Logger.MessageLogLevel = 1;
    /**
     * Only warning logs
     */
    Logger.WarningLogLevel = 2;
    /**
     * Only error logs
     */
    Logger.ErrorLogLevel = 4;
    /**
     * All logs
     */
    Logger.AllLogLevel = 7;
    /**
     * Message to display when a message has been logged too many times
     */
    Logger.MessageLimitReached = "Too many %TYPE%s (%LIMIT%), no more %TYPE%s will be reported for this message.";
    Logger._LogCache = "";
    Logger._LogLimitOutputs = {};
    /**
     * Gets a value indicating the number of loading errors
     * @ignorenaming
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Logger.errorsCount = 0;
    /**
     * Log a message to the console
     */
    Logger.Log = Logger._LogEnabled;
    /**
     * Write a warning message to the console
     */
    Logger.Warn = Logger._WarnEnabled;
    /**
     * Write an error message to the console
     */
    Logger.Error = Logger._ErrorEnabled;
    return Logger;
}());
export { Logger };
//# sourceMappingURL=logger.js.map