
/**
 * Abstract class used to decouple action Manager from scene and meshes.
 * Do not instantiate.
 * @see https://doc.babylonjs.com/how_to/how_to_use_actions
 */
var AbstractActionManager = /** @class */ (function () {
    function AbstractActionManager() {
        /** Gets the cursor to use when hovering items */
        this.hoverCursor = "";
        /** Gets the list of actions */
        this.actions = new Array();
        /**
         * Gets or sets a boolean indicating that the manager is recursive meaning that it can trigger action from children
         */
        this.isRecursive = false;
    }
    Object.defineProperty(AbstractActionManager, "HasTriggers", {
        /**
         * Does exist one action manager with at least one trigger
         **/
        get: function () {
            for (var t in AbstractActionManager.Triggers) {
                if (Object.prototype.hasOwnProperty.call(AbstractActionManager.Triggers, t)) {
                    return true;
                }
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AbstractActionManager, "HasPickTriggers", {
        /**
         * Does exist one action manager with at least one pick trigger
         **/
        get: function () {
            for (var t in AbstractActionManager.Triggers) {
                if (Object.prototype.hasOwnProperty.call(AbstractActionManager.Triggers, t)) {
                    var tAsInt = parseInt(t);
                    if (tAsInt >= 1 && tAsInt <= 7) {
                        return true;
                    }
                }
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Does exist one action manager that handles actions of a given trigger
     * @param trigger defines the trigger to be tested
     * @return a boolean indicating whether the trigger is handled by at least one action manager
     **/
    AbstractActionManager.HasSpecificTrigger = function (trigger) {
        for (var t in AbstractActionManager.Triggers) {
            if (Object.prototype.hasOwnProperty.call(AbstractActionManager.Triggers, t)) {
                var tAsInt = parseInt(t);
                if (tAsInt === trigger) {
                    return true;
                }
            }
        }
        return false;
    };
    /** Gets the list of active triggers */
    AbstractActionManager.Triggers = {};
    return AbstractActionManager;
}());
export { AbstractActionManager };
//# sourceMappingURL=abstractActionManager.js.map