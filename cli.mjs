import fetch from 'node-fetch';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let num1, num2;
promptForFirstNumber();

function promptForFirstNumber() {
  rl.question('Enter the first number: ', (input) => {
    num1 = Number(input);
    if (isNaN(num1)) {
      console.error('Please provide a valid number.');
      promptForFirstNumber();
    } else {
      promptForSecondNumber();
    }
  });
}

function promptForSecondNumber() {
  rl.question('Enter the second number: ', (input) => {
    num2 = Number(input);
    if (isNaN(num2)) {
      console.error('Please provide a valid number.');
      promptForSecondNumber();
    } else {
      promptForExecutionMode();
    }
  });
}

function promptForExecutionMode() {
  rl.question('Do you want to run on server or local? (Type "server" or "local"): ', (mode) => {
    if (mode === 'server') {
      computeOnServer();
      rl.close();
    } else if (mode === 'local') {
      computeLocally();
      rl.close();
    } else {
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
  fetch(`http://127.0.0.1:3000/add?a=${num1}&b=${num2}`)
      .then(response => response.json())
      .then(data => {
          console.log(`The sum of ${num1} and ${num2} is ${data}.`);
      })
      .catch(error => {
          if (error.code === 'ECONNREFUSED') {
              console.error('The server is not running. Please start the server and try again.');
          }
      });
}

function computeLocally() {
  const wasmBinary = fs.readFileSync('./wasm_calculator/target/wasm32-wasi/release/wasm_calculator.wasm');
  const wasmModule = new WebAssembly.Module(wasmBinary);
  const wasmInstance = new WebAssembly.Instance(wasmModule, imports);

  const result = wasmInstance.exports.add(num1, num2);
  console.log(`The sum of ${num1} and ${num2} is ${result}.`);
}