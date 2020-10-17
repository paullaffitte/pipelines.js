# pipelines.js

Typescript pipeline tree execution.

## Goal

The goal of pipelines.js is to provide an **easy to use** framework to build **execution trees** and, of course, execute it.

## Getting started

### Installation

```sh
$ npm i @paullaffitte/pipelines.js
# or
$ yarn add @paullaffitte/pipelines.js
```

### Principle, concepts and examples

#### Pipelines class

You start with the base class `Pipelines`. It's using the [design pattern *builder*](https://refactoring.guru/design-patterns/builder) to help creating your execution tree. When instanciating it, you can provide a `Executor` and `Hooks`.

```js
const Pipelines = require('@paullaffitte/pipelines.js');

// This executor will returns its calculated duration after a defined duration
const defaultExecutor = async config => {
  return new Promise(resolve => {
    const start = Date.now();
    setTimeout(() => resolve(Date.now() - start), config.duration);
  });
};

// A list of hooks to use in the execution tree
const hooks = [
  node => {
    const { config, output } = node;

    // You can treat your nodes differently dependings on what you node is to trigger different actions
    if (typeof config.index == 'number') {
      // Here we log the index of the node and its calculated duration (the index is not built-in, its from the node configuration, see the example below)
      console.log(`${config.index} done (${output}ms)`);
    }
  },
];

const pp = new Pipelines(defaultExecutor, hooks);
```

#### Some concepts

An `Executor` is something that given a `ExecutionNode` will produce a `Result`.

A `Hook` is something that will produce an action following an `Executor` execution.

An `ExecutionNode` is a part of the execution tree, it contains an `Executor` and a configuration, its configuration can be anything.

Some `ExecutionNode` will be leaves, some other will be non-leaves :

- Leaves will be executed given the default executor or a custom one if any was given before execution using the function `pp.with` (see documentation).
- Non-leaves will always use a custom executor and their confguration will always be a list of nodes to execute. It will handle how the nodes are executed. For instance, with the function `pp.parallel`, you can trigger a parallel execution of the given nodes. You can create your own non-leaves nodes types with the function `pp.node`. For example, you could need a execution where you execute your nodes serially until one fail (which is not what `pp.serial` is doing, it will execute all nodes serially whether some fail or not).

A `Result` can be anything that an `Executor` should return.

#### Creating and executing an execution tree

Once your `Pipelines` object is correctly configured, you can start to create your execution tree.

```js
// Using the executor in the example above, we want to execute those nodes
const executionList = [
  pp.exec({ index: 1, duration: 500 }),
  pp.exec({ index: 2, duration: 300 }),
  pp.exec({ index: 3, duration: 100 }),
];

// Our main execution tree will be sequential using the built-in function .sequence
const executionTree = pp.sequence([
  // Change the default executor to log something a different points in the execution
  pp.with(console.log).exec('Parallel pipelines'),
  // We execute the previously defined execution tree in parallel
  pp.parallel(executionList),
  // Another logging
  pp.with(console.log).exec('Sequencial pipelines'),
  // We execute the previously defined execution tree serially
  pp.sequence(executionList),
]);
```

You can then execute the tree you just built. All values returned but the executors will be returned as a result tree.

```js
executionTree.execute().then(resultTree => {
  console.log(JSON.stringify(resultTree, null, 2));
});
```

When executed, we expect this tree to have the following output.

```
Parallel pipelines
3 done (100ms)
2 done (300ms)
1 done (500ms)
Sequencial pipelines
1 done (500ms)
2 done (300ms)
3 done (100ms)
[
  null,
  [
  500,
  300,
  100
  ],
  null,
  [
  500,
  300,
  100
  ]
]
```

See how you can find the values returned by our default executor at the leaves of the result tree.

This example was taken from [tests](./test/pipelines_test.ts), I recommend you to read them and run them if you want to get a better understanding.

### Documentation

In order to generate the documentation, please run the following commands.

```sh
$ git clone git@github.com:paullaffitte/pipelines.js.git
$ cd pipelines.js
$ npm install
$ npm run docs
```

And then open `./docs/index.html`.
