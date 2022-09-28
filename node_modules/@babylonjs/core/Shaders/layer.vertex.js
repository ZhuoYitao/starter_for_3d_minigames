// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "layerVertexShader";
var shader = "attribute vec2 position;\nuniform vec2 scale;\nuniform vec2 offset;\nuniform mat4 textureMatrix;\nvarying vec2 vUV;\nconst vec2 madd=vec2(0.5,0.5);\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nvec2 shiftedPosition=position*scale+offset;\nvUV=vec2(textureMatrix*vec4(shiftedPosition*madd+madd,1.0,0.0));\ngl_Position=vec4(shiftedPosition,0.0,1.0);\n#define CUSTOM_VERTEX_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var layerVertexShader = { name: name, shader: shader };
//# sourceMappingURL=layer.vertex.js.map