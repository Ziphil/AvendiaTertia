//

import {
  DOMImplementation
} from "@zenml/xmldom";
import {
  ZenmlParser,
  measureAsync
} from "@zenml/zenml";
import chalk from "chalk";
import chokidar from "chokidar";
import commandLineArgs from "command-line-args";
import cssTreeUtil from "css-tree";
import dayjs from "dayjs";
import fs from "fs/promises";
import glob from "glob-promise";
import pathUtil from "path";
import sass from "sass";
import {
  SourceSpan as SassSourceSpan
} from "sass";
import webpack from "webpack";
import pluginManagers from "../plugin";
import templateManagers from "../template";
import WEBPACK_CONFIGS from "../webpack-document";
import {
  CustomFtpClient
} from "./client";
import {
  AvendiaConfigs,
  AvendiaLanguage,
  AvendiaOutputLanguage
} from "./configs";
import {
  AvendiaDocument
} from "./dom";
import executeReferenceService from "./service/reference";
import {
  AvendiaTransformer
} from "./transformer";


export class AvendiaGenerator {

  private parser!: ZenmlParser;
  private transformer!: AvendiaTransformer;
  private client?: CustomFtpClient;
  private configs: AvendiaConfigs;
  private options!: any;
  private count: number;

  public constructor(configs: AvendiaConfigs) {
    this.configs = configs;
    this.count = 0;
  }

  public async execute(): Promise<void> {
    const options = commandLineArgs([
      {name: "documentPaths", multiple: true, defaultOption: true},
      {name: "upload", alias: "u", type: Boolean},
      {name: "history", alias: "h", type: Boolean},
      {name: "watch", alias: "w", type: Boolean},
      {name: "service", alias: "s"}
    ]);
    this.options = options;
    this.parser = this.createParser();
    this.transformer = this.createTransformer();
    if (options.upload) {
      this.client = await this.createClient();
    }
    if (options.history) {
      await this.executeHistory();
    } else if (options.watch) {
      await this.executeWatch();
    } else if (options.service) {
      await this.executeService();
    } else {
      await this.executeNormal();
    }
    if (this.client) {
      this.client.close();
    }
  }

  private async executeNormal(): Promise<void> {
    const documentPathSpecs = await this.getDocumentPathSpecs(this.options.documentPaths ?? []);
    const promises = documentPathSpecs.map(async ([documentPath, documentLanguage]) => {
      await this.saveNormal(documentPath, documentLanguage);
    });
    await Promise.all(promises);
    this.printLast();
  }

  private async executeWatch(): Promise<void> {
    const promises = this.configs.getDocumentDirPathSpecs().map(([documentDirPath, documentLanguage]) => {
      const promise = new Promise((resolve, reject) => {
        const watcher = chokidar.watch(documentDirPath, {persistent: true, ignoreInitial: true});
        watcher.on("add", (documentPath) => {
          if (this.checkValidDocumentPath(documentPath)) {
            this.saveNormal(documentPath, documentLanguage);
          }
        });
        watcher.on("change", (documentPath) => {
          if (this.checkValidDocumentPath(documentPath)) {
            this.saveNormal(documentPath, documentLanguage);
          }
        });
        watcher.on("error", (error) => {
          reject(error);
        });
      });
      return promise;
    });
    await Promise.all(promises);
    this.printLast();
  }

  private async executeHistory(): Promise<void> {
    const documentPathSpecs = await this.getDocumentPathSpecs(this.options.documentPaths ?? []);
    const promises = documentPathSpecs.map(async ([documentPath, documentLanguage]) => {
      await this.saveHistory(documentPath, documentLanguage);
    });
    await Promise.all(promises);
    this.printLast();
  }

  private async executeService(): Promise<void> {
    const name = this.options.service;
    const args = {parser: this.parser, transformer: this.transformer, configs: this.configs};
    if (name === "reference") {
      await executeReferenceService("ja", args);
    }
  }

