import ts from "typescript";
import { choose } from "../main.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class TypesTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    for (const nodeId in this.nodes) {
      yield this.generateTypeDeclarationStatement(nodeId);
    }
  }

  protected generateTypeDeclarationStatement(nodeId: string) {
    const node = this.nodes[nodeId];

    const typeDefinition = this.generateTypeDefinition(nodeId);

    const typeName = this.getTypeName(nodeId);
    const declaration = this.factory.createTypeAliasDeclaration(
      [this.factory.createToken(ts.SyntaxKind.ExportKeyword)],
      typeName,
      undefined,
      typeDefinition,
    );

    const comments = [
      node.metadata.title ?? "",
      node.metadata.description ?? "",
      node.metadata.deprecated ? "@deprecated" : "",
    ]
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line + "\n")
      .join("");

    if (comments.length > 0) {
      ts.addSyntheticLeadingComment(
        declaration,
        ts.SyntaxKind.MultiLineCommentTrivia,
        "*\n" + comments,
        true,
      );
    }

    return declaration;
  }

  protected generateTypeDefinition(nodeId: string): ts.TypeNode {
    const { factory: f } = this;

    const typeElements = [...this.generateTypeDefinitionElements(nodeId)];
    const compoundElements = [
      ...this.generateCompoundDefinitionElements(nodeId),
    ];

    let typeDefinitionNode: ts.TypeNode | undefined;
    if (compoundElements.length > 0) {
      const typeNode = f.createParenthesizedType(
        f.createIntersectionTypeNode(compoundElements),
      );
      typeDefinitionNode =
        typeDefinitionNode == null
          ? typeNode
          : f.createParenthesizedType(
              f.createIntersectionTypeNode([typeDefinitionNode, typeNode]),
            );
    }
    if (typeElements.length > 0) {
      const typeNode = f.createParenthesizedType(
        f.createUnionTypeNode(typeElements),
      );
      typeDefinitionNode =
        typeDefinitionNode == null
          ? typeNode
          : f.createParenthesizedType(
              f.createIntersectionTypeNode([typeDefinitionNode, typeNode]),
            );
    }

    if (typeDefinitionNode == null) {
      typeDefinitionNode = f.createKeywordTypeNode(
        ts.SyntaxKind.UnknownKeyword,
      );
    }

    return typeDefinitionNode;
  }

  protected *generateTypeDefinitionElements(
    nodeId: string,
  ): Iterable<ts.TypeNode> {
    const node = this.nodes[nodeId];
    for (const type of node.types) {
      switch (type) {
        case "never":
          yield this.generateNeverTypeDefinition(nodeId);
          break;

        case "any":
          yield this.generateAnyTypeDefinition(nodeId);
          break;

        case "null":
          yield this.generateNullTypeDefinition(nodeId);
          break;

        case "boolean":
          yield this.generateBooleanTypeDefinition(nodeId);
          break;

        case "integer":
          yield this.generateIntegerTypeDefinition(nodeId);
          break;

        case "number":
          yield this.generateNumberTypeDefinition(nodeId);
          break;

        case "string":
          yield this.generateStringTypeDefinition(nodeId);
          break;

        case "array":
          yield this.generateArrayTypeDefinition(nodeId);
          break;

        case "map":
          yield this.generateMapTypeDefinition(nodeId);
          break;

        default:
          throw new Error("type not supported");
      }
    }
  }

  protected *generateCompoundDefinitionElements(
    nodeId: string,
  ): Iterable<ts.TypeNode> {
    const node = this.nodes[nodeId];

    if (node.applicators.reference != null) {
      yield this.generateReferenceCompoundDefinition(
        node.applicators.reference,
      );
    }
    if (node.applicators.oneOf != null) {
      yield this.generateOneOfCompoundDefinition(node.applicators.oneOf);
    }
    if (node.applicators.anyOf != null) {
      yield this.generateAnyOfCompoundDefinition(node.applicators.anyOf);
    }
    if (node.applicators.allOf != null) {
      yield this.generateAllOfCompoundDefinition(node.applicators.allOf);
    }
    if (node.applicators.if != null) {
      yield this.generateIfCompoundDefinition(
        node.applicators.if,
        node.applicators.then,
        node.applicators.else,
      );
    }
    if (node.applicators.not != null) {
      yield this.generateNotCompoundDefinition(node.applicators.not);
    }
  }

  protected generateNeverTypeDefinition(nodeId: string): ts.TypeNode {
    return this.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
  }
  protected generateAnyTypeDefinition(nodeId: string): ts.TypeNode {
    return this.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  }
  protected generateNullTypeDefinition(nodeId: string): ts.TypeNode {
    return this.factory.createLiteralTypeNode(this.factory.createNull());
  }
  protected generateBooleanTypeDefinition(nodeId: string): ts.TypeNode {
    const node = this.nodes[nodeId];
    const options = node.assertions.boolean?.options;

    if (options == null) {
      return this.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    }

    return this.factory.createUnionTypeNode(
      options.map((option) =>
        this.factory.createLiteralTypeNode(
          option ? this.factory.createTrue() : this.factory.createFalse(),
        ),
      ),
    );
  }
  protected generateIntegerTypeDefinition(nodeId: string): ts.TypeNode {
    const node = this.nodes[nodeId];
    const options = node.assertions.integer?.options;

    if (options == null) {
      return this.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    }

    return this.factory.createUnionTypeNode(
      options.map((option) =>
        this.factory.createLiteralTypeNode(
          this.factory.createNumericLiteral(option),
        ),
      ),
    );
  }
  protected generateNumberTypeDefinition(nodeId: string): ts.TypeNode {
    const node = this.nodes[nodeId];
    const options = node.assertions.number?.options;

    if (options == null) {
      return this.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    }

    return this.factory.createUnionTypeNode(
      options.map((option) =>
        this.factory.createLiteralTypeNode(
          this.factory.createNumericLiteral(option),
        ),
      ),
    );
  }
  protected generateStringTypeDefinition(nodeId: string): ts.TypeNode {
    const node = this.nodes[nodeId];
    const options = node.assertions.string?.options;

    if (options == null) {
      return this.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }

    return this.factory.createUnionTypeNode(
      options.map((option) =>
        this.factory.createLiteralTypeNode(
          this.factory.createStringLiteral(option),
        ),
      ),
    );
  }
  protected generateArrayTypeDefinition(nodeId: string): ts.TypeNode {
    const node = this.nodes[nodeId];
    const tupleItems = node.applicators.tupleItems;
    const arrayItems = node.applicators.arrayItems;

    if (arrayItems != null) {
      const elements = [...(tupleItems || []), arrayItems]
        .filter((nodeId) => nodeId != null)
        .map((nodeId) => nodeId as string)
        .map((nodeId) => this.generateTypeReference(nodeId));

      return this.factory.createArrayTypeNode(
        this.factory.createUnionTypeNode(elements),
      );
    }

    if (tupleItems != null) {
      const elements = tupleItems.map((nodeId) =>
        this.generateTypeReference(nodeId),
      );
      return this.factory.createTupleTypeNode(elements);
    }

    {
      const element = this.factory.createKeywordTypeNode(
        ts.SyntaxKind.UnknownKeyword,
      );
      return this.factory.createArrayTypeNode(element);
    }
  }
  protected generateMapTypeDefinition(nodeId: string): ts.TypeNode {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const objectProperties = node.applicators.objectProperties;
    const patternProperties = node.applicators.patternProperties;
    const mapProperties = node.applicators.mapProperties;
    const propertyNames = node.applicators.propertyNames;
    const required = new Set(node.assertions.map?.required);

    const members = Array<ts.TypeElement>();
    const indexTypeUnionElements = new Array<ts.TypeNode>();

    let hasIndexSignature = false;
    let indexMaybeUndefined = false;

    const nameTypeElement =
      propertyNames == null
        ? f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        : this.generateTypeReference(propertyNames);

    if (mapProperties != null) {
      hasIndexSignature = true;

      const typeElement = this.generateTypeReference(mapProperties);
      indexTypeUnionElements.push(typeElement);
    }

    if (patternProperties != null) {
      hasIndexSignature = true;

      for (const patternProperty of Object.values(patternProperties)) {
        const typeElement = this.generateTypeReference(patternProperty);
        indexTypeUnionElements.push(typeElement);
      }
    }

    if (objectProperties != null) {
      for (const name in objectProperties) {
        const nodeId = objectProperties[name];
        const typeElement = this.generateTypeReference(nodeId);
        const memberRequired = required.has(name);
        members.push(
          f.createPropertySignature(
            undefined,
            f.createIdentifier(name),
            memberRequired
              ? undefined
              : f.createToken(ts.SyntaxKind.QuestionToken),
            typeElement,
          ),
        );

        if (hasIndexSignature) {
          indexTypeUnionElements.push(typeElement);
        }

        if (!memberRequired) {
          indexMaybeUndefined = true;
        }
      }
    }

    if (indexMaybeUndefined) {
      indexTypeUnionElements.push(
        f.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
      );
    }

    if (hasIndexSignature) {
      members.push(
        f.createIndexSignature(
          undefined,
          [
            f.createParameterDeclaration(
              undefined,
              undefined,
              f.createIdentifier("key"),
              undefined,
              nameTypeElement,
              undefined,
            ),
          ],
          f.createUnionTypeNode(indexTypeUnionElements),
        ),
      );
    }

    return f.createTypeLiteralNode(members);
  }

  protected generateOneOfCompoundDefinition(oneOf: string[]) {
    const types = oneOf.map((nodeId) => this.generateTypeReference(nodeId));
    return this.factory.createUnionTypeNode(types);
  }
  protected generateAnyOfCompoundDefinition(anyOf: string[]) {
    const unionTypes = new Array<ts.TypeNode>();
    for (let count = 0; count < anyOf.length; count++) {
      for (const intersectionTypes of choose(anyOf, count + 1)) {
        unionTypes.push(
          this.factory.createIntersectionTypeNode(
            intersectionTypes.map((nodeId) =>
              this.generateTypeReference(nodeId),
            ),
          ),
        );
      }
    }
    return this.factory.createUnionTypeNode(unionTypes);
  }
  protected generateAllOfCompoundDefinition(allOf: string[]) {
    const types = allOf.map((nodeId) => this.generateTypeReference(nodeId));
    return this.factory.createIntersectionTypeNode(types);
  }
  protected generateReferenceCompoundDefinition(reference: string) {
    return this.generateTypeReference(reference);
  }
  protected generateIfCompoundDefinition(
    $if: string,
    then?: string,
    $else?: string,
  ) {
    const elements = new Array<ts.TypeNode>();
    if (then != null) {
      elements.push(this.generateTypeReference(then));
    }

    if ($else != null) {
      elements.push(this.generateTypeReference($else));
    }

    if (elements.length > 0) {
      return this.factory.createUnionTypeNode(elements);
    }

    return this.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }
  protected generateNotCompoundDefinition(not: string) {
    return this.generateTypeReference(not);
  }
}
