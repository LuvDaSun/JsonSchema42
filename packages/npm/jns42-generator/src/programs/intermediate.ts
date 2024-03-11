import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as schemaDraft04 from "../documents/schema-draft-04/index.js";
import * as schema202012 from "../documents/schema-draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/schema-intermediate/index.js";
import { NodeLocation } from "../utils/index.js";

export function configureIntermediateProgram(argv: yargs.Argv) {
  return argv.command(
    "intermediate [instance-schema-location]",
    "create intermediate model from instance-schema-location",
    (yargs) =>
      yargs
        .positional("instance-schema-location", {
          description: "url to download schema from",
          type: "string",
          demandOption: true,
        })
        .option("default-meta-schema-location", {
          description: "the default meta schema to use",
          type: "string",
          choices: [
            schema202012.metaSchemaId,
            schemaDraft04.metaSchemaId,
            schemaIntermediate.metaSchemaId,
          ] as const,
          default: schema202012.metaSchemaId,
        }),
    (argv) => main(argv),
  );
}

interface MainConfiguration {
  instanceSchemaLocation: string;
  defaultMetaSchemaLocation: string;
}

async function main(configuration: MainConfiguration) {
  const instanceSchemaLocation = NodeLocation.parse(configuration.instanceSchemaLocation);

  const defaultMetaSchemaId = configuration.defaultMetaSchemaLocation;

  const context = new DocumentContext();
  context.registerFactory(
    schema202012.metaSchemaId,
    ({
      retrievalLocation: retrievalLocation,
      givenLocation: givenLocation,
      antecedentLocation: antecedentLocation,
      documentNode: documentNode,
    }) =>
      new schema202012.Document(
        retrievalLocation,
        givenLocation,
        antecedentLocation,
        documentNode,
        context,
      ),
  );
  context.registerFactory(
    schemaDraft04.metaSchemaId,
    ({
      retrievalLocation: retrievalLocation,
      givenLocation: givenLocation,
      antecedentLocation: antecedentLocation,
      documentNode: documentNode,
    }) =>
      new schemaDraft04.Document(
        retrievalLocation,
        givenLocation,
        antecedentLocation,
        documentNode,
        context,
      ),
  );
  context.registerFactory(
    schemaIntermediate.metaSchemaId,
    ({ givenLocation: givenLocation, documentNode: documentNode }) =>
      new schemaIntermediate.Document(givenLocation, documentNode),
  );

  await context.loadFromLocation(
    instanceSchemaLocation,
    instanceSchemaLocation,
    null,
    defaultMetaSchemaId,
  );

  const intermediateData = context.getIntermediateData();

  await new Promise<void>((resolve, reject) =>
    process.stdout.write(JSON.stringify(intermediateData), (error) =>
      error == null ? resolve() : reject(error),
    ),
  );
}
