import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as schemaDraft04 from "../documents/schema-draft-04/index.js";
import * as schema202012 from "../documents/schema-draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/schema-intermediate/index.js";
import { NodeLocation } from "../utils/index.js";

export function configureIntermediateProgram(argv: yargs.Argv) {
  return argv.command(
    "intermediate [instance-schema-url]",
    "create intermediate model from instance-schema-url",
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
        }),
    (argv) => main(argv),
  );
}

interface MainConfiguration {
  instanceSchemaUrl: string;
  defaultMetaSchemaUrl: string;
}

async function main(configuration: MainConfiguration) {
  const instanceSchemaUrl = NodeLocation.parse(configuration.instanceSchemaUrl);

  const defaultMetaSchemaId = configuration.defaultMetaSchemaUrl;

  const context = new DocumentContext();
  context.registerFactory(
    schema202012.metaSchemaId,
    ({ retrievalUrl, givenUrl, antecedentUrl, documentNode: rootNode }) =>
      new schema202012.Document(retrievalUrl, givenUrl, antecedentUrl, rootNode, context),
  );
  context.registerFactory(
    schemaDraft04.metaSchemaId,
    ({ retrievalUrl, givenUrl, antecedentUrl, documentNode: rootNode }) =>
      new schemaDraft04.Document(retrievalUrl, givenUrl, antecedentUrl, rootNode, context),
  );
  context.registerFactory(
    schemaIntermediate.metaSchemaId,
    ({ givenUrl, documentNode: rootNode }) => new schemaIntermediate.Document(givenUrl, rootNode),
  );

  await context.loadFromUrl(instanceSchemaUrl, instanceSchemaUrl, null, defaultMetaSchemaId);

  const intermediateData = context.getIntermediateData();

  await new Promise<void>((resolve, reject) =>
    process.stdout.write(JSON.stringify(intermediateData), (error) =>
      error == null ? resolve() : reject(error),
    ),
  );
}
