import fetch from 'node-fetch';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let num;
let serverInUse = false;

promptForNumber();

function promptForNumber() {
  rl.question('Enter a number: ', (input) => {
    num = Number(input);
    if (isNaN(num)) {
      console.error('Please provide a valid number.');
      promptForNumber();
    } else {
      promptForExecutionMode();
    }
  });
}


function promptForExecutionMode() {
  rl.question('Do you want to run on server or local? (Type "server" or "local". Or press enter to let the program decide.): ', (mode) => {
    if (mode === 'server') {
      computeOnServer();
      rl.close();
    } else if (mode === 'local') {
      computeLocally();
      rl.close();
    } else if (mode === '') {
      negotiateComputation();
      rl.close();
    } else  {
      console.error('Please choose a valid mode ("server" or "local").');
      promptForExecutionMode();
    }
  });
}

const imports = {
  wasi_snapshot_preview1: {
    fd_write: (fd, iovs, iovs_len, nwritten) => {
      console.log('fd_write called');
      return 0;
    },
    environ_get: (environ, environ_buf) => {
      console.log('environ_get called');
      return 0;
    },
    environ_sizes_get: (environ_count, environ_buf_size) => {
      console.log('environ_sizes_get called');
      return 0;
    },
    proc_exit: (status) => {
      console.log('proc_exit called with status:', status);
    }
  }
};


function computeOnServer() {
  serverInUse = true;
  fetch(`http://127.0.0.1:3000/fibonacci?num=${num}`)
      .then(response => response.json())
      .then(result => {
          const fibNumber = BigInt(result);
          console.log(`The ${num}th fibonacci number is ${fibNumber}.`);
      })
      .catch(error => {
          if (error.code === 'ECONNREFUSED') {
              console.error('The server is not running. Please start the server and try again.');
              computeLocally();
          } else {
              console.error('An error occurred:', error);
          }
      })
      .finally(() => {
          serverInUse = false; 
      });
}

function computeLocally() {
  const wasmBinary = fs.readFileSync('./wasm_calculator/target/wasm32-wasi/release/wasm_calculator.wasm');
  const wasmModule = new WebAssembly.Module(wasmBinary);
  const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
  const result = wasmInstance.exports.fibonacci(num);
  
  
  console.log(`The ${num}th fibonacci number is ${result}.`);
}


function negotiateComputation(num) {
  const threshold = 20;
  
  if (num < threshold || serverInUse) {
    computeLocally();
  } else {
    computeOnServer();
  }
}
