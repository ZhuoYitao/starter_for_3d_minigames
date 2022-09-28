/**
 * Class for storing data to local storage if available or in-memory storage otherwise
 */
var DataStorage = /** @class */ (function () {
    function DataStorage() {
    }
    DataStorage._GetStorage = function () {
        try {
            localStorage.setItem("test", "");
            localStorage.removeItem("test");
            return localStorage;
        }
        catch (_a) {
            var inMemoryStorage_1 = {};
            return {
                getItem: function (key) {
                    var value = inMemoryStorage_1[key];
                    return value === undefined ? null : value;
                },
                setItem: function (key, value) {
                    inMemoryStorage_1[key] = value;
                },
            };
        }
    };
    /**
     * Reads a string from the data storage
     * @param key The key to read
     * @param defaultValue The value if the key doesn't exist
     * @returns The string value
     */
    DataStorage.ReadString = function (key, defaultValue) {
        var value = this._Storage.getItem(key);
        return value !== null ? value : defaultValue;
    };
    /**
     * Writes a string to the data storage
     * @param key The key to write
     * @param value The value to write
     */
    DataStorage.WriteString = function (key, value) {
        this._Storage.setItem(key, value);
    };
    /**
     * Reads a boolean from the data storage
     * @param key The key to read
     * @param defaultValue The value if the key doesn't exist
     * @returns The boolean value
     */
    DataStorage.ReadBoolean = function (key, defaultValue) {
        var value = this._Storage.getItem(key);
        return value !== null ? value === "true" : defaultValue;
    };
    /**
     * Writes a boolean to the data storage
     * @param key The key to write
     * @param value The value to write
     */
    DataStorage.WriteBoolean = function (key, value) {
        this._Storage.setItem(key, value ? "true" : "false");
    };
    /**
     * Reads a number from the data storage
     * @param key The key to read
     * @param defaultValue The value if the key doesn't exist
     * @returns The number value
     */
    DataStorage.ReadNumber = function (key, defaultValue) {
        var value = this._Storage.getItem(key);
        return value !== null ? parseFloat(value) : defaultValue;
    };
    /**
     * Writes a number to the data storage
     * @param key The key to write
     * @param value The value to write
     */
    DataStorage.WriteNumber = function (key, value) {
        this._Storage.setItem(key, value.toString());
    };
    DataStorage._Storage = DataStorage._GetStorage();
    return DataStorage;
}());
export { DataStorage };
//# sourceMappingURL=dataStorage.js.map