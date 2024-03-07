import * as path from "node:path";
import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as oasV30 from "../documents/oas-v3-0/index.js";
import * as schemaDraft04 from "../documents/schema-draft-04/index.js";
import * as schemaDraft202012 from "../documents/schema-draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/schema-intermediate/index.js";
import * as schemaOasV31 from "../documents/schema-oas-v3-1/index.js";
import * as swaggerV2 from "../documents/swagger-v2/index.js";
import { generatePackage } from "../generators/index.js";
import * as models from "../models/index.js";
import { NodeLocation } from "../utils/index.js";

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
            schemaDraft202012.metaSchemaId,
            schemaDraft04.metaSchemaId,
            schemaOasV31.metaSchemaId,
            oasV30.metaSchemaId,
            swaggerV2.metaSchemaId,
            schemaIntermediate.metaSchemaId,
          ] as const,
          default: schemaDraft202012.metaSchemaId,
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
          default: 100,
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
}

async function main(configuration: MainConfiguration) {
  const instanceSchemaUrl = NodeLocation.parse(configuration.instanceSchemaUrl);
  const defaultMetaSchemaId = configuration.defaultMetaSchemaUrl;
  const packageDirectoryPath = path.resolve(configuration.packageDirectory);
  const {
    packageName,
    packageVersion,
    nameMaximumIterations,
    transformMaximumIterations,
    defaultTypeName,
  } = configuration;

  const context = new DocumentContext();
  context.registerFactory(
    schemaDraft202012.metaSchemaId,
    ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
      new schemaDraft202012.Document(givenUrl, antecedentUrl, rootNode, context),
  );
  context.registerFactory(
    schemaDraft04.metaSchemaId,
    ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
      new schemaDraft04.Document(givenUrl, antecedentUrl, rootNode, context),
  );
  context.registerFactory(
    schemaOasV31.metaSchemaId,
    ({ givenUrl, documentNode: rootNode }) => new schemaIntermediate.Document(givenUrl, rootNode),
  );
  context.registerFactory(
    oasV30.metaSchemaId,
    ({ givenUrl, documentNode: rootNode }) => new schemaIntermediate.Document(givenUrl, rootNode),
  );
  context.registerFactory(
    swaggerV2.metaSchemaId,
    ({ givenUrl, documentNode: rootNode }) => new schemaIntermediate.Document(givenUrl, rootNode),
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
  });
}
