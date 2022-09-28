// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "spriteMapVertexShader";
var shader = "precision highp float;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nvarying vec3 vPosition;\nvarying vec2 vUV;\nvarying vec2 tUV;\nvarying vec2 stageUnits;\nvarying vec2 levelUnits;\nvarying vec2 tileID;\nuniform float time;\nuniform mat4 worldViewProjection;\nuniform vec2 outputSize;\nuniform vec2 stageSize;\nuniform vec2 spriteMapSize;\nuniform float stageScale;\nvoid main() {\nvec4 p=vec4( position,1. );\nvPosition=p.xyz;\nvUV=uv;\ntUV=uv*stageSize; \ngl_Position=worldViewProjection*p;\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var spriteMapVertexShader = { name: name, shader: shader };
//# sourceMappingURL=spriteMap.vertex.js.map