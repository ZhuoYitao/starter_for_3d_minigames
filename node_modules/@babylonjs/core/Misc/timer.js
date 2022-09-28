import { Observable } from "../Misc/observable.js";
/**
 * The current state of the timer
 */
export var TimerState;
(function (TimerState) {
    /**
     * Timer initialized, not yet started
     */
    TimerState[TimerState["INIT"] = 0] = "INIT";
    /**
     * Timer started and counting
     */
    TimerState[TimerState["STARTED"] = 1] = "STARTED";
    /**
     * Timer ended (whether aborted or time reached)
     */
    TimerState[TimerState["ENDED"] = 2] = "ENDED";
})(TimerState || (TimerState = {}));
/**
 * A simple version of the timer. Will take options and start the timer immediately after calling it
 *
 * @param options options with which to initialize this timer
 */
export function setAndStartTimer(options) {
    var _a;
    var timer = 0;
    var startTime = Date.now();
    options.observableParameters = (_a = options.observableParameters) !== null && _a !== void 0 ? _a : {};
    var observer = options.contextObservable.add(function (payload) {
        var now = Date.now();
        timer = now - startTime;
        var data = {
            startTime: startTime,
            currentTime: now,
            deltaTime: timer,
            completeRate: timer / options.timeout,
            payload: payload,
        };
        options.onTick && options.onTick(data);
        if (options.breakCondition && options.breakCondition()) {
            options.contextObservable.remove(observer);
            options.onAborted && options.onAborted(data);
        }
        if (timer >= options.timeout) {
            options.contextObservable.remove(observer);
            options.onEnded && options.onEnded(data);
        }
    }, options.observableParameters.mask, options.observableParameters.insertFirst, options.observableParameters.scope);
    return observer;
}
/**
 * An advanced implementation of a timer class
 */
var AdvancedTimer = /** @class */ (function () {
    /**
     * Will construct a new advanced timer based on the options provided. Timer will not start until start() is called.
     * @param options construction options for this advanced timer
     */
    function AdvancedTimer(options) {
        var _this = this;
        var _a, _b;
        /**
         * Will notify each time the timer calculates the remaining time
         */
        this.onEachCountObservable = new Observable();
        /**
         * Will trigger when the timer was aborted due to the break condition
         */
        this.onTimerAbortedObservable = new Observable();
        /**
         * Will trigger when the timer ended successfully
         */
        this.onTimerEndedObservable = new Observable();
        /**
         * Will trigger when the timer state has changed
         */
        this.onStateChangedObservable = new Observable();
        this._observer = null;
        this._breakOnNextTick = false;
        this._tick = function (payload) {
            var now = Date.now();
            _this._timer = now - _this._startTime;
            var data = {
                startTime: _this._startTime,
                currentTime: now,
                deltaTime: _this._timer,
                completeRate: _this._timer / _this._timeToEnd,
                payload: payload,
            };
            var shouldBreak = _this._breakOnNextTick || _this._breakCondition(data);
            if (shouldBreak || _this._timer >= _this._timeToEnd) {
                _this._stop(data, shouldBreak);
            }
            else {
                _this.onEachCountObservable.notifyObservers(data);
            }
        };
        this._setState(TimerState.INIT);
        this._contextObservable = options.contextObservable;
        this._observableParameters = (_a = options.observableParameters) !== null && _a !== void 0 ? _a : {};
        this._breakCondition = (_b = options.breakCondition) !== null && _b !== void 0 ? _b : (function () { return false; });
        this._timeToEnd = options.timeout;
        if (options.onEnded) {
            this.onTimerEndedObservable.add(options.onEnded);
        }
        if (options.onTick) {
            this.onEachCountObservable.add(options.onTick);
        }
        if (options.onAborted) {
            this.onTimerAbortedObservable.add(options.onAborted);
        }
    }
    Object.defineProperty(AdvancedTimer.prototype, "breakCondition", {
        /**
         * set a breaking condition for this timer. Default is to never break during count
         * @param predicate the new break condition. Returns true to break, false otherwise
         */
        set: function (predicate) {
            this._breakCondition = predicate;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Reset ALL associated observables in this advanced timer
     */
    AdvancedTimer.prototype.clearObservables = function () {
        this.onEachCountObservable.clear();
        this.onTimerAbortedObservable.clear();
        this.onTimerEndedObservable.clear();
        this.onStateChangedObservable.clear();
    };
    /**
     * Will start a new iteration of this timer. Only one instance of this timer can run at a time.
     *
     * @param timeToEnd how much time to measure until timer ended
     */
    AdvancedTimer.prototype.start = function (timeToEnd) {
        if (timeToEnd === void 0) { timeToEnd = this._timeToEnd; }
        if (this._state === TimerState.STARTED) {
            throw new Error("Timer already started. Please stop it before starting again");
        }
        this._timeToEnd = timeToEnd;
        this._startTime = Date.now();
        this._timer = 0;
        this._observer = this._contextObservable.add(this._tick, this._observableParameters.mask, this._observableParameters.insertFirst, this._observableParameters.scope);
        this._setState(TimerState.STARTED);
    };
    /**
     * Will force a stop on the next tick.
     */
    AdvancedTimer.prototype.stop = function () {
        if (this._state !== TimerState.STARTED) {
            return;
        }
        this._breakOnNextTick = true;
    };
    /**
     * Dispose this timer, clearing all resources
     */
    AdvancedTimer.prototype.dispose = function () {
        if (this._observer) {
            this._contextObservable.remove(this._observer);
        }
        this.clearObservables();
    };
    AdvancedTimer.prototype._setState = function (newState) {
        this._state = newState;
        this.onStateChangedObservable.notifyObservers(this._state);
    };
    AdvancedTimer.prototype._stop = function (data, aborted) {
        if (aborted === void 0) { aborted = false; }
        this._contextObservable.remove(this._observer);
        this._setState(TimerState.ENDED);
        if (aborted) {
            this.onTimerAbortedObservable.notifyObservers(data);
        }
        else {
            this.onTimerEndedObservable.notifyObservers(data);
        }
    };
    return AdvancedTimer;
}());
export { AdvancedTimer };
//# sourceMappingURL=timer.js.map