  private async saveNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    const intervals = {convert: 0, upload: 0};
    try {
      intervals.convert = await measureAsync(async () => {
        await this.transformNormal(documentPath, documentLanguage);
      });
      if (this.options.upload) {
        intervals.upload = await measureAsync(async () => {
          await this.uploadNormal(documentPath, documentLanguage);
        });
      }
      this.printNormal(documentPath, documentLanguage, intervals, true);
    } catch (error) {
      this.printNormal(documentPath, documentLanguage, intervals, false);
      await this.logError(documentPath, documentLanguage, error);
    }
  }

  private async saveHistory(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    const intervals = {convert: 0, upload: 0};
    try {
      intervals.convert = await measureAsync(async () => {
        await this.transformHistory(documentPath, documentLanguage);
      });
    } catch (error) {
      await this.logError(documentPath, documentLanguage, error);
    }
  }

  private async transformNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    const extension = pathUtil.extname(documentPath).slice(1);
    const outputPathSpecs = this.getOutputPathSpecs(documentPath, documentLanguage);
    const promises = outputPathSpecs.map(async ([outputPath, outputLanguage]) => {
      if (extension === "zml") {
        await this.transformNormalZml(documentPath, outputPath, documentLanguage, outputLanguage);
      } else if (extension === "scss") {
        await this.transformNormalScss(documentPath, outputPath, documentLanguage, outputLanguage);
      } else if (extension === "ts") {
        await this.transformNormalTs(documentPath, outputPath, documentLanguage, outputLanguage);
      }
    });
    await Promise.all(promises);
  }

  private async transformHistory(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    const extension = pathUtil.extname(documentPath).slice(1);
    if (documentLanguage !== "common") {
      const outputPath = this.configs.getHistoryIndexPath(documentLanguage);
      if (extension === "zml") {
        await this.transformHistoryZml(documentPath, outputPath, documentLanguage, documentLanguage);
      } else {
        throw new Error("unknown extension");
      }
    }
  }

  private async transformNormalZml(documentPath: string, outputPath: string, documentLanguage: AvendiaLanguage, outputLanguage: AvendiaOutputLanguage): Promise<void> {
    const initialVariables = {path: documentPath, language: outputLanguage};
    const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
    const inputDocument = this.parser.tryParse(inputString);
    const outputString = this.transformer.transformStringify(inputDocument, {initialVariables});
    await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
    await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
  }

  private async transformHistoryZml(documentPath: string, outputPath: string, documentLanguage: AvendiaLanguage, outputLanguage: AvendiaOutputLanguage): Promise<void> {
    const initialScope = "history";
    const initialVariables = {path: documentPath, language: outputLanguage};
    const inputString = await fs.readFile(documentPath, {encoding: "utf-8"});
    const inputDocument = this.parser.tryParse(inputString);
    const date = dayjs().subtract(6, "hour");
    const dateString = (outputLanguage === "ja") ? date.format("YYYY/MM/DD") : date.format("DD/MMM/YYYY");
    const outputString = this.transformer.transform(inputDocument, {initialScope, initialVariables}).toString().trim() + "\n";
    const finalOutputString = dateString + "; " + outputString;
    await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
    await fs.appendFile(outputPath, finalOutputString, {encoding: "utf-8"});
  }

  private async transformNormalScss(documentPath: string, outputPath: string, documentLanguage: AvendiaLanguage, outputLanguage: AvendiaOutputLanguage): Promise<void> {
    const logMessage = function (message: string, options: {span?: SassSourceSpan}): void {
      Function.prototype();
    };
    const options = {
      file: documentPath,
      logger: {debug: logMessage, warn: logMessage}
    };
    const cssString = sass.renderSync(options).css.toString("utf-8");
    const cssTree = cssTreeUtil.parse(cssString);
    cssTreeUtil.walk(cssTree, (node) => {
      if (node.type === "Dimension") {
        if (node.unit === "rpx") {
          node.value = (parseFloat(node.value) / 16).toString();
          node.unit = "rem";
        }
      }
    });
    const outputString = cssTreeUtil.generate(cssTree);
    await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
    await fs.writeFile(outputPath, outputString, {encoding: "utf-8"});
  }

  private async transformNormalTs(documentPath: string, outputPath: string, documentLanguage: AvendiaLanguage, outputLanguage: AvendiaOutputLanguage): Promise<void> {
    const configs = {
      ...WEBPACK_CONFIGS,
      entry: {[pathUtil.basename(outputPath, ".js")]: "./" + documentPath},
      output: {path: pathUtil.dirname(outputPath), filename: "[name].js"},
      cache: {
        type: "filesystem",
        cacheDirectory: pathUtil.join(pathUtil.dirname(outputPath), ".webpack_cache")
      }
    } as const;
    const promise = new Promise<void>((resolve, reject) => {
      webpack(configs, (error, stats) => {
        if (error) {
          reject(error);
        } else if (stats?.hasErrors()) {
          const error = new Error(stats.toString());
          reject(error);
        } else {
          resolve();
        }
      });
    });
    await fs.mkdir(pathUtil.dirname(outputPath), {recursive: true});
    await promise;
  }

  private async uploadNormal(documentPath: string, documentLanguage: AvendiaLanguage): Promise<void> {
    const remotePathSpecs = this.getRemotePathSpecs(documentPath, documentLanguage);
    const promises = remotePathSpecs.map(async ([outputPath, remotePath]) => {
      await this.client!.uploadFrom(outputPath, remotePath);
    });
    await Promise.all(promises);
  }

  private printNormal(documentPath: string, documentLanguage: AvendiaLanguage, intervals: {convert: number, upload: number}, succeed: boolean): void {
    let output = "";
    const count = ++ this.count;
    output += " ";
    output += Math.min(count, 9999).toString().padStart(4);
    output += " : ";
    output += chalk.cyan(Math.min(intervals.convert, 9999).toString().padStart(4));
    output += " + ";
    output += chalk.magenta(Math.min(intervals.upload, 9999).toString().padStart(4));
    output += "  |  ";
    const codeArray = this.configs.getSplitRelativeDocumentPath(documentPath, documentLanguage).map((segment) => {
      const x = segment.replace(/\.\w+$/, "");
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
    const codeString = (documentLanguage.substring(0, 2) + " " + codeArray.join(" ")).padEnd(14);
    if (succeed) {
      output += chalk.yellow(codeString);
    } else {
      output += chalk.bgYellow.black(codeString);
    }
    console.log(output);
  }

  private printLast(): void {
    let output = "";
    const count = this.count;
    if (count > 0) {
      output += "-".repeat(39);
      output += "\n";
      output += " ".repeat(27) + count.toString().padStart(5) + " files";
    }
    console.log(output);
  }

  private async logError(documentPath: string, documentLanguage: AvendiaLanguage, error: unknown): Promise<void> {
    let output = "";
    const logPath = this.configs.getErrorLogPath();
    output += `[${documentPath}]` + "\n";
    if (error instanceof Error) {
      output += error.message.trim() + "\n";
      output += (error.stack ?? "").trim() + "\n";
    } else {
      output += ("" + error).trim() + "\n";
    }
    output += "\n";
    await fs.appendFile(logPath, output, {encoding: "utf-8"});
  }

  private createParser(): ZenmlParser {
    const options = {specialElementNames: {brace: "x", bracket: "xn", slash: "i"}};
    const parser = new ZenmlParser(new DOMImplementation(), options);
    for (const manager of pluginManagers) {
      parser.registerPluginManager(manager);
    }
    return parser;
  }

  private createTransformer(): AvendiaTransformer {
    const initialEnvironments = {configs: this.configs};
    const options = {initialEnvironments};
    const transformer = new AvendiaTransformer(() => new AvendiaDocument({includeDeclaration: false, html: true}), options);
    for (const manager of templateManagers) {
      transformer.regsiterTemplateManager(manager);
    }
    return transformer;
  }

  private async createClient(): Promise<CustomFtpClient> {
    const client = new CustomFtpClient();
    await client.access({
      host: this.configs.getServerHost(),
      user: this.configs.getServerUser(),
      password: this.configs.getServerPassword()
    });
    return client;
  }

  private async getDocumentPathSpecs(documentPaths: Array<string>): Promise<PathSpecs<AvendiaLanguage>> {
    const documentPathSpecs = [] as PathSpecs<AvendiaLanguage>;
    if (documentPaths.length >= 1) {
      for (const documentPath of documentPaths) {
        const documentLanguage = this.configs.findDocumentLanguage(documentPath);
        if (documentLanguage !== null && this.checkValidDocumentPath(documentPath)) {
          documentPathSpecs.push([documentPath, documentLanguage]);
        }
      }
    } else {
      const promises = this.configs.getDocumentDirPathSpecs().map(async ([documentDirPath, documentLanguage]) => {
        const documentPaths = await glob(documentDirPath + "/**/*");
        for (const documentPath of documentPaths) {
          if (this.checkValidDocumentPath(documentPath)) {
            documentPathSpecs.push([documentPath, documentLanguage]);
          }
        }
      });
      await Promise.all(promises);
    }
    return documentPathSpecs;
  }

  private getOutputPathSpecs(documentPath: string, documentLanguage: AvendiaLanguage): PathSpecs<AvendiaOutputLanguage> {
    const outputPathSpecs = [];
    const outerThis = this;
    const getOutputPathSpec = function (outputLanguage: AvendiaOutputLanguage): PathSpec<AvendiaOutputLanguage> {
      let outputPath = outerThis.configs.replaceDocumentDirPath(documentPath, documentLanguage, outputLanguage);
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

  private getRemotePathSpecs(documentPath: string, documentLanguage: AvendiaLanguage): Array<[string, string]> {
    const outputPathSpecs = this.getOutputPathSpecs(documentPath, documentLanguage);
    const remotePathSpecs = outputPathSpecs.map(([outputPath, outputLanguage]) => {
      const remotePath = this.configs.replaceOutputDirPath(outputPath, outputLanguage);
      return [outputPath, remotePath] as any;
    });
    return remotePathSpecs;
  }

  private checkValidDocumentPath(documentPath: string): boolean {
    return pathUtil.basename(documentPath).match(/^(index|\d+)\.(\w+)$/) !== null;
  }

}


type PathSpec<L> = [string, L];
type PathSpecs<L> = Array<PathSpec<L>>;