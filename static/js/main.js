const output = document.getElementById("output");
const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
              mode: {
                  name: "python",
                  version: 3,
                  singleLineStringErrors: false,
              },
              theme: "dracula",
              lineNumbers: true,
              indentUnit: 4,
              matchBrackets: true,
            });
editor.setValue("print('Hello world')");
output.value = "Initializing...\n";

function addToOutput(stdout) {
  output.value += ">>> " + editor.getValue() + "\n" + stdout + "\n";
}

function clearHistory() {
  output.value = "";
}

// init Pyodide
async function main() {
  let pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.19.1/full/",
  });
  output.value = pyodide.runPython(`
      import sys
      sys.version
  `);
  output.value += "\n" + "Python Ready !" + "\n";
  return pyodide;
} 
let pyodideReadyPromise = main();

async function evaluatePython() {
  let pyodide = await pyodideReadyPromise;
  try {
    pyodide.runPython(`
      import io
      sys.stdout = io.StringIO()
      `);
    let result = pyodide.runPython(editor.getValue());
    let stdout = pyodide.runPython("sys.stdout.getvalue()");
    addToOutput(stdout);
  } catch (err) {
    addToOutput(err);
  }
}