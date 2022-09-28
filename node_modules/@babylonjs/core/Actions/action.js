import { Observable } from "../Misc/observable.js";
import { Vector2, Vector3 } from "../Maths/math.vector.js";
import { Color3, Color4 } from "../Maths/math.color.js";
import { RegisterClass } from "../Misc/typeStore.js";
/**
 * The action to be carried out following a trigger
 * @see https://doc.babylonjs.com/how_to/how_to_use_actions#available-actions
 */
var Action = /** @class */ (function () {
    /**
     * Creates a new Action
     * @param triggerOptions the trigger, with or without parameters, for the action
     * @param condition an optional determinant of action
     */
    function Action(
    /** the trigger, with or without parameters, for the action */
    triggerOptions, condition) {
        this.triggerOptions = triggerOptions;
        /**
         * An event triggered prior to action being executed.
         */
        this.onBeforeExecuteObservable = new Observable();
        if (triggerOptions.parameter) {
            this.trigger = triggerOptions.trigger;
            this._triggerParameter = triggerOptions.parameter;
        }
        else if (triggerOptions.trigger) {
            this.trigger = triggerOptions.trigger;
        }
        else {
            this.trigger = triggerOptions;
        }
        this._nextActiveAction = this;
        this._condition = condition;
    }
    /**
     * Internal only
     * @hidden
     */
    Action.prototype._prepare = function () { };
    /**
     * Gets the trigger parameter
     * @returns the trigger parameter
     */
    Action.prototype.getTriggerParameter = function () {
        return this._triggerParameter;
    };
    /**
     * Sets the trigger parameter
     * @param value defines the new trigger parameter
     */
    Action.prototype.setTriggerParameter = function (value) {
        this._triggerParameter = value;
    };
    /**
     * Internal only - Returns if the current condition allows to run the action
     * @hidden
     */
    Action.prototype._evaluateConditionForCurrentFrame = function () {
        var condition = this._condition;
        if (!condition) {
            return true;
        }
        var currentRenderId = this._actionManager.getScene().getRenderId();
        // We cache the current evaluation for the current frame
        if (condition._evaluationId !== currentRenderId) {
            condition._evaluationId = currentRenderId;
            condition._currentResult = condition.isValid();
        }
        return condition._currentResult;
    };
    /**
     * Internal only - executes current action event
     * @param evt
     * @hidden
     */
    Action.prototype._executeCurrent = function (evt) {
        var isConditionValid = this._evaluateConditionForCurrentFrame();
        if (!isConditionValid) {
            return;
        }
        this.onBeforeExecuteObservable.notifyObservers(this);
        this._nextActiveAction.execute(evt);
        this.skipToNextActiveAction();
    };
    /**
     * Execute placeholder for child classes
     * @param evt optional action event
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Action.prototype.execute = function (evt) { };
    /**
     * Skips to next active action
     */
    Action.prototype.skipToNextActiveAction = function () {
        if (this._nextActiveAction._child) {
            if (!this._nextActiveAction._child._actionManager) {
                this._nextActiveAction._child._actionManager = this._actionManager;
            }
            this._nextActiveAction = this._nextActiveAction._child;
        }
        else {
            this._nextActiveAction = this;
        }
    };
    /**
     * Adds action to chain of actions, may be a DoNothingAction
     * @param action defines the next action to execute
     * @returns The action passed in
     * @see https://www.babylonjs-playground.com/#1T30HR#0
     */
    Action.prototype.then = function (action) {
        this._child = action;
        action._actionManager = this._actionManager;
        action._prepare();
        return action;
    };
    /**
     * Internal only
     * @param propertyPath
     * @hidden
     */
    Action.prototype._getProperty = function (propertyPath) {
        return this._actionManager._getProperty(propertyPath);
    };
    /**
     * Internal only
     * @param target
     * @param propertyPath
     * @hidden
     */
    Action.prototype._getEffectiveTarget = function (target, propertyPath) {
        return this._actionManager._getEffectiveTarget(target, propertyPath);
    };
    /**
     * Serialize placeholder for child classes
     * @param parent of child
     * @returns the serialized object
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Action.prototype.serialize = function (parent) { };
    /**
     * Internal only called by serialize
     * @param serializedAction
     * @param parent
     * @hidden
     */
    Action.prototype._serialize = function (serializedAction, parent) {
        var serializationObject = {
            type: 1,
            children: [],
            name: serializedAction.name,
            properties: serializedAction.properties || [],
        };
        // Serialize child
        if (this._child) {
            this._child.serialize(serializationObject);
        }
        // Check if "this" has a condition
        if (this._condition) {
            var serializedCondition = this._condition.serialize();
            serializedCondition.children.push(serializationObject);
            if (parent) {
                parent.children.push(serializedCondition);
            }
            return serializedCondition;
        }
        if (parent) {
            parent.children.push(serializationObject);
        }
        return serializationObject;
    };
    /**
     * Internal only
     * @param value
     * @hidden
     */
    Action._SerializeValueAsString = function (value) {
        if (typeof value === "number") {
            return value.toString();
        }
        if (typeof value === "boolean") {
            return value ? "true" : "false";
        }
        if (value instanceof Vector2) {
            return value.x + ", " + value.y;
        }
        if (value instanceof Vector3) {
            return value.x + ", " + value.y + ", " + value.z;
        }
        if (value instanceof Color3) {
            return value.r + ", " + value.g + ", " + value.b;
        }
        if (value instanceof Color4) {
            return value.r + ", " + value.g + ", " + value.b + ", " + value.a;
        }
        return value; // string
    };
    /**
     * Internal only
     * @param target
     * @hidden
     */
    Action._GetTargetProperty = function (target) {
        return {
            name: "target",
            targetType: target._isMesh
                ? "MeshProperties"
                : target._isLight
                    ? "LightProperties"
                    : target._isCamera
                        ? "CameraProperties"
                        : "SceneProperties",
            value: target._isScene ? "Scene" : target.name,
        };
    };
    return Action;
}());
export { Action };
RegisterClass("BABYLON.Action", Action);
//# sourceMappingURL=action.js.map