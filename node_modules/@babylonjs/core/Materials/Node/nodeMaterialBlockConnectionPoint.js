import { NodeMaterialBlockConnectionPointTypes } from "./Enums/nodeMaterialBlockConnectionPointTypes.js";
import { NodeMaterialBlockTargets } from "./Enums/nodeMaterialBlockTargets.js";
import { Observable } from "../../Misc/observable.js";
/**
 * Enum used to define the compatibility state between two connection points
 */
export var NodeMaterialConnectionPointCompatibilityStates;
(function (NodeMaterialConnectionPointCompatibilityStates) {
    /** Points are compatibles */
    NodeMaterialConnectionPointCompatibilityStates[NodeMaterialConnectionPointCompatibilityStates["Compatible"] = 0] = "Compatible";
    /** Points are incompatible because of their types */
    NodeMaterialConnectionPointCompatibilityStates[NodeMaterialConnectionPointCompatibilityStates["TypeIncompatible"] = 1] = "TypeIncompatible";
    /** Points are incompatible because of their targets (vertex vs fragment) */
    NodeMaterialConnectionPointCompatibilityStates[NodeMaterialConnectionPointCompatibilityStates["TargetIncompatible"] = 2] = "TargetIncompatible";
    /** Points are incompatible because they are in the same hierarchy **/
    NodeMaterialConnectionPointCompatibilityStates[NodeMaterialConnectionPointCompatibilityStates["HierarchyIssue"] = 3] = "HierarchyIssue";
})(NodeMaterialConnectionPointCompatibilityStates || (NodeMaterialConnectionPointCompatibilityStates = {}));
/**
 * Defines the direction of a connection point
 */
export var NodeMaterialConnectionPointDirection;
(function (NodeMaterialConnectionPointDirection) {
    /** Input */
    NodeMaterialConnectionPointDirection[NodeMaterialConnectionPointDirection["Input"] = 0] = "Input";
    /** Output */
    NodeMaterialConnectionPointDirection[NodeMaterialConnectionPointDirection["Output"] = 1] = "Output";
})(NodeMaterialConnectionPointDirection || (NodeMaterialConnectionPointDirection = {}));
/**
 * Defines a connection point for a block
 */
