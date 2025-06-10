use heck::*;
use proc_macro::TokenStream;
use std::env;

struct TestSpecificationsInput {
  specification_directory: syn::LitStr,
  _comma: syn::Token![,],
  generated_directory: syn::LitStr,
}

impl syn::parse::Parse for TestSpecificationsInput {
  fn parse(input: syn::parse::ParseStream) -> syn::parse::Result<Self> {
    Ok(TestSpecificationsInput {
      specification_directory: input.parse()?,
      _comma: input.parse()?,
      generated_directory: input.parse()?,
    })
  }
}

#[proc_macro]
pub fn test_specifications(input: TokenStream) -> TokenStream {
  let TestSpecificationsInput {
    specification_directory,
    generated_directory,
    ..
  } = syn::parse_macro_input!(input as TestSpecificationsInput);
  let specification_directory = specification_directory.value();
  let specification_directory = env::current_dir().unwrap().join(specification_directory);
  let generated_directory = generated_directory.value();
  let generated_directory = env::current_dir().unwrap().join(generated_directory);

  let tests = specification_directory
    .read_dir()
    .unwrap()
    .filter_map(|entry| {
      let entry = entry.ok()?;
      let path = entry.path();
      let extension = path.extension()?;
      let extension = extension.to_ascii_lowercase();

      if !(extension == "json" || extension == "yaml" || extension == "yml") {
        return None;
      }

      let is_dir = entry.file_type().unwrap().is_dir();
      if is_dir {
        return None;
      }

      let name = path.file_name()?;
      let name = name.to_str()?;
      let name = name.to_snake_case();

      let path = path.to_str()?;

      let generated_directory = generated_directory.join(name.clone());
      let generated_directory = generated_directory.to_str();

      Some(quote::quote! {
        jns42_macros::test_specification!(#name, #path, #generated_directory);
      })
    })
    .collect::<Vec<_>>();

  quote::quote! {
    #(#tests)*
  }
  .into()
}

struct TestSpecificationInput {
  name: syn::LitStr,
  _comma: syn::Token![,],
  path: syn::LitStr,
  _comma1: syn::Token![,],
  target: syn::LitStr,
}

impl syn::parse::Parse for TestSpecificationInput {
  fn parse(input: syn::parse::ParseStream) -> syn::parse::Result<Self> {
    Ok(TestSpecificationInput {
      name: input.parse()?,
      _comma: input.parse()?,
      path: input.parse()?,
      _comma1: input.parse()?,
      target: input.parse()?,
    })
  }
}

#[proc_macro]
pub fn test_specification(input: TokenStream) -> TokenStream {
  let TestSpecificationInput {
    name, path, target, ..
  } = syn::parse_macro_input!(input as TestSpecificationInput);
  let name = name.value();
  let path = path.value();
  let fname = quote::format_ident!("r#{}", name);

  quote::quote! {
    #[tokio::test]
    async fn #fname() {
      let _ = std::fs::remove_dir_all(#path);

      let mut context = std::rc::Rc::new(jns42_core::documents::DocumentContext::default());
      context.register_well_known_factories().unwrap();

      let schema_location: jns42_core::utilities::NodeLocation = #path.try_into().unwrap();
      context
        .load_from_location(
          schema_location.clone(),
          schema_location.clone(),
          None,
          &jns42_core::documents::draft_2020_12::META_SCHEMA_ID,
        )
        .await
        .unwrap();

      let specification = crate::models::Specification::new(
        &context,
        crate::models::SpecificationConfiguration {
          default_type_name: "schema-document".into(),
          transform_maximum_iterations: 100,
        },
      );

      crate::generators::package::generate_package(
        crate::generators::package::PackageConfiguration {
          package_name: #name,
          package_version: "0.1.0",
          package_directory: &std::path::PathBuf::from(#target),
          entry_location: &schema_location,
        },
        &specification,
      )
      .await.unwrap();

      let mut child = std::process::Command::new("cargo")
        .current_dir(#target)
        .arg("test")
        .spawn()
        .unwrap();
      let status = child.wait().unwrap();
      assert!(status.success());
    }
  }
  .into()
}
