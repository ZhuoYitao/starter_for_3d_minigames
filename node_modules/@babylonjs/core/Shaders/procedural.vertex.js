// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "proceduralVertexShader";
var shader = "attribute vec2 position;\nvarying vec2 vPosition;\nvarying vec2 vUV;\nconst vec2 madd=vec2(0.5,0.5);\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\nvPosition=position;\nvUV=position*madd+madd;\ngl_Position=vec4(position,0.0,1.0);\n#define CUSTOM_VERTEX_MAIN_END\n}";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var proceduralVertexShader = { name: name, shader: shader };
//# sourceMappingURL=procedural.vertex.js.map