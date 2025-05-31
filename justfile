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


package-specification-npm +FILES: \
  build-npm-jns42-generator \

  #!/usr/bin/env bash

  set -e

  export FILES="{{FILES}}"

  for FILE in ${FILES}; do
    export NAME=${FILE%.*};

    echo ${NAME}

    node ./packages/npm/jns42-generator/bundled/program.js package \
      ./fixtures/specifications/${FILE} \
      --package-directory ./packages/npm/jns42-generator/.generated/${NAME} \
      --package-name ${NAME} \
      --package-version "0.0.0" \

  done;

package-specification-cargo +FILES: \
  build-cargo-jns42-generator \

  #!/usr/bin/env bash

  set -e

  export FILES="{{FILES}}"

  for FILE in ${FILES}; do
    export NAME=${FILE%.*};

    echo ${NAME}

    cargo run --package jns42-generator package \
      ./fixtures/specifications/${FILE} \
      --package-directory ./packages/cargo/jns42-generator/.generated/${NAME} \
      --package-name ${NAME} \
      --package-version "0.0.0" \

  done;

test-fixture-npm +FILES: \
  build-npm-jns42-generator \

  #!/usr/bin/env bash

  set -e

  export FILES="{{FILES}}"

  for FILE in ${FILES}; do
    export NAME=${FILE%.*};

    echo ${NAME}

    node ./packages/npm/jns42-generator/bundled/program.js test \
      ./fixtures/testing/${FILE} \
      --package-directory ./packages/npm/jns42-generator/.generated/${NAME} \
      --package-name ${NAME} \
      --package-version "0.0.0" \

  done;

package-specification-npm-all: \

  just package-specification-npm $(ls fixtures/specifications)

package-specification-cargo-all: \

  just package-specification-cargo $(ls fixtures/specifications)

test-fixture-npm-all: \

  just test-fixture-npm $(ls fixtures/testing)
