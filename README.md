# Todo

## Structure
```
todo/
├── app/                   : Application files
│   ├── _sass/             : Stylesheets
│   ├── js/                : Scripts
│   └── img/               : Images
│       └── _sprites/      : Base images for spritesheet
├── dist/                  : Distributed files (Not tracked in Git)
├── grunt/                 : Grunt config scripts
│   ├── aliases.js         : Task registration script
│   └── xxxxx.js           : Separated Grunt task
├── package.json           : Development packages installed by npm
├── bower.json             : Front-end packages installed by bower
├── README.md              : Readme document for the project
└── Gruntfile.js           : Base Grunt config
```

### Naming rules
* Directories begin with `_` aren't copied to "dist" directory. - e.g. `_sass`
* Files begin with `_` aren't compiled by themselves. They work as partials for import. - e.g. `_scaffolding.scss`

## Getting started
This project uses [Grunt](http://gruntjs.com/) as task runner, and [Bower](http://bower.io/) as front-end package manager.  
You have to set them up on your PC, before start development.

### 1. Install Node.js
[Download from Node.js website](https://nodejs.org/), or install via package management software.

### 2. Install Bower

```sh
$ npm install -g bower
```

### 3. Install dependencies
Run the install command in the project root directory.

```sh
$ cd path/to/todo
$ npm install && bower install
```

## Build tasks
* **`npm start`**  
  Start local development server and watch files to compile/lint.  
  [Cntl + C] to exit.

* **`npm test`**  
  Run linter.

* **`npm run build`**  
  Build app for production.

* **`npm run serve:dist`**  
  Start server with production files.

* **`npm run grunt <task>`**  
  Run individual Grunt task.

See "grunt/aliases.js" for more details or customizing the tasks.

## Library management
See the [Bower document](http://bower.io/#usage) for details.

### Install
* **`bower install --save <package>`**  
  Install a package.

* **`bower install --save <package>#<version>`**  
  Install a specific version of package.

Library will be injected into your HTML by [grunt-wiredep](https://github.com/stephenplusplus/grunt-wiredep).
You don't need to update the reference manually.

### Search packages
[Bower - Search](http://bower.io/search/)

----

This project is created on 2016-08-02 using [generator-rff](https://github.com/rakuten-frontend/generator-rff) v1.0.1.
