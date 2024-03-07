import * as schemaIntermediate from "@jns42/schema-intermediate";
import { NodeLocation, discoverSchemaId, loadYAML, readNode } from "../utils/index.js";
import { DocumentBase } from "./document-base.js";
import { SchemaDocumentBase } from "./schema-document-base.js";

export interface DocumentInitializer<N = unknown> {
  retrievalUrl: NodeLocation;
  givenUrl: NodeLocation;
  antecedentUrl: NodeLocation | null;
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
  private nodeDocuments = new Map<string, NodeLocation>();
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
  private resolved = new Map<string, NodeLocation>();

  public registerFactory(schema: string, factory: DocumentFactory) {
    /**
     * no check if the factory is already registered here so we can
     * override factories
     */
    this.factories.set(schema, factory);
  }

  public getIntermediateData(): schemaIntermediate.SchemaDocument {
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

  public getDocument(documentUrl: NodeLocation) {
    const documentId = documentUrl.toString();
    const document = this.documents.get(documentId);
    if (document == null) {
      throw new TypeError(`document not found ${documentId}`);
    }
    return document;
  }

  public getDocumentForNode(nodeUrl: NodeLocation) {
    const nodeId = nodeUrl.toString();
    const documentUrl = this.nodeDocuments.get(nodeId);
    if (documentUrl == null) {
      throw new TypeError(`document not found for node ${nodeId}`);
    }
    return this.getDocument(documentUrl);
  }

  public async loadFromUrl(
    retrievalUrl: NodeLocation,
    givenUrl: NodeLocation,
    antecedentUrl: NodeLocation | null,
    defaultSchemaId: string,
  ) {
    const retrievalId = retrievalUrl.toString();
    if (!this.cache.has(retrievalId)) {
      const documentNode = await loadYAML(retrievalId);
      this.fillNodeCache(retrievalUrl, documentNode);
    }

    await this.loadFromCache(retrievalUrl, givenUrl, antecedentUrl, defaultSchemaId);
  }

  public async loadFromDocument(
    retrievalUrl: NodeLocation,
    givenUrl: NodeLocation,
    antecedentUrl: NodeLocation | null,
    documentNode: unknown,
    defaultSchemaId: string,
  ) {
    const retrievalId = retrievalUrl.toString();
    if (!this.cache.has(retrievalId)) {
      this.fillNodeCache(retrievalUrl, documentNode);
    }

    await this.loadFromCache(retrievalUrl, givenUrl, antecedentUrl, defaultSchemaId);
  }

  private fillNodeCache(retrievalUrl: NodeLocation, documentNode: unknown) {
    const retrievalBaseUrl = retrievalUrl;
    for (const [pointer, node] of readNode([], documentNode)) {
      const nodeRetrievalUrl = retrievalBaseUrl.push(...pointer);
      const nodeRetrievalId = nodeRetrievalUrl.toString();
      if (this.cache.has(nodeRetrievalId)) {
        throw new TypeError(`duplicate node with id ${nodeRetrievalId}`);
      }

      this.cache.set(nodeRetrievalId, node);
    }
  }

  private async loadFromCache(
    retrievalUrl: NodeLocation,
    givenUrl: NodeLocation,
    antecedentUrl: NodeLocation | null,
    defaultSchemaId: string,
  ) {
    const retrievalId = retrievalUrl.toString();

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
      retrievalUrl,
      givenUrl,
      antecedentUrl,
      documentNode: node,
    });
    const documentUrl = document.documentNodeUrl;
    if (this.resolved.has(retrievalId)) {
      throw new TypeError(`duplicate in resolved ${retrievalId}`);
    }
    this.resolved.set(retrievalId, documentUrl);

    const documentId = documentUrl.toString();
    if (this.documents.has(documentId)) {
      throw new TypeError(`duplicate document ${documentId}`);
    }
    this.documents.set(documentId, document);

    // Map all node urls to the document they belong to.
    for (const nodeUrl of document.getNodeUrls()) {
      const nodeId = nodeUrl.toString();

      if (this.nodeDocuments.has(nodeId)) {
        throw new TypeError(`duplicate node with id ${nodeId}`);
      }

      // if the node is is not yet linked to a document
      this.nodeDocuments.set(nodeId, document.documentNodeUrl);
    }

    if (document instanceof SchemaDocumentBase) {
      await this.loadFromSchemaDocument(document, schemaId);
    }
  }

  private async loadFromSchemaDocument(document: SchemaDocumentBase, defaultSchemaId: string) {
    for (const { retrievalUrl, givenUrl } of document.embeddedDocuments) {
      let node = this.cache.get(retrievalUrl.toString());
      await this.loadFromDocument(
        retrievalUrl,
        givenUrl,
        document.documentNodeUrl,
        node,
        defaultSchemaId,
      );
    }

    for (const { retrievalUrl, givenUrl } of document.referencedDocuments) {
      await this.loadFromUrl(retrievalUrl, givenUrl, document.documentNodeUrl, defaultSchemaId);
    }
  }
}
