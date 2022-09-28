// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "fxaaVertexShader";
var shader = "attribute vec2 position;\nuniform vec2 texelSize;\nvarying vec2 vUV;\nvarying vec2 sampleCoordS;\nvarying vec2 sampleCoordE;\nvarying vec2 sampleCoordN;\nvarying vec2 sampleCoordW;\nvarying vec2 sampleCoordNW;\nvarying vec2 sampleCoordSE;\nvarying vec2 sampleCoordNE;\nvarying vec2 sampleCoordSW;\nconst vec2 madd=vec2(0.5,0.5);\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nvUV=(position*madd+madd);\nsampleCoordS=vUV+vec2( 0.0,1.0)*texelSize;\nsampleCoordE=vUV+vec2( 1.0,0.0)*texelSize;\nsampleCoordN=vUV+vec2( 0.0,-1.0)*texelSize;\nsampleCoordW=vUV+vec2(-1.0,0.0)*texelSize;\nsampleCoordNW=vUV+vec2(-1.0,-1.0)*texelSize;\nsampleCoordSE=vUV+vec2( 1.0,1.0)*texelSize;\nsampleCoordNE=vUV+vec2( 1.0,-1.0)*texelSize;\nsampleCoordSW=vUV+vec2(-1.0,1.0)*texelSize;\ngl_Position=vec4(position,0.0,1.0);\n#define CUSTOM_VERTEX_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var fxaaVertexShader = { name: name, shader: shader };
//# sourceMappingURL=fxaa.vertex.js.map