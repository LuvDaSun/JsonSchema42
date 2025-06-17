build-all: \
  build-cargo-jns42-core \
  build-cargo-jns42-generator \
  build-npm-jns42-core \
  build-npm-jns42-generator \
  build-npm-jns42-lib \


install-all: \

  npm install


build-cargo-jns42-core: \

  cargo build --package jns42-core --target wasm32-unknown-unknown --release

  wasm-tools component new \
    --output target/wasm32-unknown-unknown/release/jns42_core.component.wasm \
    target/wasm32-unknown-unknown/release/jns42_core.wasm \

build-cargo-jns42-generator: \

  cargo build --package jns42-generator --release

build-npm-jns42-core: \
  build-cargo-jns42-core \

  npm --workspace @jns42/core run generate

build-npm-jns42-generator: \
  build-npm-jns42-lib \
  build-npm-jns42-core \

  npm --workspace @jns42/generator run compile
  npm --workspace @jns42/generator run bundle

build-npm-jns42-lib: \

  npm --workspace @jns42/lib run compile
  npm --workspace @jns42/lib run bundle

