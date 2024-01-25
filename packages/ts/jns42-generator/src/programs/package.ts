import * as path from "node:path";
import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as schemaDraft04 from "../documents/draft-04/index.js";
import * as schema202012 from "../documents/draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/intermediate/index.js";
import { generatePackage } from "../generators/index.js";
import * as models from "../models/index.js";

export function configurePackageProgram(argv: yargs.Argv) {
  return argv.command(
    "package [instance-schema-url]",
    "create package from instance-schema-url",
    (yargs) =>
      yargs
        .positional("instance-schema-url", {
          description: "url to download schema from",
          type: "string",
          demandOption: true,
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
          demandOption: true,
        })
        .option("package-name", {
          description: "name of the package",
          type: "string",
          demandOption: true,
        })
        .option("package-version", {
          description: "version of the package",
          type: "string",
          demandOption: true,
        })
        .option("default-type-name", {
          description: "default name for types",
          type: "string",
          default: "schema-document",
        })
        .option("name-maximum-iterations", {
          description: "maximum number of iterations for finding unique names",
          type: "number",
          default: 5,
        })
        .option("transform-maximum-iterations", {
          description: "maximum number of iterations for transforming",
          type: "number",
          default: 1000,
        })
        .option("union-object-and-map", {
          description:
            "If a type is both a map and an object, add index with a union type of all the properties",
          type: "boolean",
          default: false,
        }),
    (argv) => main(argv),
  );
}

interface MainConfiguration {
  instanceSchemaUrl: string;
  defaultMetaSchemaUrl: string;
  packageDirectory: string;
  packageName: string;
  packageVersion: string;
  defaultTypeName: string;
  nameMaximumIterations: number;
  transformMaximumIterations: number;
  unionObjectAndMap: boolean;
}

async function main(configuration: MainConfiguration) {
  let instanceSchemaUrl: URL;
  if (/^\w+\:\/\//.test(configuration.instanceSchemaUrl)) {
    instanceSchemaUrl = new URL(configuration.instanceSchemaUrl);
  } else {
    instanceSchemaUrl = new URL(
      "file://" + path.resolve(process.cwd(), configuration.instanceSchemaUrl),
    );
  }

  const defaultMetaSchemaId = configuration.defaultMetaSchemaUrl;
  const packageDirectoryPath = path.resolve(configuration.packageDirectory);
  const {
    packageName,
    packageVersion,
    nameMaximumIterations,
    transformMaximumIterations,
    defaultTypeName,
    unionObjectAndMap,
  } = configuration;

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

  const intermediateDocument = context.getIntermediateData();

  const specification = models.loadSpecification(intermediateDocument, {
    transformMaximumIterations,
    nameMaximumIterations,
    defaultTypeName,
  });

  generatePackage(intermediateDocument, specification, {
    packageDirectoryPath,
    packageName,
    packageVersion,
    unionObjectAndMap,
  });
}
