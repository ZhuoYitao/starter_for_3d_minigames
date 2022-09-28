// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockReflectance0";
var shader = "float reflectance=max(max(reflectivityOut.surfaceReflectivityColor.r,reflectivityOut.surfaceReflectivityColor.g),reflectivityOut.surfaceReflectivityColor.b);\nvec3 specularEnvironmentR0=reflectivityOut.surfaceReflectivityColor.rgb;\n#ifdef METALLICWORKFLOW\nvec3 specularEnvironmentR90=vec3(metallicReflectanceFactors.a);\n#else \nvec3 specularEnvironmentR90=vec3(1.0,1.0,1.0);\n#endif\n#ifdef ALPHAFRESNEL\nfloat reflectance90=fresnelGrazingReflectance(reflectance);\nspecularEnvironmentR90=specularEnvironmentR90*reflectance90;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockReflectance0 = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockReflectance0.js.map