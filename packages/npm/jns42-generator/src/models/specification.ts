import * as core from "@jns42/core";

export interface Specification {
  typesArena: core.models.SchemaArena;
  validatorsArena: core.models.SchemaArena;
  names: core.naming.Names;
}

export interface LoadSpecificationConfiguration {
  transformMaximumIterations: number;
  defaultTypeName: string;
}

export function loadSpecification(
  documentContext: core.documents.DocumentContext,
  configuration: LoadSpecificationConfiguration,
): Specification {
  const { transformMaximumIterations, defaultTypeName } = configuration;

  // load the arena

  const typesArena = core.models.SchemaArena.fromDocumentContext(documentContext);
  const validatorsArena = typesArena.clone();

  // generate root keys

  const explicitLocations = new Set(documentContext.getExplicitLocations());
  const explicitTypeKeys = [];
  for (let key = 0; key < typesArena.count(); key++) {
    const item = typesArena.getItem(key);
    if (item.location == null) {
      continue;
    }
    if (!explicitLocations.has(item.location)) {
      continue;
    }

    explicitTypeKeys.push(key);
  }

  // transform the validatorsArena
  {
    const transformers = [] as core.models.SchemaTransform[];
    let transformIterations = 0;
    while (validatorsArena.transform(transformers) > 0) {
      transformIterations++;
      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  // transform the typesArena
  {
    const transformers: core.models.SchemaTransform[] = [
      "explode",
      "single-type",
      "resolve-single-all-of",
      "resolve-single-any-of",
      "resolve-single-one-of",
      "flatten-all-of",
      "flatten-any-of",
      "flatten-one-of",
      "flip-all-of-one-of",
      "flip-any-of-one-of",
      "inherit-all-of",
      "inherit-any-of",
      "inherit-one-of",
      "inherit-reference",
      "resolve-all-of",
      "resolve-any-of",
      "resolve-not",
      "resolve-if-then-else",
      "resolve-single-all-of",
      "resolve-single-any-of",
      "resolve-single-one-of",
      "unalias",
    ];
    let transformIterations = 0;
    while (typesArena.transform(transformers) > 0) {
      transformIterations++;

      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  // generate names

  {
    const transformers: core.models.SchemaTransform[] = ["name"];
    let transformIterations = 0;
    while (typesArena.transform(transformers) > 0) {
      transformIterations++;

      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  const primaryTypeKeys = new Set(
    explicitTypeKeys.flatMap((key) => [...typesArena.getAllRelated(key)]),
  );

  const namesBuilder = new core.naming.NamesBuilder();
  namesBuilder.setDefaultName(defaultTypeName);

  for (const key of primaryTypeKeys) {
    const item = typesArena.getItem(key);

    if (item.name == null) {
      continue;
    }

    const filteredParts = item.name.filter((part) => /^[a-zA-Z]/.test(part));
    namesBuilder.add(key, filteredParts);
  }

  const names = namesBuilder.build();

  return {
    typesArena,
    validatorsArena,
    names,
  };
}
