import * as path from "node:path";
import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as schemaDraft04 from "../documents/draft-04/index.js";
import * as schema202012 from "../documents/draft-2020-12/index.js";
import * as schemaIntermediateB from "../documents/intermediate-b/index.js";

export function configureIntermediateProgram(argv: yargs.Argv) {
  return argv.command(
    "intermediate [instance-schema-url]",
    "create intermediate model from instance-schema-url",
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
        }),
    (argv) => main(argv as MainOptions),
  );
}

interface MainOptions {
  instanceSchemaUrl: string;
  defaultMetaSchemaUrl: string;
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

  await new Promise<void>((resolve, reject) =>
    process.stdout.write(JSON.stringify(intermediateData), (error) =>
      error == null ? resolve() : reject(error),
    ),
  );
}
