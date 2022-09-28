import { Observable } from "./observable.js";
import { runCoroutineAsync, inlineScheduler } from "./coroutine.js";
function CreateObservableScheduler(observable) {
    var coroutines = new Array();
    var onSteps = new Array();
    var onErrors = new Array();
    var observer = observable.add(function () {
        var count = coroutines.length;
        for (var i = 0; i < count; i++) {
            inlineScheduler(coroutines.shift(), onSteps.shift(), onErrors.shift());
        }
    });
    var scheduler = function (coroutine, onStep, onError) {
        coroutines.push(coroutine);
        onSteps.push(onStep);
        onErrors.push(onError);
    };
    return {
        scheduler: scheduler,
        dispose: function () {
            observable.remove(observer);
        },
    };
}
Observable.prototype.runCoroutineAsync = function (coroutine) {
    if (!this._coroutineScheduler) {
        var schedulerAndDispose = CreateObservableScheduler(this);
        this._coroutineScheduler = schedulerAndDispose.scheduler;
        this._coroutineSchedulerDispose = schedulerAndDispose.dispose;
    }
    return runCoroutineAsync(coroutine, this._coroutineScheduler);
};
Observable.prototype.cancelAllCoroutines = function () {
    if (this._coroutineSchedulerDispose) {
        this._coroutineSchedulerDispose();
    }
    this._coroutineScheduler = undefined;
    this._coroutineSchedulerDispose = undefined;
};
//# sourceMappingURL=observableCoroutine.js.map