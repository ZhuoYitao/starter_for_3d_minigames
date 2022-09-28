import { __extends } from "tslib";
/**
 * Helper class to push actions to a pool of workers.
 */
var WorkerPool = /** @class */ (function () {
    /**
     * Constructor
     * @param workers Array of workers to use for actions
     */
    function WorkerPool(workers) {
        this._pendingActions = new Array();
        this._workerInfos = workers.map(function (worker) { return ({
            workerPromise: Promise.resolve(worker),
            idle: true,
        }); });
    }
    /**
     * Terminates all workers and clears any pending actions.
     */
    WorkerPool.prototype.dispose = function () {
        for (var _i = 0, _a = this._workerInfos; _i < _a.length; _i++) {
            var workerInfo = _a[_i];
            workerInfo.workerPromise.then(function (worker) {
                worker.terminate();
            });
        }
        this._workerInfos.length = 0;
        this._pendingActions.length = 0;
    };
    /**
     * Pushes an action to the worker pool. If all the workers are active, the action will be
     * pended until a worker has completed its action.
     * @param action The action to perform. Call onComplete when the action is complete.
     */
    WorkerPool.prototype.push = function (action) {
        if (!this._executeOnIdleWorker(action)) {
            this._pendingActions.push(action);
        }
    };
    WorkerPool.prototype._executeOnIdleWorker = function (action) {
        for (var _i = 0, _a = this._workerInfos; _i < _a.length; _i++) {
            var workerInfo = _a[_i];
            if (workerInfo.idle) {
                this._execute(workerInfo, action);
                return true;
            }
        }
        return false;
    };
    WorkerPool.prototype._execute = function (workerInfo, action) {
        var _this = this;
        workerInfo.idle = false;
        workerInfo.workerPromise.then(function (worker) {
            action(worker, function () {
                var nextAction = _this._pendingActions.shift();
                if (nextAction) {
                    _this._execute(workerInfo, nextAction);
                }
                else {
                    workerInfo.idle = true;
                }
            });
        });
    };
    return WorkerPool;
}());
export { WorkerPool };
/**
 * Similar to the WorkerPool class except it creates and destroys workers automatically with a maximum of `maxWorkers` workers.
 * Workers are terminated when it is idle for at least `idleTimeElapsedBeforeRelease` milliseconds.
 */
var AutoReleaseWorkerPool = /** @class */ (function (_super) {
    __extends(AutoReleaseWorkerPool, _super);
    function AutoReleaseWorkerPool(maxWorkers, createWorkerAsync, options) {
        if (options === void 0) { options = AutoReleaseWorkerPool.DefaultOptions; }
        var _this = _super.call(this, []) || this;
        _this._maxWorkers = maxWorkers;
        _this._createWorkerAsync = createWorkerAsync;
        _this._options = options;
        return _this;
    }
    AutoReleaseWorkerPool.prototype.push = function (action) {
        if (!this._executeOnIdleWorker(action)) {
            if (this._workerInfos.length < this._maxWorkers) {
                var workerInfo = {
                    workerPromise: this._createWorkerAsync(),
                    idle: false,
                };
                this._workerInfos.push(workerInfo);
                this._execute(workerInfo, action);
            }
            else {
                this._pendingActions.push(action);
            }
        }
    };
    AutoReleaseWorkerPool.prototype._execute = function (workerInfo, action) {
        var _this = this;
        // Reset the idle timeout.
        if (workerInfo.timeoutId) {
            clearTimeout(workerInfo.timeoutId);
            delete workerInfo.timeoutId;
        }
        _super.prototype._execute.call(this, workerInfo, function (worker, onComplete) {
            action(worker, function () {
                onComplete();
                if (workerInfo.idle) {
                    // Schedule the worker to be terminated after the elapsed time.
                    workerInfo.timeoutId = setTimeout(function () {
                        workerInfo.workerPromise.then(function (worker) {
                            worker.terminate();
                        });
                        var indexOf = _this._workerInfos.indexOf(workerInfo);
                        if (indexOf !== -1) {
                            _this._workerInfos.splice(indexOf, 1);
                        }
                    }, _this._options.idleTimeElapsedBeforeRelease);
                }
            });
        });
    };
    /**
     * Default options for the constructor.
     * Override to change the defaults.
     */
    AutoReleaseWorkerPool.DefaultOptions = {
        idleTimeElapsedBeforeRelease: 1000,
    };
    return AutoReleaseWorkerPool;
}(WorkerPool));
export { AutoReleaseWorkerPool };
//# sourceMappingURL=workerPool.js.map