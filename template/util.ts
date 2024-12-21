//

import fs from "fs";
import type {
  ReferenceIndex
} from "../generator/service/reference";
import type {
  AvendiaLightTransformer
} from "../generator/transformer";
import TRANSLATIONS from "~/template/translations.json";


export function setNumber(transformer: AvendiaLightTransformer, element: Element, type: NumberRefType, id: string): void {
  transformer.variables.number[type] ++;
  transformer.variables.numbers[type].set(id, transformer.variables.number[type]);
  transformer.variables.namePrefixes[type].set(id, createNamePrefix(transformer, element, type));
}

export function getNumber(transformer: AvendiaLightTransformer, element: Element, type: NumberRefType, clever: boolean, id: string): string {
  const getNumberSpec = function (): [string, string | null, string | null] {
    if (transformer.variables.numbers[type].has(id)) {
      const number = transformer.variables.numbers[type].get(id)!.toString();
      const namePrefix = transformer.variables.namePrefixes[type].get(id) ?? null;
      const numberPrefix = transformer.variables.numberPrefix ?? null;
      return [number, namePrefix, numberPrefix];
    } else {
      const targetElement = element.ownerDocument!.searchXpath(`//*[@id='${id}']`)[0];
      if (typeof targetElement === "object" && targetElement.isElement()) {
        if (type === "theorem") {
          const number = (targetElement.searchXpath("preceding::thm").length + 1).toString();
          const namePrefix = createNamePrefix(transformer, targetElement, type);
          const numberPrefix = transformer.variables.numberPrefix ?? null;
          return [number, namePrefix, numberPrefix];
        } else if (type === "equation") {
          const number = (targetElement.searchXpath("preceding::math-block[@id]").length + 1).toString();
          const namePrefix = createNamePrefix(transformer, targetElement, type);
          const numberPrefix = transformer.variables.numberPrefix ?? null;
          return [number, namePrefix, numberPrefix];
        } else if (type === "bibliography") {
          const number = (targetElement.searchXpath("preceding-sibling::li").length + 1).toString();
          return [number, null, null];
        } else {
          return ["?", null, null];
        }
      } else {
        return ["?", null, null];
      }
    }
  };
  const [number, namePrefix, numberPrefix] = getNumberSpec();
  let string = number;
  if (type === "theorem" && numberPrefix !== null) {
    string = numberPrefix + "." + string;
  }
  if (clever && namePrefix !== null) {
    string = namePrefix + " " + string;
  }
  return string;
}

function createNamePrefix(transformer: AvendiaLightTransformer, element: Element, type: NumberRefType): string | null {
  if (type === "theorem") {
    const theoremType = element.getAttribute("type");
    const prefix = TRANSLATIONS.math[theoremType]?.[transformer.variables.language] ?? null;
    return prefix;
  } else if (type === "equation") {
    const prefix = TRANSLATIONS.math.equation[transformer.variables.language] ?? null;
    return prefix;
  } else {
    return null;
  }
}

export function getReferenceIndex(transformer: AvendiaLightTransformer): ReferenceIndex {
  const path = transformer.variables.path;
  const language = transformer.variables.language;
  const splitRelativePath = transformer.environments.configs.getSplitRelativeDocumentPath(path, language);
  const rootDir = splitRelativePath.slice(0, 2).join("/");
  const indexes = transformer.environments.referenceIndexes.get(language);
  if (indexes === undefined) {
    const indexPath = transformer.environments.configs.getReferenceIndexPath(language);
    const indexes = JSON.parse(fs.readFileSync(indexPath, {encoding: "utf-8"}));
    transformer.environments.referenceIndexes.set(language, indexes);
    return indexes[rootDir];
  } else {
    return indexes[rootDir];
  }
}

export type NumberRefType = "theorem" | "equation" | "bibliography";