## Design

How do things work.

### Overview

The generation of code from a schema goes through the following steps:

1.  Loading

    The schema is loaded, then all referenced schemas are loaded. Every schema (embedded and referenced) is represented as a document. Depending on the version of the schema the document is of a different class. The document context is responsible for managing this.

    This is done via a cache. All nodes that are retrieved (loaded) are cached first. Then documents are created from the cache.

    During the loading phase nodes are given some locations. First is the retrieval location, this is the (physical) location where the node was retrieved from. This could be a file path or an url where the document is located.

    Then there is the given location, this is a location derived from the container of the node. This is often the same as the retrieval location, but is does not have to be.

    A node may have an identity location, this is a location that is drawn from the node itself. Usually via the id attribute. If a node has a identity location that differs from the retrieval location then the sub nodes probably have a different given location that the retrieval location.

    And then there is the antecedent location. This is the reason for the node. This could be the location of the document referencing the node. Or the document containing an embedded document. The antecedent location is used to resolve dynamic anchors.

    Documents may be loaded from a location (file path or url) of from another document. If a document is loaded from a location then the document needs to be retrieved first. After the document is retrieved then the same logic applies as loading a document from another document.

    A document has a set of nodes. They are a tree of nodes. A node belongs to exactly one document.

2.  Reading

    The document is read and normalized into an intermediate document. In this document all of the nodes, including external nodes are represented.

3.  Importing

    The intermediate document is translated into the schema arena. One of the most interesting aspects is that the nodes in the intermediate document have an identifier that is a string (a location). In the arena the nodes have a key that is an identifier. Depending on the requirements the node can be imported in multiple arenas.

    Also nodes are given a parent that they may use to inherit properties from.

4.  Optimization

    Node in an arena are optimized so that they do not contain anything that we cannot handle later. For instance, the if, then, else fields may be resolved, or the anyOf fields may be resolved. Depending on the arena, different types optimization may be used.

5.  Naming

    Every node in the document has a unique identifier, it's location. This location can be seen as a sequence of sentences. those sentences are made up out of words. The naming process is all about keeping the sentences unique, but as short as possible.

    It is possible that a node has no name (this might happen after an optimization). In that case the node itself has a context name that may be used.

6.  Code generation

    The last step is the actual code generation. Code is generated from the arena(s) and the names(s) that are generated from the arenas.