var NodeMaterialConnectionPoint = /** @class */ (function () {
    /**
     * Creates a new connection point
     * @param name defines the connection point name
     * @param ownerBlock defines the block hosting this connection point
     * @param direction defines the direction of the connection point
     */
    function NodeMaterialConnectionPoint(name, ownerBlock, direction) {
        /** @hidden */
        this._connectedPoint = null;
        this._endpoints = new Array();
        /** @hidden */
        this._typeConnectionSource = null;
        /** @hidden */
        this._defaultConnectionPointType = null;
        /** @hidden */
        this._linkedConnectionSource = null;
        /** @hidden */
        this._acceptedConnectionPointType = null;
        this._type = NodeMaterialBlockConnectionPointTypes.Float;
        /** @hidden */
        this._enforceAssociatedVariableName = false;
        /** Indicates that this connection point needs dual validation before being connected to another point */
        this.needDualDirectionValidation = false;
        /**
         * Gets or sets the additional types supported by this connection point
         */
        this.acceptedConnectionPointTypes = new Array();
        /**
         * Gets or sets the additional types excluded by this connection point
         */
        this.excludedConnectionPointTypes = new Array();
        /**
         * Observable triggered when this point is connected
         */
        this.onConnectionObservable = new Observable();
        /**
         * Gets or sets a boolean indicating that this connection point is exposed on a frame
         */
        this.isExposedOnFrame = false;
        /**
         * Gets or sets number indicating the position that the port is exposed to on a frame
         */
        this.exposedPortPosition = -1;
        /** @hidden */
        this._prioritizeVertex = false;
        this._target = NodeMaterialBlockTargets.VertexAndFragment;
        this._ownerBlock = ownerBlock;
        this.name = name;
        this._direction = direction;
    }
    /**
     * Checks if two types are equivalent
     * @param type1 type 1 to check
     * @param type2 type 2 to check
     * @returns true if both types are equivalent, else false
     */
    NodeMaterialConnectionPoint.AreEquivalentTypes = function (type1, type2) {
        switch (type1) {
            case NodeMaterialBlockConnectionPointTypes.Vector3: {
                if (type2 === NodeMaterialBlockConnectionPointTypes.Color3) {
                    return true;
                }
                break;
            }
            case NodeMaterialBlockConnectionPointTypes.Vector4: {
                if (type2 === NodeMaterialBlockConnectionPointTypes.Color4) {
                    return true;
                }
                break;
            }
            case NodeMaterialBlockConnectionPointTypes.Color3: {
                if (type2 === NodeMaterialBlockConnectionPointTypes.Vector3) {
                    return true;
                }
                break;
            }
            case NodeMaterialBlockConnectionPointTypes.Color4: {
                if (type2 === NodeMaterialBlockConnectionPointTypes.Vector4) {
                    return true;
                }
                break;
            }
        }
        return false;
    };
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "direction", {
        /** Gets the direction of the point */
        get: function () {
            return this._direction;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "associatedVariableName", {
        /**
         * Gets or sets the associated variable name in the shader
         */
        get: function () {
            if (this._ownerBlock.isInput) {
                return this._ownerBlock.associatedVariableName;
            }
            if ((!this._enforceAssociatedVariableName || !this._associatedVariableName) && this._connectedPoint) {
                return this._connectedPoint.associatedVariableName;
            }
            return this._associatedVariableName;
        },
        set: function (value) {
            this._associatedVariableName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "innerType", {
        /** Get the inner type (ie AutoDetect for instance instead of the inferred one) */
        get: function () {
            if (this._linkedConnectionSource && this._linkedConnectionSource.isConnected) {
                return this.type;
            }
            return this._type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "type", {
        /**
         * Gets or sets the connection point type (default is float)
         */
        get: function () {
            if (this._type === NodeMaterialBlockConnectionPointTypes.AutoDetect) {
                if (this._ownerBlock.isInput) {
                    return this._ownerBlock.type;
                }
                if (this._connectedPoint) {
                    return this._connectedPoint.type;
                }
                if (this._linkedConnectionSource && this._linkedConnectionSource.isConnected) {
                    return this._linkedConnectionSource.type;
                }
            }
            if (this._type === NodeMaterialBlockConnectionPointTypes.BasedOnInput) {
                if (this._typeConnectionSource) {
                    if (!this._typeConnectionSource.isConnected && this._defaultConnectionPointType) {
                        return this._defaultConnectionPointType;
                    }
                    return this._typeConnectionSource.type;
                }
                else if (this._defaultConnectionPointType) {
                    return this._defaultConnectionPointType;
                }
            }
            return this._type;
        },
        set: function (value) {
            this._type = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "target", {
        /** Gets or sets the target of that connection point */
        get: function () {
            if (!this._prioritizeVertex || !this._ownerBlock) {
                return this._target;
            }
            if (this._target !== NodeMaterialBlockTargets.VertexAndFragment) {
                return this._target;
            }
            if (this._ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
                return NodeMaterialBlockTargets.Fragment;
            }
            return NodeMaterialBlockTargets.Vertex;
        },
        set: function (value) {
            this._target = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "isConnected", {
        /**
         * Gets a boolean indicating that the current point is connected to another NodeMaterialBlock
         */
        get: function () {
            return this.connectedPoint !== null || this.hasEndpoints;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "isConnectedToInputBlock", {
        /**
         * Gets a boolean indicating that the current point is connected to an input block
         */
        get: function () {
            return this.connectedPoint !== null && this.connectedPoint.ownerBlock.isInput;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "connectInputBlock", {
        /**
         * Gets a the connected input block (if any)
         */
        get: function () {
            if (!this.isConnectedToInputBlock) {
                return null;
            }
            return this.connectedPoint.ownerBlock;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "connectedPoint", {
        /** Get the other side of the connection (if any) */
        get: function () {
            return this._connectedPoint;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "ownerBlock", {
        /** Get the block that owns this connection point */
        get: function () {
            return this._ownerBlock;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "sourceBlock", {
        /** Get the block connected on the other side of this connection (if any) */
        get: function () {
            if (!this._connectedPoint) {
                return null;
            }
            return this._connectedPoint.ownerBlock;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "connectedBlocks", {
        /** Get the block connected on the endpoints of this connection (if any) */
        get: function () {
            if (this._endpoints.length === 0) {
                return [];
            }
            return this._endpoints.map(function (e) { return e.ownerBlock; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "endpoints", {
        /** Gets the list of connected endpoints */
        get: function () {
            return this._endpoints;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "hasEndpoints", {
        /** Gets a boolean indicating if that output point is connected to at least one input */
        get: function () {
            return this._endpoints && this._endpoints.length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "isDirectlyConnectedToVertexOutput", {
        /** Gets a boolean indicating that this connection has a path to the vertex output*/
        get: function () {
            if (!this.hasEndpoints) {
                return false;
            }
            for (var _i = 0, _a = this._endpoints; _i < _a.length; _i++) {
                var endpoint = _a[_i];
                if (endpoint.ownerBlock.target === NodeMaterialBlockTargets.Vertex) {
                    return true;
                }
                if (endpoint.ownerBlock.target === NodeMaterialBlockTargets.Neutral || endpoint.ownerBlock.target === NodeMaterialBlockTargets.VertexAndFragment) {
                    if (endpoint.ownerBlock.outputs.some(function (o) { return o.isDirectlyConnectedToVertexOutput; })) {
                        return true;
                    }
                }
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "isConnectedInVertexShader", {
        /** Gets a boolean indicating that this connection will be used in the vertex shader */
        get: function () {
            if (this.target === NodeMaterialBlockTargets.Vertex) {
                return true;
            }
            if (!this.hasEndpoints) {
                return false;
            }
            for (var _i = 0, _a = this._endpoints; _i < _a.length; _i++) {
                var endpoint = _a[_i];
                if (endpoint.ownerBlock.target === NodeMaterialBlockTargets.Vertex) {
                    return true;
                }
                if (endpoint.target === NodeMaterialBlockTargets.Vertex) {
                    return true;
                }
                if (endpoint.ownerBlock.target === NodeMaterialBlockTargets.Neutral || endpoint.ownerBlock.target === NodeMaterialBlockTargets.VertexAndFragment) {
                    if (endpoint.ownerBlock.outputs.some(function (o) { return o.isConnectedInVertexShader; })) {
                        return true;
                    }
                }
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NodeMaterialConnectionPoint.prototype, "isConnectedInFragmentShader", {
        /** Gets a boolean indicating that this connection will be used in the fragment shader */
        get: function () {
            if (this.target === NodeMaterialBlockTargets.Fragment) {
                return true;
            }
            if (!this.hasEndpoints) {
                return false;
            }
            for (var _i = 0, _a = this._endpoints; _i < _a.length; _i++) {
                var endpoint = _a[_i];
                if (endpoint.ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
                    return true;
                }
                if (endpoint.ownerBlock.target === NodeMaterialBlockTargets.Neutral || endpoint.ownerBlock.target === NodeMaterialBlockTargets.VertexAndFragment) {
                    if (endpoint.ownerBlock.outputs.some(function (o) { return o.isConnectedInFragmentShader; })) {
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
     * Creates a block suitable to be used as an input for this input point.
     * If null is returned, a block based on the point type will be created.
     * @returns The returned string parameter is the name of the output point of NodeMaterialBlock (first parameter of the returned array) that can be connected to the input
     */
    NodeMaterialConnectionPoint.prototype.createCustomInputBlock = function () {
        return null;
    };
    /**
     * Gets the current class name e.g. "NodeMaterialConnectionPoint"
     * @returns the class name
     */
    NodeMaterialConnectionPoint.prototype.getClassName = function () {
        return "NodeMaterialConnectionPoint";
    };
    /**
     * Gets a boolean indicating if the current point can be connected to another point
     * @param connectionPoint defines the other connection point
     * @returns a boolean
     */
    NodeMaterialConnectionPoint.prototype.canConnectTo = function (connectionPoint) {
        return this.checkCompatibilityState(connectionPoint) === NodeMaterialConnectionPointCompatibilityStates.Compatible;
    };
    /**
     * Gets a number indicating if the current point can be connected to another point
     * @param connectionPoint defines the other connection point
     * @returns a number defining the compatibility state
     */
    NodeMaterialConnectionPoint.prototype.checkCompatibilityState = function (connectionPoint) {
        var ownerBlock = this._ownerBlock;
        var otherBlock = connectionPoint.ownerBlock;
        if (ownerBlock.target === NodeMaterialBlockTargets.Fragment) {
            // Let's check we are not going reverse
            if (otherBlock.target === NodeMaterialBlockTargets.Vertex) {
                return NodeMaterialConnectionPointCompatibilityStates.TargetIncompatible;
            }
            for (var _i = 0, _a = otherBlock.outputs; _i < _a.length; _i++) {
                var output = _a[_i];
                if (output.ownerBlock.target != NodeMaterialBlockTargets.Neutral && output.isConnectedInVertexShader) {
                    return NodeMaterialConnectionPointCompatibilityStates.TargetIncompatible;
                }
            }
        }
        if (this.type !== connectionPoint.type && connectionPoint.innerType !== NodeMaterialBlockConnectionPointTypes.AutoDetect) {
            // Equivalents
            if (NodeMaterialConnectionPoint.AreEquivalentTypes(this.type, connectionPoint.type)) {
                return NodeMaterialConnectionPointCompatibilityStates.Compatible;
            }
            // Accepted types
            if ((connectionPoint.acceptedConnectionPointTypes && connectionPoint.acceptedConnectionPointTypes.indexOf(this.type) !== -1) ||
                (connectionPoint._acceptedConnectionPointType && NodeMaterialConnectionPoint.AreEquivalentTypes(connectionPoint._acceptedConnectionPointType.type, this.type))) {
                return NodeMaterialConnectionPointCompatibilityStates.Compatible;
            }
            else {
                return NodeMaterialConnectionPointCompatibilityStates.TypeIncompatible;
            }
        }
        // Excluded
        if (connectionPoint.excludedConnectionPointTypes && connectionPoint.excludedConnectionPointTypes.indexOf(this.type) !== -1) {
            return NodeMaterialConnectionPointCompatibilityStates.TypeIncompatible;
        }
        // Check hierarchy
        var targetBlock = otherBlock;
        var sourceBlock = ownerBlock;
        if (this.direction === NodeMaterialConnectionPointDirection.Input) {
            targetBlock = ownerBlock;
            sourceBlock = otherBlock;
        }
        if (targetBlock.isAnAncestorOf(sourceBlock)) {
            return NodeMaterialConnectionPointCompatibilityStates.HierarchyIssue;
        }
        return NodeMaterialConnectionPointCompatibilityStates.Compatible;
    };
    /**
     * Connect this point to another connection point
     * @param connectionPoint defines the other connection point
     * @param ignoreConstraints defines if the system will ignore connection type constraints (default is false)
     * @returns the current connection point
     */
    NodeMaterialConnectionPoint.prototype.connectTo = function (connectionPoint, ignoreConstraints) {
        if (ignoreConstraints === void 0) { ignoreConstraints = false; }
        if (!ignoreConstraints && !this.canConnectTo(connectionPoint)) {
            throw "Cannot connect these two connectors.";
        }
        this._endpoints.push(connectionPoint);
        connectionPoint._connectedPoint = this;
        this._enforceAssociatedVariableName = false;
        this.onConnectionObservable.notifyObservers(connectionPoint);
        connectionPoint.onConnectionObservable.notifyObservers(this);
        return this;
    };
    /**
     * Disconnect this point from one of his endpoint
     * @param endpoint defines the other connection point
     * @returns the current connection point
     */
    NodeMaterialConnectionPoint.prototype.disconnectFrom = function (endpoint) {
        var index = this._endpoints.indexOf(endpoint);
        if (index === -1) {
            return this;
        }
        this._endpoints.splice(index, 1);
        endpoint._connectedPoint = null;
        this._enforceAssociatedVariableName = false;
        endpoint._enforceAssociatedVariableName = false;
        return this;
    };
    /**
     * Serializes this point in a JSON representation
     * @param isInput defines if the connection point is an input (default is true)
     * @returns the serialized point object
     */
    NodeMaterialConnectionPoint.prototype.serialize = function (isInput) {
        if (isInput === void 0) { isInput = true; }
        var serializationObject = {};
        serializationObject.name = this.name;
        serializationObject.displayName = this.displayName;
        if (isInput && this.connectedPoint) {
            serializationObject.inputName = this.name;
            serializationObject.targetBlockId = this.connectedPoint.ownerBlock.uniqueId;
            serializationObject.targetConnectionName = this.connectedPoint.name;
            serializationObject.isExposedOnFrame = true;
            serializationObject.exposedPortPosition = this.exposedPortPosition;
        }
        if (this.isExposedOnFrame || this.exposedPortPosition >= 0) {
            serializationObject.isExposedOnFrame = true;
            serializationObject.exposedPortPosition = this.exposedPortPosition;
        }
        return serializationObject;
    };
    /**
     * Release resources
     */
    NodeMaterialConnectionPoint.prototype.dispose = function () {
        this.onConnectionObservable.clear();
    };
    return NodeMaterialConnectionPoint;
}());
export { NodeMaterialConnectionPoint };
//# sourceMappingURL=nodeMaterialBlockConnectionPoint.js.map