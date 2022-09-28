// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "meshUboDeclaration";
var shader = "#ifdef WEBGL2\nuniform mat4 world;\nuniform float visibility;\n#else\nlayout(std140,column_major) uniform;\nuniform Mesh\n{\nmat4 world;\nfloat visibility;\n};\n#endif\n#define WORLD_UBO\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var meshUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=meshUboDeclaration.js.map