## Quick start

### Build the WebAssembly (WASM) file
Execute the following command to compile the Rust code into a WASM binary using the `wasm32-wasi` target. This creates the WASM file needed for both the server and the client.

```
cargo build --target wasm32-wasi --release --manifest-path=./wasm_calculator/Cargo.toml
```

### Start the server
Run the Node.js server that will handle computations on the server side. Make sure to execute this command from the project's root directory.

```
node wasm_server/server.js
```

### Run cli
Launch the client interface, which will prompt you to enter a number and choose whether to compute the result locally or on the server.
```
node cli.mjs
```
