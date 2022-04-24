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
  let getNumberSpec = function (): [string, string | null, string | null] {
    if (transformer.variables.numbers[type].has(id)) {
      let number = transformer.variables.numbers[type].get(id)!.toString();
      let namePrefix = transformer.variables.namePrefixes[type].get(id) ?? null;
      let numberPrefix = transformer.variables.numberPrefix ?? null;
      return [number, namePrefix, numberPrefix];
    } else {
      let targetElement = element.ownerDocument!.searchXpath(`//*[@id='${id}']`)[0];
      if (typeof targetElement === "object" && targetElement.isElement()) {
        if (type === "theorem") {
          let number = (targetElement.searchXpath("preceding::thm").length + 1).toString();
          let namePrefix = createNamePrefix(transformer, targetElement, type);
          let numberPrefix = transformer.variables.numberPrefix ?? null;
          return [number, namePrefix, numberPrefix];
        } else if (type === "equation") {
          let number = (targetElement.searchXpath("preceding::math-block[@id]").length + 1).toString();
          let namePrefix = createNamePrefix(transformer, targetElement, type);
          let numberPrefix = transformer.variables.numberPrefix ?? null;
          return [number, namePrefix, numberPrefix];
        } else if (type === "bibliography") {
          let number = (targetElement.searchXpath("preceding-sibling::li").length + 1).toString();
          return [number, null, null];
        } else {
          return ["?", null, null];
        }
      } else {
        return ["?", null, null];
      }
    }
  };
  let [number, namePrefix, numberPrefix] = getNumberSpec();
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
    let theoremType = element.getAttribute("type");
    let prefix = TRANSLATIONS.math[theoremType]?.[transformer.variables.language] ?? null;
    return prefix;
  } else if (type === "equation") {
    let prefix = TRANSLATIONS.math.equation[transformer.variables.language] ?? null;
    return prefix;
  } else {
    return null;
  }
}

export function getReferenceIndex(transformer: AvendiaLightTransformer): ReferenceIndex {
  let language = transformer.variables.language;
  let index = transformer.environments.referenceIndexes.get(language);
  if (index === undefined) {
    let indexPath = transformer.environments.configs.getReferenceIndexPath(language);
    let index = JSON.parse(fs.readFileSync(indexPath, {encoding: "utf-8"}));
    transformer.environments.referenceIndexes.set(language, index);
    return index;
  } else {
    return index;
  }
}

export type NumberRefType = "theorem" | "equation" | "bibliography";