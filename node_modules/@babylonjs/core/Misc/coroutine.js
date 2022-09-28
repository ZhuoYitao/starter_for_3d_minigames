/* eslint-disable @typescript-eslint/naming-convention */
// "Coroutines are computer program components that generalize subroutines for non-preemptive multitasking, by allowing execution to be suspended and resumed."
// https://en.wikipedia.org/wiki/Coroutine
// The inline scheduler simply steps the coroutine synchronously. This is useful for running a coroutine synchronously, and also as a helper function for other schedulers.
/**
 * @param coroutine
 * @param onStep
 * @param onError
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function inlineScheduler(coroutine, onStep, onError) {
    try {
        var step_1 = coroutine.next();
        if (step_1.done) {
            onStep(step_1);
        }
        else if (!step_1.value) {
            // NOTE: The properties of step have been narrowed, but the type of step itself is not narrowed, so the cast below is the most type safe way to deal with this without instantiating a new object to hold the values.
            onStep(step_1);
        }
        else {
            step_1.value.then(function () {
                step_1.value = undefined;
                onStep(step_1);
            }, onError);
        }
    }
    catch (error) {
        onError(error);
    }
}
// The yielding scheduler steps the coroutine synchronously until the specified time interval has elapsed, then yields control so other operations can be performed.
// A single instance of a yielding scheduler could be shared across multiple coroutines to yield when their collective work exceeds the threshold.
/**
 * @param yieldAfterMS
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function createYieldingScheduler(yieldAfterMS) {
    if (yieldAfterMS === void 0) { yieldAfterMS = 25; }
    var startTime;
    return function (coroutine, onStep, onError) {
        var currentTime = performance.now();
        if (startTime === undefined || currentTime - startTime > yieldAfterMS) {
            // If this is the first coroutine step, or if the time interval has elapsed, record a new start time, and schedule the coroutine step to happen later, effectively yielding control of the execution context.
            startTime = currentTime;
            setTimeout(function () {
                inlineScheduler(coroutine, onStep, onError);
            }, 0);
        }
        else {
            // Otherwise it is not time to yield yet, so step the coroutine synchronously.
            inlineScheduler(coroutine, onStep, onError);
        }
    };
}
// Runs the specified coroutine with the specified scheduler. The success or error callback will be invoked when the coroutine finishes.
/**
 * @param coroutine
 * @param scheduler
 * @param onSuccess
 * @param onError
 * @param abortSignal
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function runCoroutine(coroutine, scheduler, onSuccess, onError, abortSignal) {
    var resume = function () {
        var reschedule;
        var onStep = function (stepResult) {
            if (stepResult.done) {
                // If the coroutine is done, report success.
                onSuccess(stepResult.value);
            }
            else {
                // If the coroutine is not done, resume the coroutine (via the scheduler).
                if (reschedule === undefined) {
                    // If reschedule is undefined at this point, then the coroutine must have stepped synchronously, so just flag another loop iteration.
                    reschedule = true;
                }
                else {
                    // If reschedule is defined at this point, then the coroutine must have stepped asynchronously, so call resume to restart the step loop.
                    resume();
                }
            }
        };
        do {
            reschedule = undefined;
            if (!abortSignal || !abortSignal.aborted) {
                scheduler(coroutine, onStep, onError);
            }
            else {
                onError(new Error("Aborted"));
            }
            if (reschedule === undefined) {
                // If reschedule is undefined at this point, then the coroutine must have stepped asynchronously, so stop looping and let the coroutine be resumed later.
                reschedule = false;
            }
        } while (reschedule);
    };
    resume();
}
// Runs the specified coroutine synchronously.
/**
 * @param coroutine
 * @param abortSignal
 * @hidden
 */
export function runCoroutineSync(coroutine, abortSignal) {
    // Run the coroutine with the inline scheduler, storing the returned value, or re-throwing the error (since the error callback will be called synchronously by the inline scheduler).
    var result;
    runCoroutine(coroutine, inlineScheduler, function (r) { return (result = r); }, function (e) {
        throw e;
    }, abortSignal);
    // Synchronously return the result of the coroutine.
    return result;
}
// Runs the specified coroutine asynchronously with the specified scheduler.
/**
 * @param coroutine
 * @param scheduler
 * @param abortSignal
 * @hidden
 */
export function runCoroutineAsync(coroutine, scheduler, abortSignal) {
    // Run the coroutine with a yielding scheduler, resolving or rejecting the result promise when the coroutine finishes.
    return new Promise(function (resolve, reject) {
        runCoroutine(coroutine, scheduler, resolve, reject, abortSignal);
    });
}
/**
 * Given a function that returns a Coroutine<T>, produce a function with the same parameters that returns a T.
 * The returned function runs the coroutine synchronously.
 * @param coroutineFactory A function that returns a Coroutine<T>.
 * @param abortSignal
 * @returns A function that runs the coroutine synchronously.
 * @hidden
 */
export function makeSyncFunction(coroutineFactory, abortSignal) {
    return function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        // Run the coroutine synchronously.
        return runCoroutineSync(coroutineFactory.apply(void 0, params), abortSignal);
    };
}
/**
 * Given a function that returns a Coroutine<T>, product a function with the same parameters that returns a Promise<T>.
 * The returned function runs the coroutine asynchronously, yield control of the execution context occasionally to enable a more responsive experience.
 * @param coroutineFactory A function that returns a Coroutine<T>.
 * @param scheduler
 * @param abortSignal
 * @returns A function that runs the coroutine asynchronously.
 * @hidden
 */
export function makeAsyncFunction(coroutineFactory, scheduler, abortSignal) {
    return function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        // Run the coroutine asynchronously.
        return runCoroutineAsync(coroutineFactory.apply(void 0, params), scheduler, abortSignal);
    };
}
//# sourceMappingURL=coroutine.js.map