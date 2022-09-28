import { PhysicsImpostor } from "../../Physics/physicsImpostor.js";
import { PhysicsJoint } from "../../Physics/physicsJoint.js";
import { PhysicsEngine } from "../../Physics/physicsEngine.js";
import { Vector3, Quaternion } from "../../Maths/math.vector.js";
import { Logger } from "../../Misc/logger.js";
import { PhysicsRaycastResult } from "../physicsRaycastResult.js";
/** @hidden */
var OimoJSPlugin = /** @class */ (function () {
    function OimoJSPlugin(_useDeltaForWorldStep, iterations, oimoInjection) {
        if (_useDeltaForWorldStep === void 0) { _useDeltaForWorldStep = true; }
        if (oimoInjection === void 0) { oimoInjection = OIMO; }
        this._useDeltaForWorldStep = _useDeltaForWorldStep;
        this.name = "OimoJSPlugin";
        this._fixedTimeStep = 1 / 60;
        this._tmpImpostorsArray = [];
        this._tmpPositionVector = Vector3.Zero();
        this.BJSOIMO = oimoInjection;
        this.world = new this.BJSOIMO.World({
            iterations: iterations,
        });
        this.world.clear();
        this._raycastResult = new PhysicsRaycastResult();
    }
    OimoJSPlugin.prototype.setGravity = function (gravity) {
        this.world.gravity.set(gravity.x, gravity.y, gravity.z);
    };
    OimoJSPlugin.prototype.setTimeStep = function (timeStep) {
        this.world.timeStep = timeStep;
    };
    OimoJSPlugin.prototype.getTimeStep = function () {
        return this.world.timeStep;
    };
    OimoJSPlugin.prototype.executeStep = function (delta, impostors) {
        var _this = this;
        impostors.forEach(function (impostor) {
            impostor.beforeStep();
        });
        this.world.timeStep = this._useDeltaForWorldStep ? delta : this._fixedTimeStep;
        this.world.step();
        impostors.forEach(function (impostor) {
            impostor.afterStep();
            //update the ordered impostors array
            _this._tmpImpostorsArray[impostor.uniqueId] = impostor;
        });
        //check for collisions
        var contact = this.world.contacts;
        while (contact !== null) {
            if (contact.touching && !contact.body1.sleeping && !contact.body2.sleeping) {
                contact = contact.next;
                continue;
            }
            //is this body colliding with any other? get the impostor
            var mainImpostor = this._tmpImpostorsArray[+contact.body1.name];
            var collidingImpostor = this._tmpImpostorsArray[+contact.body2.name];
            if (!mainImpostor || !collidingImpostor) {
                contact = contact.next;
                continue;
            }
            mainImpostor.onCollide({ body: collidingImpostor.physicsBody, point: null });
            collidingImpostor.onCollide({ body: mainImpostor.physicsBody, point: null });
            contact = contact.next;
        }
    };
    OimoJSPlugin.prototype.applyImpulse = function (impostor, force, contactPoint) {
        var mass = impostor.physicsBody.mass;
        impostor.physicsBody.applyImpulse(contactPoint.scale(this.world.invScale), force.scale(this.world.invScale * mass));
    };
    OimoJSPlugin.prototype.applyForce = function (impostor, force, contactPoint) {
        Logger.Warn("Oimo doesn't support applying force. Using impule instead.");
        this.applyImpulse(impostor, force, contactPoint);
    };
    OimoJSPlugin.prototype.generatePhysicsBody = function (impostor) {
        var _this = this;
        //parent-child relationship. Does this impostor has a parent impostor?
        if (impostor.parent) {
            if (impostor.physicsBody) {
                this.removePhysicsBody(impostor);
                //TODO is that needed?
                impostor.forceUpdate();
            }
            return;
        }
        if (impostor.isBodyInitRequired()) {
            var bodyConfig_1 = {
                name: impostor.uniqueId,
                //Oimo must have mass, also for static objects.
                config: [impostor.getParam("mass") || 0.001, impostor.getParam("friction"), impostor.getParam("restitution")],
                size: [],
                type: [],
                pos: [],
                posShape: [],
                rot: [],
                rotShape: [],
                move: impostor.getParam("mass") !== 0,
                density: impostor.getParam("mass"),
                friction: impostor.getParam("friction"),
                restitution: impostor.getParam("restitution"),
                //Supporting older versions of Oimo
                world: this.world,
            };
            var impostors_1 = [impostor];
            var addToArray = function (parent) {
                if (!parent.getChildMeshes) {
                    return;
                }
                parent.getChildMeshes().forEach(function (m) {
                    if (m.physicsImpostor) {
                        impostors_1.push(m.physicsImpostor);
                        //m.physicsImpostor._init();
                    }
                });
            };
            addToArray(impostor.object);
            var checkWithEpsilon_1 = function (value) {
                return Math.max(value, PhysicsEngine.Epsilon);
            };
            var globalQuaternion_1 = new Quaternion();
            impostors_1.forEach(function (i) {
                if (!i.object.rotationQuaternion) {
                    return;
                }
                //get the correct bounding box
                var oldQuaternion = i.object.rotationQuaternion;
                globalQuaternion_1.copyFrom(oldQuaternion);
                i.object.rotationQuaternion.set(0, 0, 0, 1);
                i.object.computeWorldMatrix(true);
                var rot = globalQuaternion_1.toEulerAngles();
                var extendSize = i.getObjectExtendSize();
                // eslint-disable-next-line no-loss-of-precision
                var radToDeg = 57.295779513082320876;
                if (i === impostor) {
                    var center = impostor.getObjectCenter();
                    impostor.object.getAbsolutePivotPoint().subtractToRef(center, _this._tmpPositionVector);
                    _this._tmpPositionVector.divideInPlace(impostor.object.scaling);
                    //Can also use Array.prototype.push.apply
                    bodyConfig_1.pos.push(center.x);
                    bodyConfig_1.pos.push(center.y);
                    bodyConfig_1.pos.push(center.z);
                    bodyConfig_1.posShape.push(0, 0, 0);
                    bodyConfig_1.rotShape.push(0, 0, 0);
                }
                else {
                    var localPosition = i.object.position.clone();
                    bodyConfig_1.posShape.push(localPosition.x);
                    bodyConfig_1.posShape.push(localPosition.y);
                    bodyConfig_1.posShape.push(localPosition.z);
                    // bodyConfig.pos.push(0, 0, 0);
                    bodyConfig_1.rotShape.push(rot.x * radToDeg, rot.y * radToDeg, rot.z * radToDeg);
                }
                i.object.rotationQuaternion.copyFrom(globalQuaternion_1);
                // register mesh
                switch (i.type) {
                    case PhysicsImpostor.ParticleImpostor:
                        Logger.Warn("No Particle support in OIMO.js. using SphereImpostor instead");
                    // eslint-disable-next-line no-fallthrough
                    case PhysicsImpostor.SphereImpostor: {
                        var radiusX = extendSize.x;
                        var radiusY = extendSize.y;
                        var radiusZ = extendSize.z;
                        var size = Math.max(checkWithEpsilon_1(radiusX), checkWithEpsilon_1(radiusY), checkWithEpsilon_1(radiusZ)) / 2;
                        bodyConfig_1.type.push("sphere");
                        //due to the way oimo works with compounds, add 3 times
                        bodyConfig_1.size.push(size);
                        bodyConfig_1.size.push(size);
                        bodyConfig_1.size.push(size);
                        break;
                    }
                    case PhysicsImpostor.CylinderImpostor: {
                        var sizeX = checkWithEpsilon_1(extendSize.x) / 2;
                        var sizeY = checkWithEpsilon_1(extendSize.y);
                        bodyConfig_1.type.push("cylinder");
                        bodyConfig_1.size.push(sizeX);
                        bodyConfig_1.size.push(sizeY);
                        //due to the way oimo works with compounds, add one more value.
                        bodyConfig_1.size.push(sizeY);
                        break;
                    }
                    case PhysicsImpostor.PlaneImpostor:
                    case PhysicsImpostor.BoxImpostor:
                    default: {
                        var sizeX = checkWithEpsilon_1(extendSize.x);
                        var sizeY = checkWithEpsilon_1(extendSize.y);
                        var sizeZ = checkWithEpsilon_1(extendSize.z);
                        bodyConfig_1.type.push("box");
                        //if (i === impostor) {
                        bodyConfig_1.size.push(sizeX);
                        bodyConfig_1.size.push(sizeY);
                        bodyConfig_1.size.push(sizeZ);
                        //} else {
                        //    bodyConfig.size.push(0,0,0);
                        //}
                        break;
                    }
                }
                //actually not needed, but hey...
                i.object.rotationQuaternion = oldQuaternion;
            });
            impostor.physicsBody = this.world.add(bodyConfig_1);
            // set the quaternion, ignoring the previously defined (euler) rotation
            impostor.physicsBody.resetQuaternion(globalQuaternion_1);
            // update with delta 0, so the body will receive the new rotation.
            impostor.physicsBody.updatePosition(0);
        }
        else {
            this._tmpPositionVector.copyFromFloats(0, 0, 0);
        }
        impostor.setDeltaPosition(this._tmpPositionVector);
        //this._tmpPositionVector.addInPlace(impostor.mesh.getBoundingInfo().boundingBox.center);
        //this.setPhysicsBodyTransformation(impostor, this._tmpPositionVector, impostor.mesh.rotationQuaternion);
    };
    OimoJSPlugin.prototype.removePhysicsBody = function (impostor) {
        //impostor.physicsBody.dispose();
        //Same as : (older oimo versions)
        this.world.removeRigidBody(impostor.physicsBody);
    };
    OimoJSPlugin.prototype.generateJoint = function (impostorJoint) {
        var mainBody = impostorJoint.mainImpostor.physicsBody;
        var connectedBody = impostorJoint.connectedImpostor.physicsBody;
        if (!mainBody || !connectedBody) {
            return;
        }
        var jointData = impostorJoint.joint.jointData;
        var options = jointData.nativeParams || {};
        var type;
        var nativeJointData = {
            body1: mainBody,
            body2: connectedBody,
            axe1: options.axe1 || (jointData.mainAxis ? jointData.mainAxis.asArray() : null),
            axe2: options.axe2 || (jointData.connectedAxis ? jointData.connectedAxis.asArray() : null),
            pos1: options.pos1 || (jointData.mainPivot ? jointData.mainPivot.asArray() : null),
            pos2: options.pos2 || (jointData.connectedPivot ? jointData.connectedPivot.asArray() : null),
            min: options.min,
            max: options.max,
            collision: options.collision || jointData.collision,
            spring: options.spring,
            //supporting older version of Oimo
            world: this.world,
        };
        switch (impostorJoint.joint.type) {
            case PhysicsJoint.BallAndSocketJoint:
                type = "jointBall";
                break;
            case PhysicsJoint.SpringJoint: {
                Logger.Warn("OIMO.js doesn't support Spring Constraint. Simulating using DistanceJoint instead");
                var springData = jointData;
                nativeJointData.min = springData.length || nativeJointData.min;
                //Max should also be set, just make sure it is at least min
                nativeJointData.max = Math.max(nativeJointData.min, nativeJointData.max);
            }
            // eslint-disable-next-line no-fallthrough
            case PhysicsJoint.DistanceJoint:
                type = "jointDistance";
                nativeJointData.max = jointData.maxDistance;
                break;
            case PhysicsJoint.PrismaticJoint:
                type = "jointPrisme";
                break;
            case PhysicsJoint.SliderJoint:
                type = "jointSlide";
                break;
            case PhysicsJoint.WheelJoint:
                type = "jointWheel";
                break;
            case PhysicsJoint.HingeJoint:
            default:
                type = "jointHinge";
                break;
        }
        nativeJointData.type = type;
        impostorJoint.joint.physicsJoint = this.world.add(nativeJointData);
    };
    OimoJSPlugin.prototype.removeJoint = function (impostorJoint) {
        //Bug in Oimo prevents us from disposing a joint in the playground
        //joint.joint.physicsJoint.dispose();
        //So we will bruteforce it!
        try {
            this.world.removeJoint(impostorJoint.joint.physicsJoint);
        }
        catch (e) {
            Logger.Warn(e);
        }
    };
    OimoJSPlugin.prototype.isSupported = function () {
        return this.BJSOIMO !== undefined;
    };
    OimoJSPlugin.prototype.setTransformationFromPhysicsBody = function (impostor) {
        if (!impostor.physicsBody.sleeping) {
            if (impostor.physicsBody.shapes.next) {
                var parent_1 = impostor.physicsBody.shapes;
                while (parent_1.next) {
                    parent_1 = parent_1.next;
                }
                impostor.object.position.set(parent_1.position.x, parent_1.position.y, parent_1.position.z);
            }
            else {
                var pos = impostor.physicsBody.getPosition();
                impostor.object.position.set(pos.x, pos.y, pos.z);
            }
            //}
            if (impostor.object.rotationQuaternion) {
                var quat = impostor.physicsBody.getQuaternion();
                impostor.object.rotationQuaternion.set(quat.x, quat.y, quat.z, quat.w);
            }
        }
    };
    OimoJSPlugin.prototype.setPhysicsBodyTransformation = function (impostor, newPosition, newRotation) {
        var body = impostor.physicsBody;
        // disable bidirectional for compound meshes
        if (impostor.physicsBody.shapes.next) {
            return;
        }
        body.position.set(newPosition.x, newPosition.y, newPosition.z);
        body.orientation.set(newRotation.x, newRotation.y, newRotation.z, newRotation.w);
        body.syncShapes();
        body.awake();
    };
    /*private _getLastShape(body: any): any {
        var lastShape = body.shapes;
        while (lastShape.next) {
            lastShape = lastShape.next;
        }
        return lastShape;
    }*/
    OimoJSPlugin.prototype.setLinearVelocity = function (impostor, velocity) {
        impostor.physicsBody.linearVelocity.set(velocity.x, velocity.y, velocity.z);
    };
    OimoJSPlugin.prototype.setAngularVelocity = function (impostor, velocity) {
        impostor.physicsBody.angularVelocity.set(velocity.x, velocity.y, velocity.z);
    };
    OimoJSPlugin.prototype.getLinearVelocity = function (impostor) {
        var v = impostor.physicsBody.linearVelocity;
        if (!v) {
            return null;
        }
        return new Vector3(v.x, v.y, v.z);
    };
    OimoJSPlugin.prototype.getAngularVelocity = function (impostor) {
        var v = impostor.physicsBody.angularVelocity;
        if (!v) {
            return null;
        }
        return new Vector3(v.x, v.y, v.z);
    };
    OimoJSPlugin.prototype.setBodyMass = function (impostor, mass) {
        var staticBody = mass === 0;
        //this will actually set the body's density and not its mass.
        //But this is how oimo treats the mass variable.
        impostor.physicsBody.shapes.density = staticBody ? 1 : mass;
        impostor.physicsBody.setupMass(staticBody ? 0x2 : 0x1);
    };
    OimoJSPlugin.prototype.getBodyMass = function (impostor) {
        return impostor.physicsBody.shapes.density;
    };
    OimoJSPlugin.prototype.getBodyFriction = function (impostor) {
        return impostor.physicsBody.shapes.friction;
    };
    OimoJSPlugin.prototype.setBodyFriction = function (impostor, friction) {
        impostor.physicsBody.shapes.friction = friction;
    };
    OimoJSPlugin.prototype.getBodyRestitution = function (impostor) {
        return impostor.physicsBody.shapes.restitution;
    };
    OimoJSPlugin.prototype.setBodyRestitution = function (impostor, restitution) {
        impostor.physicsBody.shapes.restitution = restitution;
    };
    OimoJSPlugin.prototype.sleepBody = function (impostor) {
        impostor.physicsBody.sleep();
    };
    OimoJSPlugin.prototype.wakeUpBody = function (impostor) {
        impostor.physicsBody.awake();
    };
    OimoJSPlugin.prototype.updateDistanceJoint = function (joint, maxDistance, minDistance) {
        joint.physicsJoint.limitMotor.upperLimit = maxDistance;
        if (minDistance !== void 0) {
            joint.physicsJoint.limitMotor.lowerLimit = minDistance;
        }
    };
    OimoJSPlugin.prototype.setMotor = function (joint, speed, force, motorIndex) {
        if (force !== undefined) {
            Logger.Warn("OimoJS plugin currently has unexpected behavior when using setMotor with force parameter");
        }
        else {
            force = 1e6;
        }
        speed *= -1;
        //TODO separate rotational and transational motors.
        var motor = motorIndex
            ? joint.physicsJoint.rotationalLimitMotor2
            : joint.physicsJoint.rotationalLimitMotor1 || joint.physicsJoint.rotationalLimitMotor || joint.physicsJoint.limitMotor;
        if (motor) {
            motor.setMotor(speed, force);
        }
    };
    OimoJSPlugin.prototype.setLimit = function (joint, upperLimit, lowerLimit, motorIndex) {
        //TODO separate rotational and transational motors.
        var motor = motorIndex
            ? joint.physicsJoint.rotationalLimitMotor2
            : joint.physicsJoint.rotationalLimitMotor1 || joint.physicsJoint.rotationalLimitMotor || joint.physicsJoint.limitMotor;
        if (motor) {
            motor.setLimit(upperLimit, lowerLimit === void 0 ? -upperLimit : lowerLimit);
        }
    };
    OimoJSPlugin.prototype.syncMeshWithImpostor = function (mesh, impostor) {
        var body = impostor.physicsBody;
        mesh.position.x = body.position.x;
        mesh.position.y = body.position.y;
        mesh.position.z = body.position.z;
        if (mesh.rotationQuaternion) {
            mesh.rotationQuaternion.x = body.orientation.x;
            mesh.rotationQuaternion.y = body.orientation.y;
            mesh.rotationQuaternion.z = body.orientation.z;
            mesh.rotationQuaternion.w = body.orientation.w;
        }
    };
    OimoJSPlugin.prototype.getRadius = function (impostor) {
        return impostor.physicsBody.shapes.radius;
    };
    OimoJSPlugin.prototype.getBoxSizeToRef = function (impostor, result) {
        var shape = impostor.physicsBody.shapes;
        result.x = shape.halfWidth * 2;
        result.y = shape.halfHeight * 2;
        result.z = shape.halfDepth * 2;
    };
    OimoJSPlugin.prototype.dispose = function () {
        this.world.clear();
    };
    /**
     * Does a raycast in the physics world
     * @param from when should the ray start?
     * @param to when should the ray end?
     * @returns PhysicsRaycastResult
     */
    OimoJSPlugin.prototype.raycast = function (from, to) {
        Logger.Warn("raycast is not currently supported by the Oimo physics plugin");
        this._raycastResult.reset(from, to);
        return this._raycastResult;
    };
    return OimoJSPlugin;
}());
export { OimoJSPlugin };
//# sourceMappingURL=oimoJSPlugin.js.map