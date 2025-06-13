pub mod documents;
pub mod models;
pub mod naming;
pub mod schema_transforms;
pub mod utilities;

#[cfg(target_arch = "wasm32")]
wit_bindgen::generate!({
    world: "core",
    path: "../../../wit"
});

#[cfg(target_arch = "wasm32")]
export!(Host);

#[cfg(target_arch = "wasm32")]
struct Host;
