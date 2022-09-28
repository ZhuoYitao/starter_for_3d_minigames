// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "importanceSampling";
var shader = "vec3 hemisphereCosSample(vec2 u) {\nfloat phi=2.*PI*u.x;\nfloat cosTheta2=1.-u.y;\nfloat cosTheta=sqrt(cosTheta2);\nfloat sinTheta=sqrt(1.-cosTheta2);\nreturn vec3(sinTheta*cos(phi),sinTheta*sin(phi),cosTheta);\n}\nvec3 hemisphereImportanceSampleDggx(vec2 u,float a) {\nfloat phi=2.*PI*u.x;\nfloat cosTheta2=(1.-u.y)/(1.+(a+1.)*((a-1.)*u.y));\nfloat cosTheta=sqrt(cosTheta2);\nfloat sinTheta=sqrt(1.-cosTheta2);\nreturn vec3(sinTheta*cos(phi),sinTheta*sin(phi),cosTheta);\n}\nvec3 hemisphereImportanceSampleDCharlie(vec2 u,float a) { \nfloat phi=2.*PI*u.x;\nfloat sinTheta=pow(u.y,a/(2.*a+1.));\nfloat cosTheta=sqrt(1.-sinTheta*sinTheta);\nreturn vec3(sinTheta*cos(phi),sinTheta*sin(phi),cosTheta);\n}";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var importanceSampling = { name: name, shader: shader };
//# sourceMappingURL=importanceSampling.js.map