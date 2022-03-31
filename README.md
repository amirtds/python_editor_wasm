# Running Python in the browser using Pyodide and codemirror


## Problem 

Let's say you want to teach a Python course. To make your course more interesting and fun, after each lesson you created an exercise for your students, so they can practice what they learned.
The issue is that the students need to prepare an environment by installing a specific version of Python and all the necessary packages and libraries. This can consume a lot of time, effort.

## Solution

By adding a Python editor in the course content that can run Python code on the client-side (in this case browser) and show the result to the users.

## What will you build after finishing this tutorial?

You get to build an [editor](https://python-browser-editor.onrender.com) that can execute Python code in the browser.

<iframe src=https://python-browser-editor.onrender.com" width="100%" height="800px"></iframe>

## Running code in the browser

 I know the idea of accepting code from the user and then executing it can make your blood run cold. We as software developers during the past couple of years worked hard to secure our application to prevent code injection attacks and to don't let user's input be executable.

 ### Webassembly

Based on the definition in [Mozilla Developer Docs](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts#what_is_webassembly) WebAssembly (WASM) is:

> A new type of code that can be run in modern web browsers and provides new features and major gains in performance. It is not primarily intended to be written by hand, rather it is designed to be an effective compilation target for source languages like C, C++, Rust, etc.

So WASM let us run code written in different languages (not only Javascript) in the browser with the following benefits:
- Be fast, efficient, and portable.
- Keep secure by running the code in a safe, sandbox execution environment.
- It can be run on the client-side, so in our example, above we don't need to worry if the users run the code on our server and we don't need to be worried if thousands of students try the practice code.

### [Pyodide](https://pyodide.org/en/stable/index.html)

Pyodide is a distribution made by Mozilla that uses cpython-emscripten to convert python code to WASM. By using Pyodide we can run python code in the browser and we can even use python packages. Pyodide comes with some [pre-installed packages](https://github.com/pyodide/pyodide/tree/main/packages) and we can also use [Micropip](https://pyodide.org/en/stable/usage/api/micropip-api.html) to use even more packages that don't come by default.

## Create Python code Editor

In this section of the tutorial we will create a simple Python editor that can run code in the browser using:
- [Pyodide](https://pyodide.org/en/stable/index.html)
- [Codemirror](https://codemirror.net/)
- [Flask](https://flask.palletsprojects.com/en/2.1.x/)

Let's create a new project

```bash
$ mkdir python_editor_wasm
$ cd python_editor_wasm
```

Create and activate a virtual environment.

```bash
$ virtualenv wasm_env
$ source wasm_env/bin/activate
```

Install the packages we need.

```bash
$ pip install Flask
```

In the root of the project create a file called `app.py` and add the following code:

```python
from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
```

Let's create a `templates` folder in the root of our project and under it add `index.html` file.

### Pyodide

Before continuing let's make sure we have a good understanding of the basic concepts of Pyodide.

**Installing**

We can install Pyodide using:

- CDN
- Downloading it from [Github](https://github.com/pyodide/pyodide/releases)
- [Building Pyodide by yourself using](https://pyodide.org/en/stable/usage/downloading-and-deploying.html#downloading-deploying)

**loadPyodide**

Is a function that loads and initializes the Pyodide wasm module.

```js
let pyodide = await loadPyodide({ indexURL : "https://cdn.jsdelivr.net/pyodide/v0.19.1/full/" });
```

> `indexURL` is the URL from where Pyodide will load python packages.

**pyodide.runPython**

is the function that runs python code. It takes a python code as a string and returns the result of the code.


```js
console.log(pyodide.runPython(`print("Hello World")`));
```

Ok, let's go back to our project. paste the following in the `templates/index.html` file:

```html
<!doctype html>
<html class="h-full bg-slate-900">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- installing tailwindcss from cdn, don't do this for production application -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- installing pyodide version 0.19.1 -->
  <script src="https://cdn.jsdelivr.net/pyodide/v0.19.1/full/pyodide.js"></script>
  <!-- importing codemirror stylings -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.min.css" />
  <!-- installing codemirror.js version /5.63.3 from cdn -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.3/codemirror.min.js"
  integrity="sha512-XMlgZzPyVXf1I/wbGnofk1Hfdx+zAWyZjh6c21yGo/k1zNC4Ve6xcQnTDTCHrjFGsOrVicJsBURLYktVEu/8vQ=="
  crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <!-- installing codemirror python language support -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.3/mode/python/python.min.js"
  integrity="sha512-/mavDpedrvPG/0Grj2Ughxte/fsm42ZmZWWpHz1jCbzd5ECv8CB7PomGtw0NAnhHmE/lkDFkRMupjoohbKNA1Q=="
  crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <!-- import codemirror dracula theme styles from cdn -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.3/theme/dracula.css"/> 
  <style>
      /* set codemirror ide height to 100% of the textaread */
      .CodeMirror {
          height: 100%;
      }
  </style>
</head>
<body class="h-full overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
    <p class="text-slate-200 text-3xl my-4 font-extrabold mx-2 pt-8">Run Python in your browser</p>
    <div class="h-3/4 flex flex-row">
        <div class="grid w-2/3 border-dashed border-2 border-slate-500 mx-2">
            <!-- our code editor, where codemirror renders it's editor -->
            <textarea id="code" name="code" class="h-full"></textarea>
        </div>
        <div class="grid w-1/3 border-dashed border-2 border-slate-500 mx-2">
            <!-- output section where we show the stdout of the python code execution -->
            <textarea class="p-8 text-slate-200 bg-slate-900" id="output" name="output"></textarea>
        </div>
    </div>
    <!-- Run button to pass the code to pyodide.runPython() -->
    <button onclick="evaluatePython()" type="button" class="mx-2 my-4 h-12 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 text-slate-300">Run</button>
    <!-- Cleaning the output section -->
    <button onclick="clearHistory()" type="button" class="mx-2 my-4 h-12 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-700 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 text-slate-300">Clear History</button>

    <script src="/static/js/main.js"></script>
</body>
</html>
```

In the head of the `index.html` file, we imported Tailwind CSS for styling, Pyodide.js version `0.19.1`, and codemirror and its dependencies. 


```html
  <!-- installing tailwindcss from cdn, don't do this for production application -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- installing pyodide version 0.19.1 -->
  <script src="https://cdn.jsdelivr.net/pyodide/v0.19.1/full/pyodide.js"></script>
  <!-- importing codemirror stylings -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.min.css" />
  <!-- installing codemirror.js version /5.63.3 from cdn -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.3/codemirror.min.js"
  integrity="sha512-XMlgZzPyVXf1I/wbGnofk1Hfdx+zAWyZjh6c21yGo/k1zNC4Ve6xcQnTDTCHrjFGsOrVicJsBURLYktVEu/8vQ=="
  crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <!-- installing codemirror python language support -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.3/mode/python/python.min.js"
  integrity="sha512-/mavDpedrvPG/0Grj2Ughxte/fsm42ZmZWWpHz1jCbzd5ECv8CB7PomGtw0NAnhHmE/lkDFkRMupjoohbKNA1Q=="
  crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <!-- import codemirror dracula theme styles from cdn -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.63.3/theme/dracula.css"/> 
  <style>
  ```

  Our UI has 3 important compnents:
  - **editor**: Where users can write python code there. It's a `textarea` HTML element with the id of `code`. When we initialize `codemirror` we let it know that we want to use this element as a code editor.
  - **output**: Where the output of the code will be displayed. It's a `textarea` element with the id of `output`. When `pyodide` runs our python code it will output the result to this element. We show the error messages in this element as well.
  - **Run button**: When users click on this button we grab the value of the `code` element and pass it as a string to `pyodide.runPython`. When `pyodide.runPython` returns the result we display it in the `output` element.


```html
<!-- our code editor, where codemirror renders it's editor -->
<textarea id="code" name="code" class="h-full"></textarea>
<!-- output section where we show the stdout of the python code execution -->
<textarea class="p-8 text-slate-200 bg-slate-900" id="output" name="output"></textarea>
<!-- Run button to pass the code to pyodide.runPython() -->
<button onclick="evaluatePython()" type="button" class="mx-2 my-4 h-12 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-700 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 text-slate-300">Run</button>
```

Now in the root of our project let's create `static/js` folders and under the `js` create a new file called `main.js`. This file takes care of the following

- Initializing Codemirror with support for python language and dracula theme
- Initializing Pyodide
- A function that executes when the user clicks on the `Run` button, it takes the value of the `code` element and passes it to `pyodide.runPython` and displays the result in the `output` element.
- A function that clears the `output` element when the user clicks on the `Clear History` button.

```js
// find the output element
const output = document.getElementById("output");
// initializing the codemirror and pass configuration to support python and dracula theme
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
// set the initial value of the editor
editor.setValue("print('Hello world')");
output.value = "Initializing...\n";

// Add pyodide returned value to the output
function addToOutput(stdout) {
  output.value += ">>> " + "\n" + stdout + "\n";
}

// Clean the output section
function clearHistory() {
  output.value = "";
}

// init Pyodide and show sys.version when it's loaded successfully
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
// run the main funciton
let pyodideReadyPromise = main();

// pass the editor value to the pyodide.runPython function and show the result in the output section
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
```

## Conclusion

In this article, we barely touched the tip of the iceberg. We saw how we can use WASM to run python code in the browser but Webassembly covers broader use cases.

Our deployment platforms are more varied than ever and we simply cannot afford the time and money to rewrite software for multiple platforms constantly. Webassembly can impact the worlds of client-side web development, server-side development, games, education, cloud computing, mobile platforms, IoT, serverless, and many more.

Webassembly goal is to deliver a software that is:

- **Fast**
- **Safe**
- **Portable**
- **Compact**