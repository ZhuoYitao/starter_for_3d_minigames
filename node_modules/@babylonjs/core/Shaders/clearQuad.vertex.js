// Do not edit.
import { ShaderStore } from "../Engines/shaderStore.js";
var name = "clearQuadVertexShader";
var shader = "uniform float depthValue;\nconst vec2 pos[4]={\nvec2(-1.0,1.0),\nvec2(1.0,1.0),\nvec2(-1.0,-1.0),\nvec2(1.0,-1.0)\n};\n#define CUSTOM_VERTEX_DEFINITIONS\nvoid main(void) {\n#define CUSTOM_VERTEX_MAIN_BEGIN\ngl_Position=vec4(pos[gl_VertexID],depthValue,1.0);\n#define CUSTOM_VERTEX_MAIN_END\n}\n";
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export var clearQuadVertexShader = { name: name, shader: shader };
//# sourceMappingURL=clearQuad.vertex.js.map