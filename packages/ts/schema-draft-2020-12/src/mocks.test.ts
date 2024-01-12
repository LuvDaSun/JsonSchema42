// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.9.6                          -- www.JsonSchema42.org
//
import assert from "node:assert/strict";
import test from "node:test";
import * as validators from "./validators.js";
import * as mocks from "./mocks.js";
test("Schema", () => {
const mock = mocks.mockSchema();
assert.equal(
validators.isSchema(mock),
true,
)
});
test("Definitions", () => {
const mock = mocks.mockDefinitions();
assert.equal(
validators.isDefinitions(mock),
true,
)
});
test("Dependencies", () => {
const mock = mocks.mockDependencies();
assert.equal(
validators.isDependencies(mock),
true,
)
});
test("RecursiveAnchor", () => {
const mock = mocks.mockRecursiveAnchor();
assert.equal(
validators.isRecursiveAnchor(mock),
true,
)
});
test("RecursiveRef", () => {
const mock = mocks.mockRecursiveRef();
assert.equal(
validators.isRecursiveRef(mock),
true,
)
});
test("AllOf0", () => {
const mock = mocks.mockAllOf0();
assert.equal(
validators.isAllOf0(mock),
true,
)
});
test("AllOf1", () => {
const mock = mocks.mockAllOf1();
assert.equal(
validators.isAllOf1(mock),
true,
)
});
test("AllOf2", () => {
const mock = mocks.mockAllOf2();
assert.equal(
validators.isAllOf2(mock),
true,
)
});
test("AllOf3", () => {
const mock = mocks.mockAllOf3();
assert.equal(
validators.isAllOf3(mock),
true,
)
});
test("AllOf4", () => {
const mock = mocks.mockAllOf4();
assert.equal(
validators.isAllOf4(mock),
true,
)
});
test("AllOf5", () => {
const mock = mocks.mockAllOf5();
assert.equal(
validators.isAllOf5(mock),
true,
)
});
test("AllOf6", () => {
const mock = mocks.mockAllOf6();
assert.equal(
validators.isAllOf6(mock),
true,
)
});
test("DefinitionsAdditionalProperties", () => {
const mock = mocks.mockDefinitionsAdditionalProperties();
assert.equal(
validators.isDefinitionsAdditionalProperties(mock),
true,
)
});
test("DependenciesAdditionalProperties", () => {
const mock = mocks.mockDependenciesAdditionalProperties();
assert.equal(
validators.isDependenciesAdditionalProperties(mock),
true,
)
});
test("Dependencies0", () => {
const mock = mocks.mockDependencies0();
assert.equal(
validators.isDependencies0(mock),
true,
)
});
test("Dependencies1", () => {
const mock = mocks.mockDependencies1();
assert.equal(
validators.isDependencies1(mock),
true,
)
});
test("AnchorString", () => {
const mock = mocks.mockAnchorString();
assert.equal(
validators.isAnchorString(mock),
true,
)
});
test("UriReferenceString", () => {
const mock = mocks.mockUriReferenceString();
assert.equal(
validators.isUriReferenceString(mock),
true,
)
});
test("Core", () => {
const mock = mocks.mockCore();
assert.equal(
validators.isCore(mock),
true,
)
});
test("UriString", () => {
const mock = mocks.mockUriString();
assert.equal(
validators.isUriString(mock),
true,
)
});
test("Id", () => {
const mock = mocks.mockId();
assert.equal(
validators.isId(mock),
true,
)
});
test("CoreSchema", () => {
const mock = mocks.mockCoreSchema();
assert.equal(
validators.isCoreSchema(mock),
true,
)
});
test("Ref", () => {
const mock = mocks.mockRef();
assert.equal(
validators.isRef(mock),
true,
)
});
test("Anchor", () => {
const mock = mocks.mockAnchor();
assert.equal(
validators.isAnchor(mock),
true,
)
});
test("DynamicRef", () => {
const mock = mocks.mockDynamicRef();
assert.equal(
validators.isDynamicRef(mock),
true,
)
});
test("DynamicAnchor", () => {
const mock = mocks.mockDynamicAnchor();
assert.equal(
validators.isDynamicAnchor(mock),
true,
)
});
test("Vocabulary", () => {
const mock = mocks.mockVocabulary();
assert.equal(
validators.isVocabulary(mock),
true,
)
});
test("Comment", () => {
const mock = mocks.mockComment();
assert.equal(
validators.isComment(mock),
true,
)
});
test("Defs", () => {
const mock = mocks.mockDefs();
assert.equal(
validators.isDefs(mock),
true,
)
});
test("VocabularyAdditionalProperties", () => {
const mock = mocks.mockVocabularyAdditionalProperties();
assert.equal(
validators.isVocabularyAdditionalProperties(mock),
true,
)
});
test("VocabularyPropertyNames", () => {
const mock = mocks.mockVocabularyPropertyNames();
assert.equal(
validators.isVocabularyPropertyNames(mock),
true,
)
});
test("DefsAdditionalProperties", () => {
const mock = mocks.mockDefsAdditionalProperties();
assert.equal(
validators.isDefsAdditionalProperties(mock),
true,
)
});
test("Applicator", () => {
const mock = mocks.mockApplicator();
assert.equal(
validators.isApplicator(mock),
true,
)
});
test("SchemaArray", () => {
const mock = mocks.mockSchemaArray();
assert.equal(
validators.isSchemaArray(mock),
true,
)
});
test("PrefixItems", () => {
const mock = mocks.mockPrefixItems();
assert.equal(
validators.isPrefixItems(mock),
true,
)
});
test("ApplicatorItems", () => {
const mock = mocks.mockApplicatorItems();
assert.equal(
validators.isApplicatorItems(mock),
true,
)
});
test("Contains", () => {
const mock = mocks.mockContains();
assert.equal(
validators.isContains(mock),
true,
)
});
test("ApplicatorAdditionalProperties", () => {
const mock = mocks.mockApplicatorAdditionalProperties();
assert.equal(
validators.isApplicatorAdditionalProperties(mock),
true,
)
});
test("Properties", () => {
const mock = mocks.mockProperties();
assert.equal(
validators.isProperties(mock),
true,
)
});
test("PatternProperties", () => {
const mock = mocks.mockPatternProperties();
assert.equal(
validators.isPatternProperties(mock),
true,
)
});
test("DependentSchemas", () => {
const mock = mocks.mockDependentSchemas();
assert.equal(
validators.isDependentSchemas(mock),
true,
)
});
test("ApplicatorPropertyNames", () => {
const mock = mocks.mockApplicatorPropertyNames();
assert.equal(
validators.isApplicatorPropertyNames(mock),
true,
)
});
test("If", () => {
const mock = mocks.mockIf();
assert.equal(
validators.isIf(mock),
true,
)
});
test("Then", () => {
const mock = mocks.mockThen();
assert.equal(
validators.isThen(mock),
true,
)
});
test("Else", () => {
const mock = mocks.mockElse();
assert.equal(
validators.isElse(mock),
true,
)
});
test("AllOf", () => {
const mock = mocks.mockAllOf();
assert.equal(
validators.isAllOf(mock),
true,
)
});
test("AnyOf", () => {
const mock = mocks.mockAnyOf();
assert.equal(
validators.isAnyOf(mock),
true,
)
});
test("OneOf", () => {
const mock = mocks.mockOneOf();
assert.equal(
validators.isOneOf(mock),
true,
)
});
test("Not", () => {
const mock = mocks.mockNot();
assert.equal(
validators.isNot(mock),
true,
)
});
test("SchemaArrayItems", () => {
const mock = mocks.mockSchemaArrayItems();
assert.equal(
validators.isSchemaArrayItems(mock),
true,
)
});
test("PropertiesAdditionalProperties", () => {
const mock = mocks.mockPropertiesAdditionalProperties();
assert.equal(
validators.isPropertiesAdditionalProperties(mock),
true,
)
});
test("PatternPropertiesAdditionalProperties", () => {
const mock = mocks.mockPatternPropertiesAdditionalProperties();
assert.equal(
validators.isPatternPropertiesAdditionalProperties(mock),
true,
)
});
test("PatternPropertiesPropertyNames", () => {
const mock = mocks.mockPatternPropertiesPropertyNames();
assert.equal(
validators.isPatternPropertiesPropertyNames(mock),
true,
)
});
test("DependentSchemasAdditionalProperties", () => {
const mock = mocks.mockDependentSchemasAdditionalProperties();
assert.equal(
validators.isDependentSchemasAdditionalProperties(mock),
true,
)
});
test("Unevaluated", () => {
const mock = mocks.mockUnevaluated();
assert.equal(
validators.isUnevaluated(mock),
true,
)
});
test("UnevaluatedItems", () => {
const mock = mocks.mockUnevaluatedItems();
assert.equal(
validators.isUnevaluatedItems(mock),
true,
)
});
test("UnevaluatedProperties", () => {
const mock = mocks.mockUnevaluatedProperties();
assert.equal(
validators.isUnevaluatedProperties(mock),
true,
)
});
test("Validation", () => {
const mock = mocks.mockValidation();
assert.equal(
validators.isValidation(mock),
true,
)
});
test("NonNegativeInteger", () => {
const mock = mocks.mockNonNegativeInteger();
assert.equal(
validators.isNonNegativeInteger(mock),
true,
)
});
test("NonNegativeIntegerDefault0", () => {
const mock = mocks.mockNonNegativeIntegerDefault0();
assert.equal(
validators.isNonNegativeIntegerDefault0(mock),
true,
)
});
test("SimpleTypes", () => {
const mock = mocks.mockSimpleTypes();
assert.equal(
validators.isSimpleTypes(mock),
true,
)
});
test("StringArray", () => {
const mock = mocks.mockStringArray();
assert.equal(
validators.isStringArray(mock),
true,
)
});
test("Type", () => {
const mock = mocks.mockType();
assert.equal(
validators.isType(mock),
true,
)
});
test("Const", () => {
const mock = mocks.mockConst();
assert.equal(
validators.isConst(mock),
true,
)
});
test("Enum", () => {
const mock = mocks.mockEnum();
assert.equal(
validators.isEnum(mock),
true,
)
});
test("MultipleOf", () => {
const mock = mocks.mockMultipleOf();
assert.equal(
validators.isMultipleOf(mock),
true,
)
});
test("Maximum", () => {
const mock = mocks.mockMaximum();
assert.equal(
validators.isMaximum(mock),
true,
)
});
test("ExclusiveMaximum", () => {
const mock = mocks.mockExclusiveMaximum();
assert.equal(
validators.isExclusiveMaximum(mock),
true,
)
});
test("Minimum", () => {
const mock = mocks.mockMinimum();
assert.equal(
validators.isMinimum(mock),
true,
)
});
test("ExclusiveMinimum", () => {
const mock = mocks.mockExclusiveMinimum();
assert.equal(
validators.isExclusiveMinimum(mock),
true,
)
});
test("MaxLength", () => {
const mock = mocks.mockMaxLength();
assert.equal(
validators.isMaxLength(mock),
true,
)
});
test("MinLength", () => {
const mock = mocks.mockMinLength();
assert.equal(
validators.isMinLength(mock),
true,
)
});
test("Pattern", () => {
const mock = mocks.mockPattern();
assert.equal(
validators.isPattern(mock),
true,
)
});
test("MaxItems", () => {
const mock = mocks.mockMaxItems();
assert.equal(
validators.isMaxItems(mock),
true,
)
});
test("MinItems", () => {
const mock = mocks.mockMinItems();
assert.equal(
validators.isMinItems(mock),
true,
)
});
test("UniqueItems", () => {
const mock = mocks.mockUniqueItems();
assert.equal(
validators.isUniqueItems(mock),
true,
)
});
test("MaxContains", () => {
const mock = mocks.mockMaxContains();
assert.equal(
validators.isMaxContains(mock),
true,
)
});
test("MinContains", () => {
const mock = mocks.mockMinContains();
assert.equal(
validators.isMinContains(mock),
true,
)
});
test("MaxProperties", () => {
const mock = mocks.mockMaxProperties();
assert.equal(
validators.isMaxProperties(mock),
true,
)
});
test("MinProperties", () => {
const mock = mocks.mockMinProperties();
assert.equal(
validators.isMinProperties(mock),
true,
)
});
test("Required", () => {
const mock = mocks.mockRequired();
assert.equal(
validators.isRequired(mock),
true,
)
});
test("DependentRequired", () => {
const mock = mocks.mockDependentRequired();
assert.equal(
validators.isDependentRequired(mock),
true,
)
});
test("StringArrayItems", () => {
const mock = mocks.mockStringArrayItems();
assert.equal(
validators.isStringArrayItems(mock),
true,
)
});
test("Type0", () => {
const mock = mocks.mockType0();
assert.equal(
validators.isType0(mock),
true,
)
});
test("Type1", () => {
const mock = mocks.mockType1();
assert.equal(
validators.isType1(mock),
true,
)
});
test("EnumItems", () => {
const mock = mocks.mockEnumItems();
assert.equal(
validators.isEnumItems(mock),
true,
)
});
test("DependentRequiredAdditionalProperties", () => {
const mock = mocks.mockDependentRequiredAdditionalProperties();
assert.equal(
validators.isDependentRequiredAdditionalProperties(mock),
true,
)
});
test("TypeItems", () => {
const mock = mocks.mockTypeItems();
assert.equal(
validators.isTypeItems(mock),
true,
)
});
test("MetaData", () => {
const mock = mocks.mockMetaData();
assert.equal(
validators.isMetaData(mock),
true,
)
});
test("Title", () => {
const mock = mocks.mockTitle();
assert.equal(
validators.isTitle(mock),
true,
)
});
test("Description", () => {
const mock = mocks.mockDescription();
assert.equal(
validators.isDescription(mock),
true,
)
});
test("Default", () => {
const mock = mocks.mockDefault();
assert.equal(
validators.isDefault(mock),
true,
)
});
test("Deprecated", () => {
const mock = mocks.mockDeprecated();
assert.equal(
validators.isDeprecated(mock),
true,
)
});
test("ReadOnly", () => {
const mock = mocks.mockReadOnly();
assert.equal(
validators.isReadOnly(mock),
true,
)
});
test("WriteOnly", () => {
const mock = mocks.mockWriteOnly();
assert.equal(
validators.isWriteOnly(mock),
true,
)
});
test("Examples", () => {
const mock = mocks.mockExamples();
assert.equal(
validators.isExamples(mock),
true,
)
});
test("ExamplesItems", () => {
const mock = mocks.mockExamplesItems();
assert.equal(
validators.isExamplesItems(mock),
true,
)
});
test("FormatAnnotation", () => {
const mock = mocks.mockFormatAnnotation();
assert.equal(
validators.isFormatAnnotation(mock),
true,
)
});
test("Format", () => {
const mock = mocks.mockFormat();
assert.equal(
validators.isFormat(mock),
true,
)
});
test("Content", () => {
const mock = mocks.mockContent();
assert.equal(
validators.isContent(mock),
true,
)
});
test("ContentEncoding", () => {
const mock = mocks.mockContentEncoding();
assert.equal(
validators.isContentEncoding(mock),
true,
)
});
test("ContentMediaType", () => {
const mock = mocks.mockContentMediaType();
assert.equal(
validators.isContentMediaType(mock),
true,
)
});
test("ContentSchema", () => {
const mock = mocks.mockContentSchema();
assert.equal(
validators.isContentSchema(mock),
true,
)
});
