import * as core from "@jns42/core";
import * as schemaIntermediate from "@jns42/schema-intermediate";
import { discoverSchemaId, loadYAML, readNode } from "../utils/index.js";
import { DocumentBase } from "./document-base.js";
import { SchemaDocumentBase } from "./schema-document-base.js";

export interface DocumentInitializer<N = unknown> {
  retrievalLocation: core.NodeLocation;
  givenLocation: core.NodeLocation;
  antecedentLocation: core.NodeLocation | null;
  documentNode: N;
}

export type DocumentFactory<N = unknown> = (initializer: DocumentInitializer<N>) => DocumentBase<N>;

export class DocumentContext {
  /**
   * document factories by schema identifier
   */
  private factories = new Map<string, DocumentFactory>();
  /**
   * all documents, indexed by document id
   */
  private documents = new Map<string, DocumentBase>();
  /**
   * maps node urls to their documents
   */
  private nodeDocuments = new Map<string, core.NodeLocation>();
  /**
   * all loaded nodes
   */
  private cache = new Map<string, unknown>();
  /**
   * keep track of what we have been loading (so we only load it once)
   */
  private loaded = new Set<string>();
  /**
   * maps retrieval url to document url
   */
  private resolved = new Map<string, core.NodeLocation>();

  public registerFactory(schema: string, factory: DocumentFactory) {
    /**
     * no check if the factory is already registered here so we can
     * override factories
     */
    this.factories.set(schema, factory);
  }

  public getIntermediateData(): schemaIntermediate.SchemaJson {
    return {
      $schema: "https://schema.JsonSchema42.org/jns42-intermediate/schema.json",
      schemas: Object.fromEntries(this.getIntermediateSchemaEntries()),
    };
  }

  public *getIntermediateSchemaEntries(): Iterable<readonly [string, schemaIntermediate.Node]> {
    for (const document of this.documents.values()) {
      yield* document.getIntermediateNodeEntries();
    }
  }

  public getDocument(documentLocation: core.NodeLocation) {
    const documentId = documentLocation.toString();
    const document = this.documents.get(documentId);
    if (document == null) {
      throw new TypeError(`document not found ${documentId}`);
    }
    return document;
  }

  public getDocumentForNode(nodeLocation: core.NodeLocation) {
    const nodeId = nodeLocation.toString();
    const documentLocation = this.nodeDocuments.get(nodeId);
    if (documentLocation == null) {
      throw new TypeError(`document not found for node ${nodeId}`);
    }
    return this.getDocument(documentLocation);
  }

  public async loadFromLocation(
    retrievalLocation: core.NodeLocation,
    givenLocation: core.NodeLocation,
    antecedentLocation: core.NodeLocation | null,
    defaultSchemaId: string,
  ) {
    const documentLocation = retrievalLocation.clone();
    // documentLocation.setRoot();
    const documentId = documentLocation.toString();
    const documentPath = documentLocation.toRetrievalString();
    if (!this.cache.has(documentId)) {
      const documentNode = await loadYAML(documentPath);
      this.fillNodeCache(documentLocation, documentNode);
    }

    await this.loadFromCache(retrievalLocation, givenLocation, antecedentLocation, defaultSchemaId);
  }

  public async loadFromDocument(
    retrievalLocation: core.NodeLocation,
    givenLocation: core.NodeLocation,
    antecedentLocation: core.NodeLocation | null,
    documentNode: unknown,
    defaultSchemaId: string,
  ) {
    const documentLocation = retrievalLocation.clone();
    // documentLocation.setRoot();
    const documentId = documentLocation.toString();
    if (!this.cache.has(documentId)) {
      this.fillNodeCache(documentLocation, documentNode);
    }

    await this.loadFromCache(retrievalLocation, givenLocation, antecedentLocation, defaultSchemaId);
  }

  private fillNodeCache(documentLocation: core.NodeLocation, documentNode: unknown) {
    for (const [pointer, node] of readNode([], documentNode)) {
      const nodeRetrievalLocation = documentLocation.clone();
      nodeRetrievalLocation.setPointer([...(nodeRetrievalLocation.getPointer() ?? []), ...pointer]);
      const nodeRetrievalId = nodeRetrievalLocation.toString();
      if (this.cache.has(nodeRetrievalId)) {
        throw new TypeError(`duplicate node with id ${nodeRetrievalId}`);
      }

      this.cache.set(nodeRetrievalId, node);
    }
  }

  private async loadFromCache(
    retrievalLocation: core.NodeLocation,
    givenLocation: core.NodeLocation,
    antecedentLocation: core.NodeLocation | null,
    defaultSchemaId: string,
  ) {
    const retrievalId = retrievalLocation.toString();

    if (this.resolved.has(retrievalId)) {
      return;
    }

    if (this.loaded.has(retrievalId)) {
      return;
    }
    this.loaded.add(retrievalId);

    const node = this.cache.get(retrievalId);
    if (node == null) {
      throw new TypeError("node not found in index");
    }

    const schemaId = discoverSchemaId(node) ?? defaultSchemaId;
    const factory = this.factories.get(schemaId);
    if (factory == null) {
      throw new TypeError(`no factory found for ${schemaId}`);
    }

    const document = factory({
      retrievalLocation,
      givenLocation,
      antecedentLocation,
      documentNode: node,
    });
    const documentLocation = document.documentNodeLocation;
    this.resolved.set(retrievalId, documentLocation);

    const documentId = documentLocation.toString();
    if (this.documents.has(documentId)) {
      throw new TypeError(`duplicate document ${documentId}`);
    }
    this.documents.set(documentId, document);

    // Map all node urls to the document they belong to.
    for (const nodeLocation of document.getNodeLocations()) {
      const nodeId = nodeLocation.toString();
      // Figure out if the node already belongs to a document. This might be the case when
      // dealing with embedded documents
      const documentNodeLocationPrevious = this.nodeDocuments.get(nodeId);

      if (documentNodeLocationPrevious != null) {
        const documentNodeIdPrevious = documentNodeLocationPrevious.toString();
        if (documentNodeIdPrevious.startsWith(documentId)) {
          // if the previous node id starts with the document id that means that the
          // previous document is a descendant of document. We will not change anything
          // about that
          continue;
        }
        if (documentId.startsWith(documentNodeIdPrevious)) {
          // longest url has preference
          this.nodeDocuments.set(nodeId, documentLocation);
          continue;
        }

        // node is is already present and unrelated
        throw new TypeError(`duplicate node with id ${nodeId}`);
      }

      // if the node is is not yet linked to a document
      this.nodeDocuments.set(nodeId, documentLocation);
    }

    if (document instanceof SchemaDocumentBase) {
      await this.loadFromSchemaDocument(document, schemaId);
    }
  }

  private async loadFromSchemaDocument(document: SchemaDocumentBase, defaultSchemaId: string) {
    for (const { retrievalLocation, givenLocation } of document.embeddedDocuments) {
      const retrievalId = retrievalLocation.toString();
      let node = this.cache.get(retrievalId);
      await this.loadFromDocument(
        retrievalLocation,
        givenLocation,
        document.documentNodeLocation,
        node,
        defaultSchemaId,
      );
    }

    for (const { retrievalLocation, givenLocation } of document.referencedDocuments) {
      await this.loadFromLocation(
        retrievalLocation,
        givenLocation,
        document.documentNodeLocation,
        defaultSchemaId,
      );
    }
  }
}
