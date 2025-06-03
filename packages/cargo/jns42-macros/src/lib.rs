use heck::*;
use proc_macro::TokenStream;
use std::env;

#[proc_macro]
pub fn test_specifications(input: TokenStream) -> TokenStream {
  let input_str = syn::parse_macro_input!(input as syn::LitStr);
  let dir_path = input_str.value();
  let dir_path = env::current_dir().unwrap().join(dir_path);
  let tests = dir_path
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

      Some(quote::quote! {
        jns42_macros::test_specification!(#name);
      })
    })
    .collect::<Vec<_>>();

  quote::quote! {
    #(#tests)*
  }
  .into()
}

#[proc_macro]
pub fn test_specification(input: TokenStream) -> TokenStream {
  let input_str = syn::parse_macro_input!(input as syn::LitStr);
  let name = input_str.value();
  let identifier = quote::format_ident!("r#{}", name);

  quote::quote! {
    #[test]
    fn #identifier() {
      //
    }
  }
  .into()
}
