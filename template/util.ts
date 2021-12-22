//

import {
  LightTransformer
} from "@zenml/zenml";
import type {
  AvendiaDocument
} from "../generator/dom";
import type {
  AvendiaTransformerEnvironments,
  AvendiaTransformerVariables
} from "../generator/transformer";
import TRANSLATIONS from "~/template/translations.json";


export function createNamePrefix(transformer: LightTransformer<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>, element: Element, type: "theorem"): string {
  if (type === "theorem") {
    let theoremType = element.getAttribute("type");
    let prefix = TRANSLATIONS.math[theoremType]?.[transformer.variables.language] ?? "";
    return prefix;
  } else {
    return "";
  }
}

export function setNumber(transformer: LightTransformer<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>, element: Element, type: "theorem", id: string): void {
  transformer.variables.number[type] ++;
  transformer.variables.numbers[type].set(id, transformer.variables.number[type]);
  transformer.variables.namePrefixes[type].set(id, createNamePrefix(transformer, element, type));
}

export function getNumber(transformer: LightTransformer<AvendiaDocument, AvendiaTransformerEnvironments, AvendiaTransformerVariables>, element: Element, type: "theorem", id: string): string {
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
  if (numberPrefix !== null) {
    string = numberPrefix + "." + string;
  }
  if (namePrefix !== null) {
    string = namePrefix + " " + string;
  }
  return string;
}