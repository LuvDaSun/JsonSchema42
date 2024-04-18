import * as core from "@jns42/core";
import * as path from "node:path";
import * as yargs from "yargs";
import * as oasV30 from "../documents/oas-v3-0/index.js";
import * as schemaDraft04 from "../documents/schema-draft-04/index.js";
import * as schemaDraft202012 from "../documents/schema-draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/schema-intermediate/index.js";
import * as schemaOasV31 from "../documents/schema-oas-v3-1/index.js";
import * as swaggerV2 from "../documents/swagger-v2/index.js";
import { generatePackage } from "../generators/index.js";
import * as models from "../models/index.js";

export function configurePackageProgram(argv: yargs.Argv) {
  return argv.command(
    "package [instance-schema-location]",
    "create package from instance-schema-location",
    (yargs) =>
      yargs
        .positional("instance-schema-location", {
          description: "location to download schema from",
          type: "string",
          demandOption: true,
        })
        .option("default-meta-schema", {
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
        .option("transform-maximum-iterations", {
          description: "maximum number of iterations for transforming",
          type: "number",
          default: 100,
        }),
    (argv) => main(argv),
  );
}

interface MainConfiguration {
  instanceSchemaLocation: string;
  defaultMetaSchema: string;
  packageDirectory: string;
  packageName: string;
  packageVersion: string;
  defaultTypeName: string;
  transformMaximumIterations: number;
}

async function main(configuration: MainConfiguration) {
  const { instanceSchemaLocation, defaultMetaSchema } = configuration;
  const packageDirectoryPath = path.resolve(configuration.packageDirectory);
  const { packageName, packageVersion, transformMaximumIterations, defaultTypeName } =
    configuration;

  const context = core.DocumentContext.new();
  context.registerWellKnownFactories();

  await context.loadFromLocation(
    instanceSchemaLocation,
    instanceSchemaLocation,
    undefined,
    defaultMetaSchema as core.MetaSchemaString,
  );

  using specification = models.loadSpecification(context, {
    transformMaximumIterations,
    defaultTypeName,
  });

  generatePackage(specification, {
    packageDirectoryPath,
    packageName,
    packageVersion,
  });
}
