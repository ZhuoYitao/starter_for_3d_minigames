import { PointerInfoPre, PointerInfo, PointerEventTypes } from "../Events/pointerEvents.js";
import { AbstractActionManager } from "../Actions/abstractActionManager.js";
import { PickingInfo } from "../Collisions/pickingInfo.js";
import { Vector2, Matrix } from "../Maths/math.vector.js";

import { ActionEvent } from "../Actions/actionEvent.js";
import { KeyboardEventTypes, KeyboardInfoPre, KeyboardInfo } from "../Events/keyboardEvents.js";
import { DeviceType, PointerInput } from "../DeviceInput/InputDevices/deviceEnums.js";
import { DeviceSourceManager } from "../DeviceInput/InputDevices/deviceSourceManager.js";
import { EngineStore } from "../Engines/engineStore.js";
/** @hidden */
// eslint-disable-next-line @typescript-eslint/naming-convention
var _ClickInfo = /** @class */ (function () {
    function _ClickInfo() {
        this._singleClick = false;
        this._doubleClick = false;
        this._hasSwiped = false;
        this._ignore = false;
    }
    Object.defineProperty(_ClickInfo.prototype, "singleClick", {
        get: function () {
            return this._singleClick;
        },
        set: function (b) {
            this._singleClick = b;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(_ClickInfo.prototype, "doubleClick", {
        get: function () {
            return this._doubleClick;
        },
        set: function (b) {
            this._doubleClick = b;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(_ClickInfo.prototype, "hasSwiped", {
        get: function () {
            return this._hasSwiped;
        },
        set: function (b) {
            this._hasSwiped = b;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(_ClickInfo.prototype, "ignore", {
        get: function () {
            return this._ignore;
        },
        set: function (b) {
            this._ignore = b;
        },
        enumerable: false,
        configurable: true
    });
    return _ClickInfo;
}());
/**
 * Class used to manage all inputs for the scene.
 */
var InputManager = /** @class */ (function () {
    /**
     * Creates a new InputManager
     * @param scene - defines the hosting scene
     */
    function InputManager(scene) {
        /** This is a defensive check to not allow control attachment prior to an already active one. If already attached, previous control is unattached before attaching the new one. */
        this._alreadyAttached = false;
        this._meshPickProceed = false;
        this._currentPickResult = null;
        this._previousPickResult = null;
        this._totalPointersPressed = 0;
        this._doubleClickOccured = false;
        this._pointerX = 0;
        this._pointerY = 0;
        this._startingPointerPosition = new Vector2(0, 0);
        this._previousStartingPointerPosition = new Vector2(0, 0);
        this._startingPointerTime = 0;
        this._previousStartingPointerTime = 0;
        this._pointerCaptures = {};
        this._meshUnderPointerId = {};
        this._deviceSourceManager = null;
        this._scene = scene || EngineStore.LastCreatedScene;
        if (!this._scene) {
            return;
        }
    }
    Object.defineProperty(InputManager.prototype, "meshUnderPointer", {
        /**
         * Gets the mesh that is currently under the pointer
         * @returns Mesh that the pointer is pointer is hovering over
         */
        get: function () {
            return this._pointerOverMesh;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * When using more than one pointer (for example in XR) you can get the mesh under the specific pointer
     * @param pointerId - the pointer id to use
     * @returns The mesh under this pointer id or null if not found
     */
    InputManager.prototype.getMeshUnderPointerByPointerId = function (pointerId) {
        return this._meshUnderPointerId[pointerId] || null;
    };
    Object.defineProperty(InputManager.prototype, "unTranslatedPointer", {
        /**
         * Gets the pointer coordinates in 2D without any translation (ie. straight out of the pointer event)
         * @returns Vector with X/Y values directly from pointer event
         */
        get: function () {
            return new Vector2(this._unTranslatedPointerX, this._unTranslatedPointerY);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "pointerX", {
        /**
         * Gets or sets the current on-screen X position of the pointer
         * @returns Translated X with respect to screen
         */
        get: function () {
            return this._pointerX;
        },
        set: function (value) {
            this._pointerX = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputManager.prototype, "pointerY", {
        /**
         * Gets or sets the current on-screen Y position of the pointer
         * @returns Translated Y with respect to screen
         */
        get: function () {
            return this._pointerY;
        },
        set: function (value) {
            this._pointerY = value;
        },
        enumerable: false,
        configurable: true
    });
    InputManager.prototype._updatePointerPosition = function (evt) {
        var canvasRect = this._scene.getEngine().getInputElementClientRect();
        if (!canvasRect) {
            return;
        }
        this._pointerX = evt.clientX - canvasRect.left;
        this._pointerY = evt.clientY - canvasRect.top;
        this._unTranslatedPointerX = this._pointerX;
        this._unTranslatedPointerY = this._pointerY;
    };
    InputManager.prototype._processPointerMove = function (pickResult, evt) {
        var scene = this._scene;
        var engine = scene.getEngine();
        var canvas = engine.getInputElement();
        if (canvas) {
            canvas.tabIndex = engine.canvasTabIndex;
            // Restore pointer
            if (!scene.doNotHandleCursors) {
                canvas.style.cursor = scene.defaultCursor;
            }
        }
        var isMeshPicked = pickResult && pickResult.hit && pickResult.pickedMesh ? true : false;
        if (isMeshPicked) {
            scene.setPointerOverMesh(pickResult.pickedMesh, evt.pointerId, pickResult);
            if (this._pointerOverMesh && this._pointerOverMesh.actionManager && this._pointerOverMesh.actionManager.hasPointerTriggers) {
                if (!scene.doNotHandleCursors && canvas) {
                    if (this._pointerOverMesh.actionManager.hoverCursor) {
                        canvas.style.cursor = this._pointerOverMesh.actionManager.hoverCursor;
                    }
                    else {
                        canvas.style.cursor = scene.hoverCursor;
                    }
                }
            }
        }
        else {
            scene.setPointerOverMesh(null, evt.pointerId, pickResult);
        }
        for (var _i = 0, _a = scene._pointerMoveStage; _i < _a.length; _i++) {
            var step = _a[_i];
            pickResult = step.action(this._unTranslatedPointerX, this._unTranslatedPointerY, pickResult, isMeshPicked, canvas);
        }
        if (pickResult) {
            var type = evt.type === "wheel" || evt.type === "mousewheel" || evt.type === "DOMMouseScroll" ? PointerEventTypes.POINTERWHEEL : PointerEventTypes.POINTERMOVE;
            if (scene.onPointerMove) {
                scene.onPointerMove(evt, pickResult, type);
            }
            if (scene.onPointerObservable.hasObservers()) {
                var pi = new PointerInfo(type, evt, pickResult);
                this._setRayOnPointerInfo(pi);
                scene.onPointerObservable.notifyObservers(pi, type);
            }
        }
    };
    // Pointers handling
    InputManager.prototype._setRayOnPointerInfo = function (pointerInfo) {
        var scene = this._scene;
        if (pointerInfo.pickInfo && !pointerInfo.pickInfo._pickingUnavailable) {
            if (!pointerInfo.pickInfo.ray) {
                pointerInfo.pickInfo.ray = scene.createPickingRay(pointerInfo.event.offsetX, pointerInfo.event.offsetY, Matrix.Identity(), scene.activeCamera);
            }
        }
    };
    InputManager.prototype._checkPrePointerObservable = function (pickResult, evt, type) {
        var scene = this._scene;
        var pi = new PointerInfoPre(type, evt, this._unTranslatedPointerX, this._unTranslatedPointerY);
        if (pickResult) {
            pi.ray = pickResult.ray;
            if (pickResult.originMesh) {
                pi.nearInteractionPickingInfo = pickResult;
            }
        }
        scene.onPrePointerObservable.notifyObservers(pi, type);
        if (pi.skipOnPointerObservable) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Use this method to simulate a pointer move on a mesh
     * The pickResult parameter can be obtained from a scene.pick or scene.pickWithRay
     * @param pickResult - pickingInfo of the object wished to simulate pointer event on
     * @param pointerEventInit - pointer event state to be used when simulating the pointer event (eg. pointer id for multitouch)
     */
    InputManager.prototype.simulatePointerMove = function (pickResult, pointerEventInit) {
        var evt = new PointerEvent("pointermove", pointerEventInit);
        evt.inputIndex = PointerInput.Move;
        if (this._checkPrePointerObservable(pickResult, evt, PointerEventTypes.POINTERMOVE)) {
            return;
        }
        this._processPointerMove(pickResult, evt);
    };
    /**
     * Use this method to simulate a pointer down on a mesh
     * The pickResult parameter can be obtained from a scene.pick or scene.pickWithRay
     * @param pickResult - pickingInfo of the object wished to simulate pointer event on
     * @param pointerEventInit - pointer event state to be used when simulating the pointer event (eg. pointer id for multitouch)
     */
    InputManager.prototype.simulatePointerDown = function (pickResult, pointerEventInit) {
        var evt = new PointerEvent("pointerdown", pointerEventInit);
        evt.inputIndex = evt.button + 2;
        if (this._checkPrePointerObservable(pickResult, evt, PointerEventTypes.POINTERDOWN)) {
            return;
        }
        this._processPointerDown(pickResult, evt);
    };
    InputManager.prototype._processPointerDown = function (pickResult, evt) {
        var _this = this;
        var scene = this._scene;
        if (pickResult && pickResult.hit && pickResult.pickedMesh) {
            this._pickedDownMesh = pickResult.pickedMesh;
            var actionManager_1 = pickResult.pickedMesh._getActionManagerForTrigger();
            if (actionManager_1) {
                if (actionManager_1.hasPickTriggers) {
                    actionManager_1.processTrigger(5, ActionEvent.CreateNew(pickResult.pickedMesh, evt));
                    switch (evt.button) {
                        case 0:
                            actionManager_1.processTrigger(2, ActionEvent.CreateNew(pickResult.pickedMesh, evt));
                            break;
                        case 1:
                            actionManager_1.processTrigger(4, ActionEvent.CreateNew(pickResult.pickedMesh, evt));
                            break;
                        case 2:
                            actionManager_1.processTrigger(3, ActionEvent.CreateNew(pickResult.pickedMesh, evt));
                            break;
                    }
                }
                if (actionManager_1.hasSpecificTrigger(8)) {
                    window.setTimeout(function () {
                        var pickResult = scene.pick(_this._unTranslatedPointerX, _this._unTranslatedPointerY, function (mesh) {
                            return ((mesh.isPickable &&
                                mesh.isVisible &&
                                mesh.isReady() &&
                                mesh.actionManager &&
                                mesh.actionManager.hasSpecificTrigger(8) &&
                                mesh === _this._pickedDownMesh));
                        }, false, scene.cameraToUseForPointers);
                        if (pickResult && pickResult.hit && pickResult.pickedMesh && actionManager_1) {
                            if (_this._totalPointersPressed !== 0 && Date.now() - _this._startingPointerTime > InputManager.LongPressDelay && !_this._isPointerSwiping()) {
                                _this._startingPointerTime = 0;
                                actionManager_1.processTrigger(8, ActionEvent.CreateNew(pickResult.pickedMesh, evt));
                            }
                        }
                    }, InputManager.LongPressDelay);
                }
            }
        }
        else {
            for (var _i = 0, _a = scene._pointerDownStage; _i < _a.length; _i++) {
                var step = _a[_i];
                pickResult = step.action(this._unTranslatedPointerX, this._unTranslatedPointerY, pickResult, evt);
            }
        }
        if (pickResult) {
            var type = PointerEventTypes.POINTERDOWN;
            if (scene.onPointerDown) {
                scene.onPointerDown(evt, pickResult, type);
            }
            if (scene.onPointerObservable.hasObservers()) {
                var pi = new PointerInfo(type, evt, pickResult);
                this._setRayOnPointerInfo(pi);
                scene.onPointerObservable.notifyObservers(pi, type);
            }
        }
    };
    /**
     * @hidden
     * @returns Boolean if delta for pointer exceeds drag movement threshold
     */
    InputManager.prototype._isPointerSwiping = function () {
        return (Math.abs(this._startingPointerPosition.x - this._pointerX) > InputManager.DragMovementThreshold ||
            Math.abs(this._startingPointerPosition.y - this._pointerY) > InputManager.DragMovementThreshold);
    };
    /**
     * Use this method to simulate a pointer up on a mesh
     * The pickResult parameter can be obtained from a scene.pick or scene.pickWithRay
     * @param pickResult - pickingInfo of the object wished to simulate pointer event on
     * @param pointerEventInit - pointer event state to be used when simulating the pointer event (eg. pointer id for multitouch)
     * @param doubleTap - indicates that the pointer up event should be considered as part of a double click (false by default)
     */
    InputManager.prototype.simulatePointerUp = function (pickResult, pointerEventInit, doubleTap) {
        var evt = new PointerEvent("pointerup", pointerEventInit);
        evt.inputIndex = PointerInput.Move;
        var clickInfo = new _ClickInfo();
        if (doubleTap) {
            clickInfo.doubleClick = true;
        }
        else {
            clickInfo.singleClick = true;
        }
        if (this._checkPrePointerObservable(pickResult, evt, PointerEventTypes.POINTERUP)) {
            return;
        }
        this._processPointerUp(pickResult, evt, clickInfo);
    };
    InputManager.prototype._processPointerUp = function (pickResult, evt, clickInfo) {
        var scene = this._scene;
        if (pickResult && pickResult && pickResult.pickedMesh) {
            this._pickedUpMesh = pickResult.pickedMesh;
            if (this._pickedDownMesh === this._pickedUpMesh) {
                if (scene.onPointerPick) {
                    scene.onPointerPick(evt, pickResult);
                }
                if (clickInfo.singleClick && !clickInfo.ignore && scene.onPointerObservable.hasObservers()) {
                    var type_1 = PointerEventTypes.POINTERPICK;
                    var pi = new PointerInfo(type_1, evt, pickResult);
                    this._setRayOnPointerInfo(pi);
                    scene.onPointerObservable.notifyObservers(pi, type_1);
                }
            }
            var actionManager = pickResult.pickedMesh._getActionManagerForTrigger();
            if (actionManager && !clickInfo.ignore) {
                actionManager.processTrigger(7, ActionEvent.CreateNew(pickResult.pickedMesh, evt, pickResult));
                if (!clickInfo.hasSwiped && clickInfo.singleClick) {
                    actionManager.processTrigger(1, ActionEvent.CreateNew(pickResult.pickedMesh, evt, pickResult));
                }
                var doubleClickActionManager = pickResult.pickedMesh._getActionManagerForTrigger(6);
                if (clickInfo.doubleClick && doubleClickActionManager) {
                    doubleClickActionManager.processTrigger(6, ActionEvent.CreateNew(pickResult.pickedMesh, evt, pickResult));
                }
            }
        }
        else {
            if (!clickInfo.ignore) {
                for (var _i = 0, _a = scene._pointerUpStage; _i < _a.length; _i++) {
                    var step = _a[_i];
                    pickResult = step.action(this._unTranslatedPointerX, this._unTranslatedPointerY, pickResult, evt);
                }
            }
        }
        if (this._pickedDownMesh && this._pickedDownMesh !== this._pickedUpMesh) {
            var pickedDownActionManager = this._pickedDownMesh._getActionManagerForTrigger(16);
            if (pickedDownActionManager) {
                pickedDownActionManager.processTrigger(16, ActionEvent.CreateNew(this._pickedDownMesh, evt));
            }
        }
        var type = 0;
        if (scene.onPointerObservable.hasObservers()) {
            if (!clickInfo.ignore && !clickInfo.hasSwiped) {
                if (clickInfo.singleClick && scene.onPointerObservable.hasSpecificMask(PointerEventTypes.POINTERTAP)) {
                    type = PointerEventTypes.POINTERTAP;
                }
                else if (clickInfo.doubleClick && scene.onPointerObservable.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP)) {
                    type = PointerEventTypes.POINTERDOUBLETAP;
                }
                if (type) {
                    var pi = new PointerInfo(type, evt, pickResult);
                    this._setRayOnPointerInfo(pi);
                    scene.onPointerObservable.notifyObservers(pi, type);
                }
            }
            if (!clickInfo.ignore) {
                type = PointerEventTypes.POINTERUP;
                var pi = new PointerInfo(type, evt, pickResult);
                this._setRayOnPointerInfo(pi);
                scene.onPointerObservable.notifyObservers(pi, type);
            }
        }
        if (scene.onPointerUp && !clickInfo.ignore) {
            scene.onPointerUp(evt, pickResult, type);
        }
    };
    /**
     * Gets a boolean indicating if the current pointer event is captured (meaning that the scene has already handled the pointer down)
     * @param pointerId - defines the pointer id to use in a multi-touch scenario (0 by default)
     * @returns true if the pointer was captured
     */
    InputManager.prototype.isPointerCaptured = function (pointerId) {
        if (pointerId === void 0) { pointerId = 0; }
        return this._pointerCaptures[pointerId];
    };
    /**
     * Attach events to the canvas (To handle actionManagers triggers and raise onPointerMove, onPointerDown and onPointerUp
     * @param attachUp - defines if you want to attach events to pointerup
     * @param attachDown - defines if you want to attach events to pointerdown
     * @param attachMove - defines if you want to attach events to pointermove
     * @param elementToAttachTo - defines the target DOM element to attach to (will use the canvas by default)
     */
    InputManager.prototype.attachControl = function (attachUp, attachDown, attachMove, elementToAttachTo) {
        var _this = this;
        if (attachUp === void 0) { attachUp = true; }
        if (attachDown === void 0) { attachDown = true; }
        if (attachMove === void 0) { attachMove = true; }
        if (elementToAttachTo === void 0) { elementToAttachTo = null; }
        var scene = this._scene;
        var engine = scene.getEngine();
        if (!elementToAttachTo) {
            elementToAttachTo = engine.getInputElement();
        }
        if (this._alreadyAttached) {
            this.detachControl();
        }
        if (elementToAttachTo) {
            this._alreadyAttachedTo = elementToAttachTo;
        }
        this._deviceSourceManager = new DeviceSourceManager(engine);
        this._initActionManager = function (act) {
            if (!_this._meshPickProceed) {
                var pickResult = scene.pick(_this._unTranslatedPointerX, _this._unTranslatedPointerY, scene.pointerDownPredicate, false, scene.cameraToUseForPointers);
                _this._currentPickResult = pickResult;
                if (pickResult) {
                    act = pickResult.hit && pickResult.pickedMesh ? pickResult.pickedMesh._getActionManagerForTrigger() : null;
                }
                _this._meshPickProceed = true;
            }
            return act;
        };
        this._delayedSimpleClick = function (btn, clickInfo, cb) {
            // double click delay is over and that no double click has been raised since, or the 2 consecutive keys pressed are different
            if ((Date.now() - _this._previousStartingPointerTime > InputManager.DoubleClickDelay && !_this._doubleClickOccured) || btn !== _this._previousButtonPressed) {
                _this._doubleClickOccured = false;
                clickInfo.singleClick = true;
                clickInfo.ignore = false;
                cb(clickInfo, _this._currentPickResult);
            }
        };
        this._initClickEvent = function (obs1, obs2, evt, cb) {
            var clickInfo = new _ClickInfo();
            _this._currentPickResult = null;
            var act = null;
            var checkPicking = obs1.hasSpecificMask(PointerEventTypes.POINTERPICK) ||
                obs2.hasSpecificMask(PointerEventTypes.POINTERPICK) ||
                obs1.hasSpecificMask(PointerEventTypes.POINTERTAP) ||
                obs2.hasSpecificMask(PointerEventTypes.POINTERTAP) ||
                obs1.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP) ||
                obs2.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP);
            if (!checkPicking && AbstractActionManager) {
                act = _this._initActionManager(act, clickInfo);
                if (act) {
                    checkPicking = act.hasPickTriggers;
                }
            }
            var needToIgnoreNext = false;
            if (checkPicking) {
                var btn = evt.button;
                clickInfo.hasSwiped = _this._isPointerSwiping();
                if (!clickInfo.hasSwiped) {
                    var checkSingleClickImmediately = !InputManager.ExclusiveDoubleClickMode;
                    if (!checkSingleClickImmediately) {
                        checkSingleClickImmediately = !obs1.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP) && !obs2.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP);
                        if (checkSingleClickImmediately && !AbstractActionManager.HasSpecificTrigger(6)) {
                            act = _this._initActionManager(act, clickInfo);
                            if (act) {
                                checkSingleClickImmediately = !act.hasSpecificTrigger(6);
                            }
                        }
                    }
                    if (checkSingleClickImmediately) {
                        // single click detected if double click delay is over or two different successive keys pressed without exclusive double click or no double click required
                        if (Date.now() - _this._previousStartingPointerTime > InputManager.DoubleClickDelay || btn !== _this._previousButtonPressed) {
                            clickInfo.singleClick = true;
                            cb(clickInfo, _this._currentPickResult);
                            needToIgnoreNext = true;
                        }
                    }
                    // at least one double click is required to be check and exclusive double click is enabled
                    else {
                        // wait that no double click has been raised during the double click delay
                        _this._previousDelayedSimpleClickTimeout = _this._delayedSimpleClickTimeout;
                        _this._delayedSimpleClickTimeout = window.setTimeout(_this._delayedSimpleClick.bind(_this, btn, clickInfo, cb), InputManager.DoubleClickDelay);
                    }
                    var checkDoubleClick = obs1.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP) || obs2.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP);
                    if (!checkDoubleClick && AbstractActionManager.HasSpecificTrigger(6)) {
                        act = _this._initActionManager(act, clickInfo);
                        if (act) {
                            checkDoubleClick = act.hasSpecificTrigger(6);
                        }
                    }
                    if (checkDoubleClick) {
                        // two successive keys pressed are equal, double click delay is not over and double click has not just occurred
                        if (btn === _this._previousButtonPressed && Date.now() - _this._previousStartingPointerTime < InputManager.DoubleClickDelay && !_this._doubleClickOccured) {
                            // pointer has not moved for 2 clicks, it's a double click
                            if (!clickInfo.hasSwiped && !_this._isPointerSwiping()) {
                                _this._previousStartingPointerTime = 0;
                                _this._doubleClickOccured = true;
                                clickInfo.doubleClick = true;
                                clickInfo.ignore = false;
                                if (InputManager.ExclusiveDoubleClickMode && _this._previousDelayedSimpleClickTimeout) {
                                    clearTimeout(_this._previousDelayedSimpleClickTimeout);
                                }
                                _this._previousDelayedSimpleClickTimeout = _this._delayedSimpleClickTimeout;
                                cb(clickInfo, _this._currentPickResult);
                            }
                            // if the two successive clicks are too far, it's just two simple clicks
                            else {
                                _this._doubleClickOccured = false;
                                _this._previousStartingPointerTime = _this._startingPointerTime;
                                _this._previousStartingPointerPosition.x = _this._startingPointerPosition.x;
                                _this._previousStartingPointerPosition.y = _this._startingPointerPosition.y;
                                _this._previousButtonPressed = btn;
                                if (InputManager.ExclusiveDoubleClickMode) {
                                    if (_this._previousDelayedSimpleClickTimeout) {
                                        clearTimeout(_this._previousDelayedSimpleClickTimeout);
                                    }
                                    _this._previousDelayedSimpleClickTimeout = _this._delayedSimpleClickTimeout;
                                    cb(clickInfo, _this._previousPickResult);
                                }
                                else {
                                    cb(clickInfo, _this._currentPickResult);
                                }
                            }
                            needToIgnoreNext = true;
                        }
                        // just the first click of the double has been raised
                        else {
                            _this._doubleClickOccured = false;
                            _this._previousStartingPointerTime = _this._startingPointerTime;
                            _this._previousStartingPointerPosition.x = _this._startingPointerPosition.x;
                            _this._previousStartingPointerPosition.y = _this._startingPointerPosition.y;
                            _this._previousButtonPressed = btn;
                        }
                    }
                }
            }
            if (!needToIgnoreNext) {
                cb(clickInfo, _this._currentPickResult);
            }
        };
        this._onPointerMove = function (evt) {
            // preserve compatibility with Safari when pointerId is not present
            if (evt.pointerId === undefined) {
                evt.pointerId = 0;
            }
            _this._updatePointerPosition(evt);
            // PreObservable support
            if (_this._checkPrePointerObservable(null, evt, evt.type === "wheel" || evt.type === "mousewheel" || evt.type === "DOMMouseScroll" ? PointerEventTypes.POINTERWHEEL : PointerEventTypes.POINTERMOVE)) {
                return;
            }
            if (!scene.cameraToUseForPointers && !scene.activeCamera) {
                return;
            }
            if (scene.skipPointerMovePicking) {
                _this._processPointerMove(new PickingInfo(), evt);
                return;
            }
            if (!scene.pointerMovePredicate) {
                scene.pointerMovePredicate = function (mesh) {
                    return mesh.isPickable &&
                        mesh.isVisible &&
                        mesh.isReady() &&
                        mesh.isEnabled() &&
                        (mesh.enablePointerMoveEvents || scene.constantlyUpdateMeshUnderPointer || mesh._getActionManagerForTrigger() !== null) &&
                        (!scene.cameraToUseForPointers || (scene.cameraToUseForPointers.layerMask & mesh.layerMask) !== 0);
                };
            }
            // Meshes
            var pickResult = scene.pick(_this._unTranslatedPointerX, _this._unTranslatedPointerY, scene.pointerMovePredicate, false, scene.cameraToUseForPointers, scene.pointerMoveTrianglePredicate);
            _this._processPointerMove(pickResult, evt);
        };
        this._onPointerDown = function (evt) {
            _this._totalPointersPressed++;
            _this._pickedDownMesh = null;
            _this._meshPickProceed = false;
            // preserve compatibility with Safari when pointerId is not present
            if (evt.pointerId === undefined) {
                evt.pointerId = 0;
            }
            _this._updatePointerPosition(evt);
            if (scene.preventDefaultOnPointerDown && elementToAttachTo) {
                evt.preventDefault();
                elementToAttachTo.focus();
            }
            _this._startingPointerPosition.x = _this._pointerX;
            _this._startingPointerPosition.y = _this._pointerY;
            _this._startingPointerTime = Date.now();
            // PreObservable support
            if (_this._checkPrePointerObservable(null, evt, PointerEventTypes.POINTERDOWN)) {
                return;
            }
            if (!scene.cameraToUseForPointers && !scene.activeCamera) {
                return;
            }
            _this._pointerCaptures[evt.pointerId] = true;
            if (!scene.pointerDownPredicate) {
                scene.pointerDownPredicate = function (mesh) {
                    return (mesh.isPickable &&
                        mesh.isVisible &&
                        mesh.isReady() &&
                        mesh.isEnabled() &&
                        (!scene.cameraToUseForPointers || (scene.cameraToUseForPointers.layerMask & mesh.layerMask) !== 0));
                };
            }
            // Meshes
            _this._pickedDownMesh = null;
            var pickResult;
            if (scene.skipPointerDownPicking) {
                pickResult = new PickingInfo();
            }
            else {
                pickResult = scene.pick(_this._unTranslatedPointerX, _this._unTranslatedPointerY, scene.pointerDownPredicate, false, scene.cameraToUseForPointers);
            }
            _this._processPointerDown(pickResult, evt);
        };
        this._onPointerUp = function (evt) {
            if (_this._totalPointersPressed === 0) {
                // We are attaching the pointer up to windows because of a bug in FF
                return; // So we need to test it the pointer down was pressed before.
            }
            _this._totalPointersPressed--;
            _this._pickedUpMesh = null;
            _this._meshPickProceed = false;
            // preserve compatibility with Safari when pointerId is not present
            if (evt.pointerId === undefined) {
                evt.pointerId = 0;
            }
            _this._updatePointerPosition(evt);
            if (scene.preventDefaultOnPointerUp && elementToAttachTo) {
                evt.preventDefault();
                elementToAttachTo.focus();
            }
            _this._initClickEvent(scene.onPrePointerObservable, scene.onPointerObservable, evt, function (clickInfo, pickResult) {
                // PreObservable support
                if (scene.onPrePointerObservable.hasObservers()) {
                    if (!clickInfo.ignore) {
                        if (!clickInfo.hasSwiped) {
                            if (clickInfo.singleClick && scene.onPrePointerObservable.hasSpecificMask(PointerEventTypes.POINTERTAP)) {
                                if (_this._checkPrePointerObservable(null, evt, PointerEventTypes.POINTERTAP)) {
                                    return;
                                }
                            }
                            if (clickInfo.doubleClick && scene.onPrePointerObservable.hasSpecificMask(PointerEventTypes.POINTERDOUBLETAP)) {
                                if (_this._checkPrePointerObservable(null, evt, PointerEventTypes.POINTERDOUBLETAP)) {
                                    return;
                                }
                            }
                        }
                        if (_this._checkPrePointerObservable(null, evt, PointerEventTypes.POINTERUP)) {
                            return;
                        }
                    }
                }
                if (!_this._pointerCaptures[evt.pointerId] && evt.buttons > 0) {
                    return;
                }
                _this._pointerCaptures[evt.pointerId] = false;
                if (!scene.cameraToUseForPointers && !scene.activeCamera) {
                    return;
                }
                if (!scene.pointerUpPredicate) {
                    scene.pointerUpPredicate = function (mesh) {
                        return (mesh.isPickable &&
                            mesh.isVisible &&
                            mesh.isReady() &&
                            mesh.isEnabled() &&
                            (!scene.cameraToUseForPointers || (scene.cameraToUseForPointers.layerMask & mesh.layerMask) !== 0));
                    };
                }
                // Meshes
                if (!_this._meshPickProceed && ((AbstractActionManager && AbstractActionManager.HasTriggers) || scene.onPointerObservable.hasObservers())) {
                    _this._initActionManager(null, clickInfo);
                }
                if (!pickResult) {
                    pickResult = _this._currentPickResult;
                }
                _this._processPointerUp(pickResult, evt, clickInfo);
                _this._previousPickResult = _this._currentPickResult;
            });
        };
        this._onKeyDown = function (evt) {
            var type = KeyboardEventTypes.KEYDOWN;
            if (scene.onPreKeyboardObservable.hasObservers()) {
                var pi = new KeyboardInfoPre(type, evt);
                scene.onPreKeyboardObservable.notifyObservers(pi, type);
                if (pi.skipOnKeyboardObservable) {
                    return;
                }
            }
            if (scene.onKeyboardObservable.hasObservers()) {
                var pi = new KeyboardInfo(type, evt);
                scene.onKeyboardObservable.notifyObservers(pi, type);
            }
            if (scene.actionManager) {
                scene.actionManager.processTrigger(14, ActionEvent.CreateNewFromScene(scene, evt));
            }
        };
        this._onKeyUp = function (evt) {
            var type = KeyboardEventTypes.KEYUP;
            if (scene.onPreKeyboardObservable.hasObservers()) {
                var pi = new KeyboardInfoPre(type, evt);
                scene.onPreKeyboardObservable.notifyObservers(pi, type);
                if (pi.skipOnKeyboardObservable) {
                    return;
                }
            }
            if (scene.onKeyboardObservable.hasObservers()) {
                var pi = new KeyboardInfo(type, evt);
                scene.onKeyboardObservable.notifyObservers(pi, type);
            }
            if (scene.actionManager) {
                scene.actionManager.processTrigger(15, ActionEvent.CreateNewFromScene(scene, evt));
            }
        };
        // If a device connects that we can handle, wire up the observable
        this._deviceSourceManager.onDeviceConnectedObservable.add(function (deviceSource) {
            if (deviceSource.deviceType === DeviceType.Mouse) {
                deviceSource.onInputChangedObservable.add(function (eventData) {
                    if (eventData.inputIndex === PointerInput.LeftClick || eventData.inputIndex === PointerInput.MiddleClick || eventData.inputIndex === PointerInput.RightClick) {
                        if (attachDown && deviceSource.getInput(eventData.inputIndex) === 1) {
                            _this._onPointerDown(eventData);
                        }
                        else if (attachUp && deviceSource.getInput(eventData.inputIndex) === 0) {
                            _this._onPointerUp(eventData);
                        }
                    }
                    else if (attachMove) {
                        if (eventData.inputIndex === PointerInput.Move) {
                            _this._onPointerMove(eventData);
                        }
                        else if (eventData.inputIndex === PointerInput.MouseWheelX ||
                            eventData.inputIndex === PointerInput.MouseWheelY ||
                            eventData.inputIndex === PointerInput.MouseWheelZ) {
                            _this._onPointerMove(eventData);
                        }
                    }
                });
            }
            else if (deviceSource.deviceType === DeviceType.Touch) {
                deviceSource.onInputChangedObservable.add(function (eventData) {
                    if (eventData.inputIndex === PointerInput.LeftClick) {
                        if (attachDown && deviceSource.getInput(eventData.inputIndex) === 1) {
                            _this._onPointerDown(eventData);
                        }
                        else if (attachUp && deviceSource.getInput(eventData.inputIndex) === 0) {
                            _this._onPointerUp(eventData);
                        }
                    }
                    if (attachMove && eventData.inputIndex === PointerInput.Move) {
                        _this._onPointerMove(eventData);
                    }
                });
            }
            else if (deviceSource.deviceType === DeviceType.Keyboard) {
                deviceSource.onInputChangedObservable.add(function (eventData) {
                    if (eventData.type === "keydown") {
                        _this._onKeyDown(eventData);
                    }
                    else if (eventData.type === "keyup") {
                        _this._onKeyUp(eventData);
                    }
                });
            }
        });
        this._alreadyAttached = true;
    };
    /**
     * Detaches all event handlers
     */
    InputManager.prototype.detachControl = function () {
        if (this._alreadyAttached) {
            this._deviceSourceManager.dispose();
            this._deviceSourceManager = null;
            // Cursor
            if (this._alreadyAttachedTo && !this._scene.doNotHandleCursors) {
                this._alreadyAttachedTo.style.cursor = this._scene.defaultCursor;
            }
            this._alreadyAttached = false;
            this._alreadyAttachedTo = null;
        }
    };
    /**
     * Force the value of meshUnderPointer
     * @param mesh - defines the mesh to use
     * @param pointerId - optional pointer id when using more than one pointer. Defaults to 0
     * @param pickResult - optional pickingInfo data used to find mesh
     */
    InputManager.prototype.setPointerOverMesh = function (mesh, pointerId, pickResult) {
        if (pointerId === void 0) { pointerId = 0; }
        if (this._meshUnderPointerId[pointerId] === mesh) {
            return;
        }
        var underPointerMesh = this._meshUnderPointerId[pointerId];
        var actionManager;
        if (underPointerMesh) {
            actionManager = underPointerMesh._getActionManagerForTrigger(10);
            if (actionManager) {
                actionManager.processTrigger(10, ActionEvent.CreateNew(underPointerMesh, undefined, { pointerId: pointerId }));
            }
        }
        if (mesh) {
            this._meshUnderPointerId[pointerId] = mesh;
            this._pointerOverMesh = mesh;
            actionManager = mesh._getActionManagerForTrigger(9);
            if (actionManager) {
                actionManager.processTrigger(9, ActionEvent.CreateNew(mesh, undefined, { pointerId: pointerId, pickResult: pickResult }));
            }
        }
        else {
            delete this._meshUnderPointerId[pointerId];
            this._pointerOverMesh = null;
        }
    };
    /**
     * Gets the mesh under the pointer
     * @returns a Mesh or null if no mesh is under the pointer
     */
    InputManager.prototype.getPointerOverMesh = function () {
        return this._pointerOverMesh;
    };
    /**
     * @param mesh - Mesh to invalidate
     * @hidden
     */
    InputManager.prototype._invalidateMesh = function (mesh) {
        if (this._pointerOverMesh === mesh) {
            this._pointerOverMesh = null;
        }
        if (this._pickedDownMesh === mesh) {
            this._pickedDownMesh = null;
        }
        if (this._pickedUpMesh === mesh) {
            this._pickedUpMesh = null;
        }
        for (var pointerId in this._meshUnderPointerId) {
            if (this._meshUnderPointerId[pointerId] === mesh) {
                delete this._meshUnderPointerId[pointerId];
            }
        }
    };
    /** The distance in pixel that you have to move to prevent some events */
    InputManager.DragMovementThreshold = 10; // in pixels
    /** Time in milliseconds to wait to raise long press events if button is still pressed */
    InputManager.LongPressDelay = 500; // in milliseconds
    /** Time in milliseconds with two consecutive clicks will be considered as a double click */
    InputManager.DoubleClickDelay = 300; // in milliseconds
    /** If you need to check double click without raising a single click at first click, enable this flag */
    InputManager.ExclusiveDoubleClickMode = false;
    return InputManager;
}());
export { InputManager };
//# sourceMappingURL=scene.inputManager.js.map