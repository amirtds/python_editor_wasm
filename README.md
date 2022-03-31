# Running Python in the browser using pyodide and codemirror

## Problem 

Let's say you want to teach a Python course. To make your course more interesting and fun, after each lesson you created an excerise for your students, so they can practice what they learned.
The issue is that the students need to prepare an environment by installing specific version of Python and all the necesarry packages and libraries. This can consume a lot of time, effort.

## Solution

By adding a Python editor in the course content that can run Python code in the client side (in this case browser) and show the result to the users.

## Running code in the browser

 I know the idea of accepting code from the user and then executing it can make your blood run cold. We as software developers during the past couple of years worked really hard to secure our application to prevent code injection attacks and to don't let user's input be executable.


 ### Webassembly

Based on the definition in [Mozilla Developer Docs](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts#what_is_webassembly) WebAssembly (WASM) is:

> A new type of code that can be run in modern web browsers and provides new features and major gains in performance. It is not primarily intended to be written by hand, rather it is designed to be an effective compilation target for source languages like C, C++, Rust, etc.

So WASM let us to run code written in different languages (not only Javascript) in the browser with the following benefits:
- Be fast, efficent and portable.
- Keep secure by running the code in a safe, sandbox execution environment.
- It can be run in client side, so in our example above we don't need to worry if the users run the code in our server and we don't need to be worried if thousands of students try the practice code.

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

Before continuing let's make sure we have good understanding of basic concepts of Pyodide.

**Installing**

We can install Pyodide using:

- CDN
- Downloading it from [Github](https://github.com/pyodide/pyodide/releases)
- [Building Pyodide by yourself using](https://pyodide.org/en/stable/usage/downloading-and-deploying.html#downloading-deploying)

**loadPyodide**

Is a function that loads and initializes Pyodide wasm module.

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

```