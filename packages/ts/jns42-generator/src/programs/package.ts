import * as path from "node:path";
import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as schemaDraft04 from "../documents/draft-04/index.js";
import * as schema202012 from "../documents/draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/intermediate/index.js";
import { generatePackage } from "../generators/index.js";
import { Namer, loadTypeArena } from "../utils/index.js";

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
            schemaIntermediate.metaSchemaId,
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
        .option("default-name", {
          description: "default name for types",
          type: "string",
          default: "schema-document",
        })
        .option("namer-maximum-iterations", {
          description: "maximum number of iterations for finding unique names",
          type: "number",
          default: 5,
        })
        .option("any-of-hack", {
          description: "quick-fix to make any of work with many types",
          type: "boolean",
          default: false,
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
  defaultName: string;
  namerMaximumIterations: number;
  anyOfHack: boolean;
}

async function main(options: MainOptions) {
  const { anyOfHack } = options;
  let instanceSchemaUrl: URL;
  if (/^\w+\:\/\//.test(options.instanceSchemaUrl)) {
    instanceSchemaUrl = new URL(options.instanceSchemaUrl);
  } else {
    instanceSchemaUrl = new URL("file://" + path.resolve(process.cwd(), options.instanceSchemaUrl));
  }

  const defaultMetaSchemaId = options.defaultMetaSchemaUrl;
  const packageDirectoryPath = path.resolve(options.packageDirectory);
  const { packageName, packageVersion, namerMaximumIterations, defaultName } = options;

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
    schemaIntermediate.metaSchemaId,
    ({ givenUrl, documentNode: rootNode }) => new schemaIntermediate.Document(givenUrl, rootNode),
  );

  await context.loadFromUrl(instanceSchemaUrl, instanceSchemaUrl, null, defaultMetaSchemaId);

  const intermediateData = context.getIntermediateData();

  const typeArena = loadTypeArena(intermediateData);

  const namer = new Namer(defaultName, namerMaximumIterations);
  for (const nodeId in intermediateData.schemas) {
    const nodeUrl = new URL(nodeId);
    const path = nodeUrl.pathname + nodeUrl.hash.replace(/^#/g, "");
    namer.registerPath(nodeId, path);
  }

  const namesData = namer.getNames();

  generatePackage(intermediateData, namesData, {
    packageDirectoryPath,
    packageName,
    packageVersion,
    anyOfHack,
  });
}
