import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const hostname = '127.0.0.1';
const port = 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wasmFilePath = path.join(__dirname, '..', 'wasm_calculator', 'target', 'wasm32-wasi', 'release', 'wasm_calculator.wasm');
const wasmBinary = fs.readFileSync(wasmFilePath);
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

app.get('/fibonacci', (req, res) => {	
  const num = parseInt(req.query.num, 10);
  const result = wasmInstance.exports.fibonacci(num);
  res.json(result.toString());
});


app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});