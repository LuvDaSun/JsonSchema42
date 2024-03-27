# jns42-core

This package hold the core functionality for the jns42-generator.

## Names

[Source](./src/utils/names.rs)

From the schema we generate models, every model needs a name! Names are derived from a few sentences that are unique for the model. These sentences are derives from the identifying url of the model and optionally it's contextual name. These properties are fed to the names builder, together with a unique key per model.

For instance if we have a model with key `25` that has the following url:

```
http://example.com/schema.json/#/$defs/Employee/properties/FirstName
```

Then first we derive sentences from this url. they are:

- schema json
- defs
- employee
- properties
- first name

If this model would also have a contextual name, that would simply be added to the list of sentences.

We do this for every model. So we have a list of sentences for every model. Now, for every sentence we can calculate it's cardinality. We sort the sentences for every model base on their cardinality (and possibly some extra properties). We could come up with a like this (cardinality in parentheses).

- schema json (100)
- properties (80)
- defs (70)
- employee (10)
- first name (2)

Now we are going to build unique names for every model. We start with an empty name. And we calculate the cardinality of that unique name. If there are many models this cardinality is more than 1.

If that is the case then we pop a sentence from the list and make that the unique name. We recalculate the cardinality of the unique names. If cardinality of a name is 1 then we have found a unique name for that model.

If it is more than one then we pop another name from the sentences list and prepend it to the unique name. We calculate the cardinality again and keep on doing this until either we have no sentences anymore or we found a unique name.

Now it may be possible that prepending a sentence did not decrease cardinality! Is this is the case then we revert to the last name.

So we could end up with this name for model `25`:

```
employee first name
```

That is not a bad name!

It is possible that after the naming process we are left with a few models that have no name. If this is the case then we have a default name that we give those models.

It is possible that we can not find a unique name for every model! If this is the case then we prepend the models with a sequence. So if we have three models that are named `first name` then we will rename them to

- first name
- first name 1
- first name 2

The ordering is based on the key of the model.
