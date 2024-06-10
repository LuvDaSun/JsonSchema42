If we reference a node, then we consider that node a document, if it is not loaded already. Then if a parent node of that node is referenced, and that node then becomes a document, then the first referenced node becomes a part of that document. The old document may be removed as it is not used then.

This approach makes it easy to reference documents in open api documents. In case of an open api specification it is not so trivial to figure out that parent. Also this approach supports other scenario's where it is not so trivial to figure out the json schema document that a node belongs to. For instance in the testing documents.

One may think that the defining document can be found by traversing up the node tree and finding the first node that as a `$schema` property. It is a bit more complicated. I reality, documents can also have an `id` or `$id` property that declares a document. The exact name of this property depends on the json schema version. In reality the `$schema` and identifying property are not always present on schema documents.

If we consider each referenced node a document then we do not have to find the document ourselves. This make the implementation a bit more robust.

Another approach would be to make open api documents a first class citizen in JsonSchema42. We would then be able to load all schemas from the openapi document. We choose not to do this because JsonSchema42 should be about json schema alone, and not the format that embedded the schema.

We do support openapi flavored json schemas, but those specifications could (in theory) exist without openapi.
