import { DomManagement } from "./domManagement.js";
/**
 * Class containing a set of static utilities functions for precision date
 */
var PrecisionDate = /** @class */ (function () {
    function PrecisionDate() {
    }
    Object.defineProperty(PrecisionDate, "Now", {
        /**
         * Gets either window.performance.now() if supported or Date.now() else
         */
        get: function () {
            if (DomManagement.IsWindowObjectExist() && window.performance && window.performance.now) {
                return window.performance.now();
            }
            return Date.now();
        },
        enumerable: false,
        configurable: true
    });
    return PrecisionDate;
}());
export { PrecisionDate };
//# sourceMappingURL=precisionDate.js.map