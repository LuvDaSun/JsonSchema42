import * as schemaIntermediate from "@jns42/schema-intermediate";
import { JsonLocation, discoverSchemaId, loadYAML, readNode } from "../utils/index.js";
import { DocumentBase } from "./document-base.js";
import { SchemaDocumentBase } from "./schema-document-base.js";

export interface DocumentInitializer<N = unknown> {
  retrievalUrl: JsonLocation;
  givenUrl: JsonLocation;
  antecedentUrl: JsonLocation | null;
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
  private nodeDocuments = new Map<string, JsonLocation>();
  /**
   * all loaded nodes
   */
  private nodeCache = new Map<string, unknown>();
  /**
   * keep track of what we have been loading (so we only load it once)
   */
  private loaded = new Set<string>();

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

  public getDocument(documentUrl: JsonLocation) {
    const documentId = documentUrl.toString();
    const document = this.documents.get(documentId);
    if (document == null) {
      throw new TypeError(`document not found ${documentId}`);
    }
    return document;
  }

  public getDocumentForNode(nodeUrl: JsonLocation) {
    const nodeId = nodeUrl.toString();
    const documentUrl = this.nodeDocuments.get(nodeId);
    if (documentUrl == null) {
      throw new TypeError(`document not found for node ${nodeId}`);
    }
    return this.getDocument(documentUrl);
  }

  public async loadFromUrl(
    retrievalUrl: JsonLocation,
    givenUrl: JsonLocation,
    antecedentUrl: JsonLocation | null,
    defaultSchemaId: string,
  ) {
    const retrievalId = retrievalUrl.toString();
    if (!this.nodeCache.has(retrievalId)) {
      const documentNode = await loadYAML(retrievalUrl.toString());
      this.fillNodeCache(retrievalUrl, documentNode);
    }

    await this.loadFromCache(retrievalUrl, givenUrl, antecedentUrl, defaultSchemaId);
  }

  public async loadFromDocument(
    retrievalUrl: JsonLocation,
    givenUrl: JsonLocation,
    antecedentUrl: JsonLocation | null,
    documentNode: unknown,
    defaultSchemaId: string,
  ) {
    const retrievalId = retrievalUrl.toString();
    if (!this.nodeCache.has(retrievalId)) {
      this.fillNodeCache(retrievalUrl, documentNode);
    }

    await this.loadFromCache(retrievalUrl, givenUrl, antecedentUrl, defaultSchemaId);
  }

  private fillNodeCache(retrievalUrl: JsonLocation, documentNode: unknown) {
    const retrievalBaseUrl = retrievalUrl.toRoot();
    for (const [pointer, node] of readNode([], documentNode)) {
      const nodeRetrievalUrl = retrievalBaseUrl.push(...pointer);
      const nodeRetrievalId = nodeRetrievalUrl.toString();
      if (this.nodeCache.has(nodeRetrievalId)) {
        throw new TypeError(`duplicate node with id ${nodeRetrievalId}`);
      }

      this.nodeCache.set(nodeRetrievalId, node);
    }
  }

  private async loadFromCache(
    retrievalUrl: JsonLocation,
    givenUrl: JsonLocation,
    antecedentUrl: JsonLocation | null,
    defaultSchemaId: string,
  ) {
    const retrievalId = retrievalUrl.toString();

    if (this.loaded.has(retrievalId)) {
      return;
    }
    this.loaded.add(retrievalId);

    const node = this.nodeCache.get(retrievalId);
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
    const documentId = document.documentNodeUrl.toString();
    if (this.documents.has(documentId)) {
      throw new TypeError(`duplicate document ${documentId}`);
    }
    this.documents.set(documentId, document);

    // Map all node urls to the document they belong to.
    for (const nodeUrl of document.getNodeUrls()) {
      const nodeId = nodeUrl.toString();
      // Figure out if the node already belongs to a document. This might be the case when
      // dealing with embedded documents
      const documentNodeUrlPrevious = this.nodeDocuments.get(nodeId);

      if (documentNodeUrlPrevious != null) {
        const documentNodeIdPrevious = documentNodeUrlPrevious.toString();
        if (documentNodeIdPrevious.startsWith(documentId)) {
          // if the previous node id starts with the document id that means that the
          // previous document is a descendant of document. We will not change anything
          // about that
          continue;
        }
        if (documentId.startsWith(documentNodeIdPrevious)) {
          // longest url has preference
          this.nodeDocuments.set(nodeId, document.documentNodeUrl);
          continue;
        }
        throw new TypeError(`duplicate node with id ${nodeId}`);
      }

      // if the node is is not yet linked to a document
      this.nodeDocuments.set(nodeId, document.documentNodeUrl);
    }

    if (document instanceof SchemaDocumentBase) {
      await this.loadFromSchemaDocument(retrievalUrl, document, schemaId);
    }
  }

  private async loadFromSchemaDocument(
    retrievalUrl: JsonLocation,
    document: SchemaDocumentBase,
    defaultSchemaId: string,
  ) {
    for (const {
      retrievalUrl: referencedRetrievalUrl,
      givenUrl: referencedGivenUrl,
    } of document.getReferencedDocuments(retrievalUrl)) {
      await this.loadFromUrl(
        referencedRetrievalUrl,
        referencedGivenUrl,
        document.documentNodeUrl,
        defaultSchemaId,
      );
    }

    for (const {
      retrievalUrl: embeddedRetrievalUrl,
      givenUrl: embeddedGivenUrl,
      node,
    } of document.getEmbeddedDocuments(retrievalUrl)) {
      await this.loadFromDocument(
        embeddedRetrievalUrl,
        embeddedGivenUrl,
        document.documentNodeUrl,
        node,
        defaultSchemaId,
      );
    }
  }
}
