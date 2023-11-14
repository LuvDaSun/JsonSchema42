import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import {
  discoverSchemaId,
  loadJSON,
  normalizeUrl,
  readJson,
} from "../utils/index.js";
import { DocumentBase } from "./document-base.js";
import { SchemaDocumentBase } from "./schema-document-base.js";

export interface DocumentInitializer<N = unknown> {
  retrievalUrl: URL;
  givenUrl: URL;
  antecedentUrl: URL | null;
  documentNode: N;
}

export type DocumentFactory<N = unknown> = (
  initializer: DocumentInitializer<N>,
) => DocumentBase<N>;

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
  private nodeDocuments = new Map<string, URL>();
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

  public getIntermediateData(): schemaIntermediateB.SchemaJson {
    return {
      $schema:
        "https://schema.JsonSchema42.org/jns42-intermediate-b/schema.json",
      schemas: Object.fromEntries(this.getIntermediateSchemaEntries()),
    };
  }

  public *getIntermediateSchemaEntries(): Iterable<
    readonly [string, schemaIntermediateB.Node]
  > {
    for (const document of this.documents.values()) {
      yield* document.getIntermediateNodeEntries();
    }
  }

  public getDocument(documentUrl: URL) {
    const documentId = normalizeUrl(documentUrl).toString();
    const document = this.documents.get(documentId);
    if (document == null) {
      throw new TypeError(`document not found ${documentId}`);
    }
    return document;
  }

  public getDocumentForNode(nodeUrl: URL) {
    const nodeId = normalizeUrl(nodeUrl).toString();
    const documentUrl = this.nodeDocuments.get(nodeId);
    if (documentUrl == null) {
      throw new TypeError(`document not found for node ${nodeId}`);
    }
    return this.getDocument(documentUrl);
  }

  public async loadFromUrl(
    retrievalUrl: URL,
    givenUrl: URL,
    antecedentUrl: URL | null,
    defaultSchemaId: string,
  ) {
    const retrievalId = normalizeUrl(retrievalUrl).toString();
    if (!this.nodeCache.has(retrievalId)) {
      const documentNode = await loadJSON(retrievalUrl);
      this.fillNodeCache(retrievalUrl, documentNode);
    }

    await this.loadFromCache(
      retrievalUrl,
      givenUrl,
      antecedentUrl,
      defaultSchemaId,
    );
  }

  public async loadFromDocument(
    retrievalUrl: URL,
    givenUrl: URL,
    antecedentUrl: URL | null,
    documentNode: unknown,
    defaultSchemaId: string,
  ) {
    const retrievalId = normalizeUrl(retrievalUrl).toString();
    if (!this.nodeCache.has(retrievalId)) {
      this.fillNodeCache(retrievalUrl, documentNode);
    }

    await this.loadFromCache(
      retrievalUrl,
      givenUrl,
      antecedentUrl,
      defaultSchemaId,
    );
  }

  private fillNodeCache(retrievalUrl: URL, documentNode: unknown) {
    const retrievalBaseUrl = new URL("", retrievalUrl);
    for (const [pointer, node] of readJson("", documentNode)) {
      const nodeRetrievalUrl = new URL(`#${pointer}`, retrievalBaseUrl);
      const nodeRetrievalId = normalizeUrl(nodeRetrievalUrl).toString();
      if (this.nodeCache.has(nodeRetrievalId)) {
        throw new TypeError(`duplicate node with id ${nodeRetrievalId}`);
      }

      this.nodeCache.set(nodeRetrievalId, node);
    }
  }

  private async loadFromCache(
    retrievalUrl: URL,
    givenUrl: URL,
    antecedentUrl: URL | null,
    defaultSchemaId: string,
  ) {
    const retrievalId = normalizeUrl(retrievalUrl).toString();

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
    const documentId = normalizeUrl(document.documentNodeUrl).toString();
    if (this.documents.has(documentId)) {
      throw new TypeError(`duplicate document ${documentId}`);
    }
    this.documents.set(documentId, document);

    for (const nodeUrl of document.getNodeUrls()) {
      const nodeId = normalizeUrl(nodeUrl).toString();
      const documentNodeUrlPrevious = this.nodeDocuments.get(nodeId);
      if (documentNodeUrlPrevious != null) {
        const documentNodeIdPrevious = documentNodeUrlPrevious.toString();
        if (documentNodeIdPrevious.startsWith(documentId)) {
          continue;
        }
        if (documentId.startsWith(documentNodeIdPrevious)) {
          // longest url has preference
          this.nodeDocuments.set(nodeId, document.documentNodeUrl);
          continue;
        }
        throw new TypeError(`duplicate node with id ${nodeId}`);
      }
      this.nodeDocuments.set(nodeId, document.documentNodeUrl);
    }

    if (document instanceof SchemaDocumentBase) {
      await this.loadFromSchemaDocument(retrievalUrl, document, schemaId);
    }
  }

  private async loadFromSchemaDocument(
    retrievalUrl: URL,
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
