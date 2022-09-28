// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
import "./sceneUboDeclaration.js";
import "./meshUboDeclaration.js";
var name = "defaultUboDeclaration";
var shader = "layout(std140,column_major) uniform;\nuniform Material\n{\nvec4 diffuseLeftColor;\nvec4 diffuseRightColor;\nvec4 opacityParts;\nvec4 reflectionLeftColor;\nvec4 reflectionRightColor;\nvec4 refractionLeftColor;\nvec4 refractionRightColor;\nvec4 emissiveLeftColor;\nvec4 emissiveRightColor;\nvec2 vDiffuseInfos;\nvec2 vAmbientInfos;\nvec2 vOpacityInfos;\nvec2 vReflectionInfos;\nvec3 vReflectionPosition;\nvec3 vReflectionSize;\nvec2 vEmissiveInfos;\nvec2 vLightmapInfos;\nvec2 vSpecularInfos;\nvec3 vBumpInfos;\nmat4 diffuseMatrix;\nmat4 ambientMatrix;\nmat4 opacityMatrix;\nmat4 reflectionMatrix;\nmat4 emissiveMatrix;\nmat4 lightmapMatrix;\nmat4 specularMatrix;\nmat4 bumpMatrix;\nvec2 vTangentSpaceParams;\nfloat pointSize;\nfloat alphaCutOff;\nmat4 refractionMatrix;\nvec4 vRefractionInfos;\nvec3 vRefractionPosition;\nvec3 vRefractionSize;\nvec4 vSpecularColor;\nvec3 vEmissiveColor;\nvec4 vDiffuseColor;\nvec3 vAmbientColor;\n#define ADDITIONAL_UBO_DECLARATION\n};\n#include<sceneUboDeclaration>\n#include<meshUboDeclaration>\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var defaultUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=defaultUboDeclaration.js.map