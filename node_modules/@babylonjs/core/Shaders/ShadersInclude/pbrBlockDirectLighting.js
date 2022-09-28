// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pbrBlockDirectLighting";
var shader = "vec3 diffuseBase=vec3(0.,0.,0.);\n#ifdef SPECULARTERM\nvec3 specularBase=vec3(0.,0.,0.);\n#endif\n#ifdef CLEARCOAT\nvec3 clearCoatBase=vec3(0.,0.,0.);\n#endif\n#ifdef SHEEN\nvec3 sheenBase=vec3(0.,0.,0.);\n#endif\npreLightingInfo preInfo;\nlightingInfo info;\nfloat shadow=1.; \n#if defined(CLEARCOAT) && defined(CLEARCOAT_TINT)\nvec3 absorption=vec3(0.);\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrBlockDirectLighting = { name: name, shader: shader };
//# sourceMappingURL=pbrBlockDirectLighting.js.map