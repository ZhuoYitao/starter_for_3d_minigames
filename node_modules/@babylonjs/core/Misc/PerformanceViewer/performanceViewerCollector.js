import { EventState, Observable } from "../observable.js";
import { PrecisionDate } from "../precisionDate.js";
import { Tools } from "../tools.js";
import { DynamicFloat32Array } from "./dynamicFloat32Array.js";
// the initial size of our array, should be a multiple of two!
var InitialArraySize = 1800;
// three octets in a hexcode. #[AA][BB][CC], i.e. 24 bits of data.
var NumberOfBitsInHexcode = 24;
// Allows single numeral hex numbers to be appended by a 0.
var HexPadding = "0";
// header for the timestamp column
var TimestampColHeader = "timestamp";
// header for the numPoints column
var NumPointsColHeader = "numPoints";
// regex to capture all carriage returns in the string.
var CarriageReturnRegex = /\r/g;
// string to use as separator when exporting extra information along with the dataset id
var ExportedDataSeparator = "@";
/**
 * The collector class handles the collection and storage of data into the appropriate array.
 * The collector also handles notifying any observers of any updates.
 */
var PerformanceViewerCollector = /** @class */ (function () {
    /**
     * Handles the creation of a performance viewer collector.
     * @param _scene the scene to collect on.
     * @param _enabledStrategyCallbacks the list of data to collect with callbacks for initialization purposes.
     */
    function PerformanceViewerCollector(_scene, _enabledStrategyCallbacks) {
        var _this = this;
        this._scene = _scene;
        /**
         * Collects data for every dataset by using the appropriate strategy. This is called every frame.
         * This method will then notify all observers with the latest slice.
         */
        this._collectDataAtFrame = function () {
            var timestamp = PrecisionDate.Now - _this._startingTimestamp;
            var numPoints = _this.datasets.ids.length;
            // add the starting index for the slice
            var numberOfIndices = _this.datasets.startingIndices.itemLength;
            var startingIndex = 0;
            if (numberOfIndices > 0) {
                var previousStartingIndex = _this.datasets.startingIndices.at(numberOfIndices - 1);
                startingIndex =
                    previousStartingIndex + _this.datasets.data.at(previousStartingIndex + PerformanceViewerCollector.NumberOfPointsOffset) + PerformanceViewerCollector.SliceDataOffset;
            }
            _this.datasets.startingIndices.push(startingIndex);
            // add the first 2 items in our slice.
            _this.datasets.data.push(timestamp);
            _this.datasets.data.push(numPoints);
            // add the values inside the slice.
            _this.datasets.ids.forEach(function (id) {
                var strategy = _this._strategies.get(id);
                if (!strategy) {
                    return;
                }
                _this.datasets.data.push(strategy.getData());
            });
            if (_this.datasetObservable.hasObservers()) {
                var slice = [timestamp, numPoints];
                for (var i = 0; i < numPoints; i++) {
                    slice.push(_this.datasets.data.at(startingIndex + PerformanceViewerCollector.SliceDataOffset + i));
                }
                _this.datasetObservable.notifyObservers(slice);
            }
        };
        this.datasets = {
            ids: [],
            data: new DynamicFloat32Array(InitialArraySize),
            startingIndices: new DynamicFloat32Array(InitialArraySize),
        };
        this._strategies = new Map();
        this._datasetMeta = new Map();
        this._eventRestoreSet = new Set();
        this._customEventObservable = new Observable();
        this.datasetObservable = new Observable();
        this.metadataObservable = new Observable(function (observer) { return observer.callback(_this._datasetMeta, new EventState(0)); });
        if (_enabledStrategyCallbacks) {
            this.addCollectionStrategies.apply(this, _enabledStrategyCallbacks);
        }
    }
    Object.defineProperty(PerformanceViewerCollector, "SliceDataOffset", {
        /**
         * The offset for when actual data values start appearing inside a slice.
         */
        get: function () {
            return 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PerformanceViewerCollector, "NumberOfPointsOffset", {
        /**
         * The offset for the value of the number of points inside a slice.
         */
        get: function () {
            return 1;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Registers a custom string event which will be callable via sendEvent. This method returns an event object which will contain the id of the event.
     * The user can set a value optionally, which will be used in the sendEvent method. If the value is set, we will record this value at the end of each frame,
     * if not we will increment our counter and record the value of the counter at the end of each frame. The value recorded is 0 if no sendEvent method is called, within a frame.
     * @param name The name of the event to register
     * @param forceUpdate if the code should force add an event, and replace the last one.
     * @param category the category for that event
     * @returns The event registered, used in sendEvent
     */
    PerformanceViewerCollector.prototype.registerEvent = function (name, forceUpdate, category) {
        var _this = this;
        var _a;
        if (this._strategies.has(name) && !forceUpdate) {
            return;
        }
        if (this._strategies.has(name) && forceUpdate) {
            (_a = this._strategies.get(name)) === null || _a === void 0 ? void 0 : _a.dispose();
            this._strategies.delete(name);
        }
        var strategy = function (scene) {
            var counter = 0;
            var value = 0;
            var afterRenderObserver = scene.onAfterRenderObservable.add(function () {
                value = counter;
                counter = 0;
            });
            var stringObserver = _this._customEventObservable.add(function (eventVal) {
                if (name !== eventVal.name) {
                    return;
                }
                if (eventVal.value !== undefined) {
                    counter = eventVal.value;
                }
                else {
                    counter++;
                }
            });
            return {
                id: name,
                getData: function () { return value; },
                dispose: function () {
                    scene.onAfterRenderObservable.remove(afterRenderObserver);
                    _this._customEventObservable.remove(stringObserver);
                },
            };
        };
        var event = {
            name: name,
        };
        this._eventRestoreSet.add(name);
        this.addCollectionStrategies({ strategyCallback: strategy, category: category });
        return event;
    };
    /**
     * Lets the perf collector handle an event, occurences or event value depending on if the event.value params is set.
     * @param event the event to handle an occurence for
     */
    PerformanceViewerCollector.prototype.sendEvent = function (event) {
        this._customEventObservable.notifyObservers(event);
    };
    /**
     * This event restores all custom string events if necessary.
     */
    PerformanceViewerCollector.prototype._restoreStringEvents = function () {
        var _this = this;
        if (this._eventRestoreSet.size !== this._customEventObservable.observers.length) {
            this._eventRestoreSet.forEach(function (event) {
                _this.registerEvent(event, true);
            });
        }
    };
    /**
     * This method adds additional collection strategies for data collection purposes.
     * @param strategyCallbacks the list of data to collect with callbacks.
     */
    PerformanceViewerCollector.prototype.addCollectionStrategies = function () {
        var strategyCallbacks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            strategyCallbacks[_i] = arguments[_i];
        }
        // eslint-disable-next-line prefer-const
        for (var _a = 0, strategyCallbacks_1 = strategyCallbacks; _a < strategyCallbacks_1.length; _a++) {
            var _b = strategyCallbacks_1[_a], strategyCallback = _b.strategyCallback, category = _b.category, hidden = _b.hidden;
            var strategy = strategyCallback(this._scene);
            if (this._strategies.has(strategy.id)) {
                strategy.dispose();
                continue;
            }
            this.datasets.ids.push(strategy.id);
            if (category) {
                category = category.replace(new RegExp(ExportedDataSeparator, "g"), "");
            }
            this._datasetMeta.set(strategy.id, {
                color: this._getHexColorFromId(strategy.id),
                category: category,
                hidden: hidden,
            });
            this._strategies.set(strategy.id, strategy);
        }
        this.metadataObservable.notifyObservers(this._datasetMeta);
    };
    /**
     * Gets a 6 character hexcode representing the colour from a passed in string.
     * @param id the string to get a hex code for.
     * @returns a hexcode hashed from the id.
     */
    PerformanceViewerCollector.prototype._getHexColorFromId = function (id) {
        // this first bit is just a known way of hashing a string.
        var hash = 0;
        for (var i = 0; i < id.length; i++) {
            // (hash << 5) - hash is the same as hash * 31
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        // then we build the string octet by octet.
        var hex = "#";
        for (var i = 0; i < NumberOfBitsInHexcode; i += 8) {
            var octet = (hash >> i) & 0xff;
            hex += (HexPadding + octet.toString(16)).substr(-2);
        }
        return hex;
    };
    /**
     * Collects and then sends the latest slice to any observers by using the appropriate strategy when the user wants.
     * The slice will be of the form [timestamp, numberOfPoints, value1, value2...]
     * This method does not add onto the collected data accessible via the datasets variable.
     */
    PerformanceViewerCollector.prototype.getCurrentSlice = function () {
        var _this = this;
        var timestamp = PrecisionDate.Now - this._startingTimestamp;
        var numPoints = this.datasets.ids.length;
        var slice = [timestamp, numPoints];
        // add the values inside the slice.
        this.datasets.ids.forEach(function (id) {
            var strategy = _this._strategies.get(id);
            if (!strategy) {
                return;
            }
            if (_this.datasetObservable.hasObservers()) {
                slice.push(strategy.getData());
            }
        });
        if (this.datasetObservable.hasObservers()) {
            this.datasetObservable.notifyObservers(slice);
        }
    };
    /**
     * Updates a property for a dataset's metadata with the value provided.
     * @param id the id of the dataset which needs its metadata updated.
     * @param prop the property to update.
     * @param value the value to update the property with.
     */
    PerformanceViewerCollector.prototype.updateMetadata = function (id, prop, value) {
        var meta = this._datasetMeta.get(id);
        if (!meta) {
            return;
        }
        meta[prop] = value;
        this.metadataObservable.notifyObservers(this._datasetMeta);
    };
    /**
     * Completely clear, data, ids, and strategies saved to this performance collector.
     * @param preserveStringEventsRestore if it should preserve the string events, by default will clear string events registered when called.
     */
    PerformanceViewerCollector.prototype.clear = function (preserveStringEventsRestore) {
        this.datasets.data = new DynamicFloat32Array(InitialArraySize);
        this.datasets.ids.length = 0;
        this.datasets.startingIndices = new DynamicFloat32Array(InitialArraySize);
        this._datasetMeta.clear();
        this._strategies.forEach(function (strategy) { return strategy.dispose(); });
        this._strategies.clear();
        if (!preserveStringEventsRestore) {
            this._eventRestoreSet.clear();
        }
        this._hasLoadedData = false;
    };
    Object.defineProperty(PerformanceViewerCollector.prototype, "hasLoadedData", {
        /**
         * Accessor which lets the caller know if the performance collector has data loaded from a file or not!
         * Call clear() to reset this value.
         * @returns true if the data is loaded from a file, false otherwise.
         */
        get: function () {
            return this._hasLoadedData;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Given a string containing file data, this function parses the file data into the datasets object.
     * It returns a boolean to indicate if this object was successfully loaded with the data.
     * @param data string content representing the file data.
     * @param keepDatasetMeta if it should use reuse the existing dataset metadata
     * @returns true if the data was successfully loaded, false otherwise.
     */
    PerformanceViewerCollector.prototype.loadFromFileData = function (data, keepDatasetMeta) {
        var lines = data
            .replace(CarriageReturnRegex, "")
            .split("\n")
            .map(function (line) { return line.split(",").filter(function (s) { return s.length > 0; }); })
            .filter(function (line) { return line.length > 0; });
        var timestampIndex = 0;
        var numPointsIndex = PerformanceViewerCollector.NumberOfPointsOffset;
        if (lines.length < 2) {
            return false;
        }
        var parsedDatasets = {
            ids: [],
            data: new DynamicFloat32Array(InitialArraySize),
            startingIndices: new DynamicFloat32Array(InitialArraySize),
        };
        // parse first line separately to populate ids!
        var firstLine = lines[0], dataLines = lines.slice(1);
        // make sure we have the correct beginning headers
        if (firstLine.length < 2 || firstLine[timestampIndex] !== TimestampColHeader || firstLine[numPointsIndex] !== NumPointsColHeader) {
            return false;
        }
        var idCategoryMap = new Map();
        // populate the ids.
        for (var i = PerformanceViewerCollector.SliceDataOffset; i < firstLine.length; i++) {
            var _a = firstLine[i].split(ExportedDataSeparator), id = _a[0], category = _a[1];
            parsedDatasets.ids.push(id);
            idCategoryMap.set(id, category);
        }
        var startingIndex = 0;
        for (var _i = 0, dataLines_1 = dataLines; _i < dataLines_1.length; _i++) {
            var line = dataLines_1[_i];
            if (line.length < 2) {
                return false;
            }
            var timestamp = parseFloat(line[timestampIndex]);
            var numPoints = parseInt(line[numPointsIndex]);
            if (isNaN(numPoints) || isNaN(timestamp)) {
                return false;
            }
            parsedDatasets.data.push(timestamp);
            parsedDatasets.data.push(numPoints);
            if (numPoints + PerformanceViewerCollector.SliceDataOffset !== line.length) {
                return false;
            }
            for (var i = PerformanceViewerCollector.SliceDataOffset; i < line.length; i++) {
                var val = parseFloat(line[i]);
                if (isNaN(val)) {
                    return false;
                }
                parsedDatasets.data.push(val);
            }
            parsedDatasets.startingIndices.push(startingIndex);
            startingIndex += line.length;
        }
        this.datasets.ids = parsedDatasets.ids;
        this.datasets.data = parsedDatasets.data;
        this.datasets.startingIndices = parsedDatasets.startingIndices;
        if (!keepDatasetMeta) {
            this._datasetMeta.clear();
        }
        this._strategies.forEach(function (strategy) { return strategy.dispose(); });
        this._strategies.clear();
        // populate metadata.
        if (!keepDatasetMeta) {
            for (var _b = 0, _c = this.datasets.ids; _b < _c.length; _b++) {
                var id = _c[_b];
                var category = idCategoryMap.get(id);
                this._datasetMeta.set(id, { category: category, color: this._getHexColorFromId(id) });
            }
        }
        this.metadataObservable.notifyObservers(this._datasetMeta);
        this._hasLoadedData = true;
        return true;
    };
    /**
     * Exports the datasets inside of the collector to a csv.
     */
    PerformanceViewerCollector.prototype.exportDataToCsv = function () {
        var csvContent = "";
        // create the header line.
        csvContent += "".concat(TimestampColHeader, ",").concat(NumPointsColHeader);
        for (var i = 0; i < this.datasets.ids.length; i++) {
            csvContent += ",".concat(this.datasets.ids[i]);
            if (this._datasetMeta) {
                var meta = this._datasetMeta.get(this.datasets.ids[i]);
                if (meta === null || meta === void 0 ? void 0 : meta.category) {
                    csvContent += "".concat(ExportedDataSeparator).concat(meta.category);
                }
            }
        }
        csvContent += "\n";
        // create the data lines
        for (var i = 0; i < this.datasets.startingIndices.itemLength; i++) {
            var startingIndex = this.datasets.startingIndices.at(i);
            var timestamp = this.datasets.data.at(startingIndex);
            var numPoints = this.datasets.data.at(startingIndex + PerformanceViewerCollector.NumberOfPointsOffset);
            csvContent += "".concat(timestamp, ",").concat(numPoints);
            for (var offset = 0; offset < numPoints; offset++) {
                csvContent += ",".concat(this.datasets.data.at(startingIndex + PerformanceViewerCollector.SliceDataOffset + offset));
            }
            // add extra commas.
            for (var diff = 0; diff < this.datasets.ids.length - numPoints; diff++) {
                csvContent += ",";
            }
            csvContent += "\n";
        }
        var fileName = "".concat(new Date().toISOString(), "-perfdata.csv");
        Tools.Download(new Blob([csvContent], { type: "text/csv" }), fileName);
    };
    /**
     * Starts the realtime collection of data.
     * @param shouldPreserve optional boolean param, if set will preserve the dataset between calls of start.
     */
    PerformanceViewerCollector.prototype.start = function (shouldPreserve) {
        if (!shouldPreserve) {
            this.datasets.data = new DynamicFloat32Array(InitialArraySize);
            this.datasets.startingIndices = new DynamicFloat32Array(InitialArraySize);
            this._startingTimestamp = PrecisionDate.Now;
        }
        else if (this._startingTimestamp === undefined) {
            this._startingTimestamp = PrecisionDate.Now;
        }
        this._scene.onAfterRenderObservable.add(this._collectDataAtFrame);
        this._restoreStringEvents();
        this._isStarted = true;
    };
    /**
     * Stops the collection of data.
     */
    PerformanceViewerCollector.prototype.stop = function () {
        this._scene.onAfterRenderObservable.removeCallback(this._collectDataAtFrame);
        this._isStarted = false;
    };
    Object.defineProperty(PerformanceViewerCollector.prototype, "isStarted", {
        /**
         * Returns if the perf collector has been started or not.
         */
        get: function () {
            return this._isStarted;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Disposes of the object
     */
    PerformanceViewerCollector.prototype.dispose = function () {
        this._scene.onAfterRenderObservable.removeCallback(this._collectDataAtFrame);
        this._datasetMeta.clear();
        this._strategies.forEach(function (strategy) {
            strategy.dispose();
        });
        this.datasetObservable.clear();
        this.metadataObservable.clear();
        this._isStarted = false;
        this.datasets = null;
    };
    return PerformanceViewerCollector;
}());
export { PerformanceViewerCollector };
//# sourceMappingURL=performanceViewerCollector.js.map