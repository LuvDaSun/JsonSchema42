import * as core from "@jns42/core";
import * as path from "node:path";
import * as yargs from "yargs";
import { generatePackage } from "../generators.js";
import * as models from "../models.js";

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
            "https://json-schema.org/draft/2020-12/schema",
            "https://json-schema.org/draft/2019-09/schema",
            "http://json-schema.org/draft-07/schema#",
            "http://json-schema.org/draft-06/schema#",
            "http://json-schema.org/draft-04/schema#",
            "https://spec.openapis.org/oas/3.1/dialect/base",
            "https://spec.openapis.org/oas/3.0/schema/2021-09-28#/definitions/Schema",
            "http://swagger.io/v2/schema.json#/definitions/schema",
          ] as const,
          default: "https://json-schema.org/draft/2020-12/schema",
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

  const contextBuilder = new core.documents.DocumentContextBuilder();
  contextBuilder.registerWellKnownFactories();

  const context = contextBuilder.build();

  context.loadFromLocation(
    instanceSchemaLocation,
    instanceSchemaLocation,
    undefined,
    defaultMetaSchema,
  );

  const specification = models.loadSpecification(context, {
    transformMaximumIterations,
    defaultTypeName,
  });

  generatePackage(specification, {
    packageDirectoryPath,
    packageName,
    packageVersion,
  });
}
