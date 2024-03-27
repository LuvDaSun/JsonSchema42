## Naming

From the schema we generate models, every model needs a name! Names are derived from a few sentences that are unique for the model. These sentences are derives from the identifying url of the model and optionally it's contextual name. These properties are fed to the names builder, together with a unique key per model.

For instance if we have a model with key `25` that has the following url:

```yaml
- http://example.com/schemas/employee/schema.json/#/$defs/Employee/properties/FirstName
```

Then first we derive sentences from this url. they are:

```yaml
- schemas
- employee
- schema json
- defs
- employee
- properties
- first name
```

If this model would also have a contextual name, that would simply be added to the list of sentences.

We do this for every model. So we have a list of sentences for every model. Now, for every unique sentence we can calculate it's cardinality. If a sentence has a cardinality that is equal to the number of models then we remove it from the original list of sentences and recalculate the cardinality of unique sentences until every sentence has a cardinality lower than the number of models.

We do this as an optimization and to remove non-identifying double sentences. In our example every model in the schema has `employee` as a sentence. But is is only identifying in our example model.

We call the sentence and the meta data a name part. We remove any parts with a double sentence. We sort the parts for every model bases on their cardinality (and possibly other metadata, like index). We could come up with a list like this:

```yaml
- sentence: first name
  cardinality: 2
  index: 6
- sentence: employee
  cardinality: 10
  index: 4
- sentence: defs
  cardinality: 70
  index: 3
- sentence: properties
  cardinality: 80
  index: 5
- sentence: schema json
  cardinality: 100
  index: 2
- sentence: schemas
  cardinality: 100
  index: 0
```

Now we build unique names for every model. We start with an empty name. And we calculate the cardinality of that unique name. If there are many models this cardinality is more than 1.

If that is the case then we pop a name part from the list and make the sentence of the part unique name. We recalculate the cardinality of the unique names. If cardinality of a name is 1 then we have found a unique name for that model.

If it is more than one then we pop another part from the list and prepend the sentence to the unique name. We calculate the cardinality again and keep on doing this until either we have no parts anymore or we found a unique name.

Now it may be possible that prepending a sentence did not decrease cardinality! Is this is the case then we revert to the last name.

So we could end up with this name for model `25`:

```yaml
- employee first name
```

That is not a bad name!

It is possible that after the naming process we are left with a few models that have no name. If this is the case then we have a default name that we give those models.

It is possible that we can not find a unique name for every model! If this is the case then we prepend the models with a sequence. So if we have three models that are named `first name` then we will rename them to

```yaml
- first name
- first name 1
- first name 2
```

The ordering is based on the key of the model.
