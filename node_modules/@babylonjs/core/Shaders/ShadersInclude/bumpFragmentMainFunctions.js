// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "bumpFragmentMainFunctions";
var shader = "#if defined(BUMP) || defined(CLEARCOAT_BUMP) || defined(ANISOTROPIC) || defined(DETAIL)\n#if defined(TANGENT) && defined(NORMAL) \nvarying mat3 vTBN;\n#endif\n#ifdef OBJECTSPACE_NORMALMAP\nuniform mat4 normalMatrix;\n#endif\nvec3 perturbNormalBase(mat3 cotangentFrame,vec3 normal,float scale)\n{\n#ifdef NORMALXYSCALE\nnormal=normalize(normal*vec3(scale,scale,1.0));\n#endif\nreturn normalize(cotangentFrame*normal);\n}\nvec3 perturbNormal(mat3 cotangentFrame,vec3 textureSample,float scale)\n{\nreturn perturbNormalBase(cotangentFrame,textureSample*2.0-1.0,scale);\n}\nmat3 cotangent_frame(vec3 normal,vec3 p,vec2 uv,vec2 tangentSpaceParams)\n{\nvec3 dp1=dFdx(p);\nvec3 dp2=dFdy(p);\nvec2 duv1=dFdx(uv);\nvec2 duv2=dFdy(uv);\nvec3 dp2perp=cross(dp2,normal);\nvec3 dp1perp=cross(normal,dp1);\nvec3 tangent=dp2perp*duv1.x+dp1perp*duv2.x;\nvec3 bitangent=dp2perp*duv1.y+dp1perp*duv2.y;\ntangent*=tangentSpaceParams.x;\nbitangent*=tangentSpaceParams.y;\nfloat invmax=inversesqrt(max(dot(tangent,tangent),dot(bitangent,bitangent)));\nreturn mat3(tangent*invmax,bitangent*invmax,normal);\n}\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var bumpFragmentMainFunctions = { name: name, shader: shader };
//# sourceMappingURL=bumpFragmentMainFunctions.js.map