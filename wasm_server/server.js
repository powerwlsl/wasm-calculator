import express from 'express';
import fs from 'fs';

const hostname = '127.0.0.1';
const port = 3000;
const app = express();
const wasmBinary = fs.readFileSync('../wasm_calculator/target/wasm32-wasi/release/wasm_calculator.wasm');
const wasmModule = new WebAssembly.Module(wasmBinary);

const imports = {
	wasi_snapshot_preview1: {
		fd_write: (fd, iovs, iovs_len, nwritten) => {
			return 0;
		},
		environ_get: (environ, environ_buf) => {
			return 0;
		},
		environ_sizes_get: (environ_count, environ_buf_size) => {
			return 0;
		},
		proc_exit: (status) => {
		}
	}
};
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);

app.get('/add', (req, res) => {	

  const a = parseInt(req.query.a, 10);
  const b = parseInt(req.query.b, 10);
  const result = wasmInstance.exports.add(a, b);
  res.json(result);
});


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
