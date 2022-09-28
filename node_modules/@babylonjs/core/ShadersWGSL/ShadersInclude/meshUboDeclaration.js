// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "meshUboDeclaration";
var shader = "struct Mesh {\nworld : mat4x4<f32>,\nvisibility : f32,\n};\nvar<uniform> mesh : Mesh;\n#define WORLD_UBO\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var meshUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=meshUboDeclaration.js.map