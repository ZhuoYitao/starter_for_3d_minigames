// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "instancesVertex";
var shader = "#ifdef INSTANCES\nvar finalWorld=mat4x4<f32>(world0,world1,world2,world3);\n#if defined(PREPASS_VELOCITY) || defined(VELOCITY)\nvar finalPreviousWorld=mat4x4<f32>(previousWorld0,previousWorld1,previousWorld2,previousWorld3);\n#endif\n#ifdef THIN_INSTANCES\n#if !defined(WORLD_UBO)\nfinalWorld=uniforms.world*finalWorld;\n#else\nfinalWorld=mesh.world*finalWorld;\n#endif\n#if defined(PREPASS_VELOCITY) || defined(VELOCITY)\nfinalPreviousWorld=previousWorld*finalPreviousWorld;\n#endif\n#endif\n#else\n#if !defined(WORLD_UBO)\nvar finalWorld=uniforms.world;\n#else\nvar finalWorld=mesh.world;\n#endif\n#if defined(PREPASS_VELOCITY) || defined(VELOCITY)\nvar finalPreviousWorld=previousWorld;\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export var instancesVertex = { name: name, shader: shader };
//# sourceMappingURL=instancesVertex.js.map