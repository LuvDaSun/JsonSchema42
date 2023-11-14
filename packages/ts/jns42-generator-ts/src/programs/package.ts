import * as path from "node:path";
import ts from "typescript";
import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as schemaDraft04 from "../documents/draft-04/index.js";
import * as schema202012 from "../documents/draft-2020-12/index.js";
import * as schemaIntermediateB from "../documents/intermediate-b/index.js";
import { generatePackage } from "../generators/index.js";
import { Namer } from "../utils/index.js";

export function configurePackageProgram(argv: yargs.Argv) {
  return argv.command(
    "package [instance-schema-url]",
    "create package from instance-schema-url",
    (yargs) =>
      yargs
        .positional("instance-schema-url", {
          description: "url to download schema from",
          type: "string",
        })
        .option("default-meta-schema-url", {
          description: "the default meta schema to use",
          type: "string",
          choices: [
            schema202012.metaSchemaId,
            schemaDraft04.metaSchemaId,
            schemaIntermediateB.metaSchemaId,
          ] as const,
          default: schema202012.metaSchemaId,
        })
        .option("package-directory", {
          description: "where to output the package",
          type: "string",
        })
        .option("package-name", {
          description: "name of the package",
          type: "string",
        })
        .option("package-version", {
          description: "version of the package",
          type: "string",
        })
        .option("root-name-part", {
          description: "root name of the schema",
          type: "string",
          default: "schema",
        }),
    (argv) => main(argv as MainOptions),
  );
}

interface MainOptions {
  instanceSchemaUrl: string;
  defaultMetaSchemaUrl: string;
  packageDirectory: string;
  packageName: string;
  packageVersion: string;
  rootNamePart: string;
}

async function main(options: MainOptions) {
  let instanceSchemaUrl: URL;
  if (/^\w+\:\/\//.test(options.instanceSchemaUrl)) {
    instanceSchemaUrl = new URL(options.instanceSchemaUrl);
  } else {
    instanceSchemaUrl = new URL(
      "file://" + path.resolve(process.cwd(), options.instanceSchemaUrl),
    );
  }

  const defaultMetaSchemaId = options.defaultMetaSchemaUrl;
  const packageDirectoryPath = path.resolve(options.packageDirectory);
  const { packageName, packageVersion, rootNamePart } = options;

  const context = new DocumentContext();
  context.registerFactory(
    schema202012.metaSchemaId,
    ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
      new schema202012.Document(givenUrl, antecedentUrl, rootNode, context),
  );
  context.registerFactory(
    schemaDraft04.metaSchemaId,
    ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
      new schemaDraft04.Document(givenUrl, antecedentUrl, rootNode, context),
  );
  context.registerFactory(
    schemaIntermediateB.metaSchemaId,
    ({ givenUrl, documentNode: rootNode }) =>
      new schemaIntermediateB.Document(givenUrl, rootNode),
  );

  await context.loadFromUrl(
    instanceSchemaUrl,
    instanceSchemaUrl,
    null,
    defaultMetaSchemaId,
  );

  const intermediateData = context.getIntermediateData();

  const namer = new Namer(rootNamePart);
  for (const nodeId in intermediateData.schemas) {
    const nodeUrl = new URL(nodeId);
    const path = nodeUrl.pathname + nodeUrl.hash.replace(/^#/g, "");
    namer.registerPath(nodeId, path);
  }

  const namesData = namer.getNames();

  const factory = ts.factory;
  generatePackage(factory, intermediateData, namesData, {
    directoryPath: packageDirectoryPath,
    name: packageName,
    version: packageVersion,
  });
}
