//

import {
  DOMImplementation
} from "@zenml/xmldom";
import {
  ZenmlParser
} from "@zenml/zenml";
import chalk from "chalk";
import commandLineArgs from "command-line-args";
import fs from "fs/promises";
import glob from "glob-promise";
import pathUtil from "path";
import managers from "../template";
import {
  AVENDIA_CONFIGS,
  AvendiaLanguage,
  AvendiaOutputLanguage
} from "./configs";
import {
  AvendiaDocument
} from "./dom";
import {
  AvendiaTransformer
} from "./transformer";


export class AvendiaConverter {

  private documentPathSpecs!: PathSpecs<AvendiaLanguage>;
  private parser!: ZenmlParser;
  private transformer!: AvendiaTransformer;
  private count: number;

  public constructor() {
    this.count = 0;
  }

  public async execute(): Promise<void> {
    let options = commandLineArgs([
      {name: "documentPaths", multiple: true, defaultOption: true},
      {name: "upload", alias: "u", type: Boolean},
      {name: "history", alias: "h", type: Boolean},
      {name: "watch", alias: "w", type: Boolean}
    ]);
    this.documentPathSpecs = await this.getDocumentPathSpecs(options.documentPaths ?? []);
    this.parser = this.createParser();
    this.transformer = this.createTransformer();
    if (options.history) {
      throw new Error("history mode unimplemented");
    } else if (options.watch) {
      throw new Error("watch mode unimplemented");
    } else {
      await this.executeNormal();
    }
  }

  public async executeNormal(): Promise<void> {
    let promises = this.documentPathSpecs.map(async ([documentPath, documentLanguage]) => {
      await this.saveNormal(documentPath, documentLanguage);
    });
    await Promise.all(promises);
    this.printLast();
  }

  private async saveNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    let intervals = {convert: 0, upload: 0};
    try {
      intervals.convert = await AvendiaConverter.measure(async () => {
        await this.convertNormal(documentPath, documentLanguage);
      });
      intervals.upload = await AvendiaConverter.measure(async () => {
        await this.uploadNormal(documentPath, documentLanguage);
      });
      this.printNormal(documentPath, documentLanguage, intervals, true);
    } catch (error) {
      this.printNormal(documentPath, documentLanguage, intervals, false);
    }
  }

  private async convertNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    let extension = pathUtil.extname(documentPath).slice(1);
    let outputPathSpecs = this.getOutputPathSpecs(documentPath, documentLanguage);
    let promises = outputPathSpecs.map(async ([outputPath, outputLanguage]) => {
      if (extension === "zml") {
        let initialVariables = {path: documentPath, language: outputLanguage};
        let inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
        let inputDocument = this.parser.tryParse(inputString);
        let outputString = this.transformer.transformFinalize(inputDocument, {initialVariables});
        await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
        await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
      } else {
      }
    });
    await Promise.all(promises);
  }

  private async uploadNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
  }

  private printNormal(documentPath: string, documentLanguage: AvendiaLanguage, intervals: {convert: number, upload: number}, succeed: boolean): void {
    let output = "";
    let count = ++ this.count;
    output += " ";
    output += Math.min(count, 9999).toString().padStart(4);
    output += " : ";
    output += chalk.cyan(Math.min(intervals.convert, 9999).toString().padStart(4));
    output += " + ";
    output += chalk.magenta(Math.min(intervals.upload, 9999).toString().padStart(4));
    output += "  |  ";
    let codeArray = AVENDIA_CONFIGS.getSplitRelativeDocumentPath(documentPath, documentLanguage).map((segment) => {
      let x = segment.replace(/\.\w+$/, "");
      if (x === "index") {
        return "  @";
      } else if (x.match(/^\d+$/)) {
        return parseInt(x, 10).toString().padStart(3);
      } else if (x.match(/^[a-z]+$/)) {
        return segment.substring(0, 3).padStart(3);
      } else {
        return "  ?";
      }
    });
    let codeString = (documentLanguage.substring(0, 2) + " " + codeArray.join(" ")).padEnd(14);
    if (succeed) {
      output += chalk.yellow(codeString);
    } else {
      output += chalk.bgYellow.black(codeString);
    }
    console.log(output);
  }

  private printLast(): void {
    let output = "";
    let count = this.count;
    if (count > 0) {
      output += "-".repeat(39);
      output += "\n";
      output += " ".repeat(27) + count.toString().padStart(5) + " files";
    }
    console.log(output);
  }

  private createParser(): ZenmlParser {
    let implementation = new DOMImplementation();
    let parser = new ZenmlParser(implementation, {specialElementNames: {brace: "x", bracket: "xn", slash: "i"}});
    return parser;
  }

  private createTransformer(): AvendiaTransformer {
    let transformer = new AvendiaTransformer(() => new AvendiaDocument({includeDeclaration: false}));
    for (let manager of managers) {
      transformer.regsiterTemplateManager(manager);
    }
    return transformer;
  }

  private async getDocumentPathSpecs(documentPaths: Array<string>): Promise<PathSpecs<AvendiaLanguage>> {
    let documentPathSpecs = [] as PathSpecs<AvendiaLanguage>;
    if (documentPaths.length >= 1) {
      for (let documentPath of documentPaths) {
        let documentLanguage = AVENDIA_CONFIGS.findDocumentLanguage(documentPath);
        if (documentLanguage !== null) {
          documentPathSpecs.push([documentPath, documentLanguage]);
        }
      }
    } else {
      let promises = AVENDIA_CONFIGS.getDocumentDirPathSpecs().map(async ([documentDirPath, documentLanguage]) => {
        let matches = await glob(documentDirPath + "/**/*");
        for (let match of matches) {
          if (pathUtil.basename(match).match(/^(index|\d+)\.(\w+)$/)) {
            documentPathSpecs.push([match, documentLanguage]);
          }
        }
      });
      await Promise.all(promises);
    }
    return documentPathSpecs;
  }

  private getOutputPathSpecs(documentPath: string, documentLanguage: AvendiaLanguage): PathSpecs<AvendiaOutputLanguage> {
    let outputPathSpecs = [];
    let getOutputPathSpec = function (outputLanguage: AvendiaOutputLanguage): PathSpec<AvendiaOutputLanguage> {
      let outputPath = AVENDIA_CONFIGS.replaceDocumentDirPath(documentPath, documentLanguage, outputLanguage);
      outputPath = outputPath.replace(/\.zml$/, ".html");
      outputPath = outputPath.replace(/\.scss$/, ".css");
      outputPath = outputPath.replace(/\.tsx?$/, ".js");
      return [outputPath, outputLanguage];
    };
    if (documentLanguage === "common") {
      outputPathSpecs.push(getOutputPathSpec("ja"));
      outputPathSpecs.push(getOutputPathSpec("en"));
    } else {
      outputPathSpecs.push(getOutputPathSpec(documentLanguage));
    }
    return outputPathSpecs;
  }

  private static async measure(callback: () => Promise<void>): Promise<number> {
    let before = process.hrtime();
    await callback();
    let [elapsedSeconds, elapsedNanoseconds] = process.hrtime(before);
    let interval = Math.floor(elapsedSeconds * 1000 + elapsedNanoseconds / 1000000);
    return interval;
  }

}


type PathSpec<L> = [string, L];
type PathSpecs<L> = Array<PathSpec<L>>;