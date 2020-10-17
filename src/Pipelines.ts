import { ExecutionHandler, ExecutionNode, Executor, Hook } from './ExecutionNode';

/**
 * The main execution class, its purpose is to build {@link ExecutionNode}s.
 * It features some default {@link ExecutionHandler}s.
 */
export default class Pipelines<T, U> {
	private executor: Executor<T, U>;
	private hooks?: Hook[];

	/**
	 * Constructor.
	 *
	 * @param {Executor<T, U>} executor The executor used at leaves level in the execution tree.
	 * @param {Hook[]} [hooks] Callbacks to be executed after each {@link ExecutionNode} execution (not only the leaves).
	 */
	constructor(executor: Executor<T, U>, hooks?: Hook[]) {
		this.executor = executor;
		this.hooks = hooks;
	}

	/**
	 * Adds an {@link ExecutionNode} to the tree, the execution node SHOULD NOT be a leaf.
	 *
	 * @param {ExecutionHandler<T, U>} executionHandler The execution handler handling childrens execution.
	 * @param {ExecutionNode<T, U>[]} nodes Childrens to execute.
	 * @returns The newly created {@link ExecutionNode}.
	 */
	public node(
		executionHandler: ExecutionHandler<T, U>,
		nodes: ExecutionNode<T, U>[]
	): ExecutionNode<ExecutionNode<T, U>[], U> {
		return new ExecutionNode(executionHandler, nodes, this.hooks);
	}

	/**
	 * Adds an {@link ExecutionNode} to the tree, the execution node MUST be a leaf.
	 *
	 * @param {ExecutionNode<T, U>} config The config to be passed to the node when it will be executed.
	 * @returns The newly created {@link ExecutionNode}.
	 */
	public exec(config: T): ExecutionNode<T, U> {
		return new ExecutionNode(this.executor, config, this.hooks);
	}

	/**
	 * Create a new {@link Pipelines} with a new default executor but the same hooks.
	 *
	 * @param {Executor<V, W>} executor The new default executor to be used.
	 * @returns The newly created {@link Pipelines}.
	 */
	public with<V, W>(executor: Executor<V, W>): Pipelines<V, W> {
		return new Pipelines(executor, this.hooks);
	}

	/**
	 * Execute a list of {@link ExecutionNode} sequentially.
	 *
	 * @param {ExecutionNode<any, any>[]} nodes The list of nodes to be executed.
	 * @returns The newly created {@link ExecutionNode}.
	 */
	public sequence(nodes: ExecutionNode<any, any>[]): ExecutionNode<ExecutionNode<T, U>[], U> {
		return this.node(executionHandlers.sequence, nodes);
	}

	/**
	 * Execute a list of {@link ExecutionNode} in parallel.
	 *
	 * @param {ExecutionNode<any, any>[]} nodes The list of nodes to be executed.
	 * @returns The newly created {@link ExecutionNode}.
	 */
	public parallel(nodes: ExecutionNode<any, any>[]): ExecutionNode<ExecutionNode<T, U>[], U> {
		return this.node(executionHandlers.parallel, nodes);
	}
}

/**
 * Default {@link ExecutionHandler}s used in {@link Pipelines}.
 *
 * @param {ExecutionNode<any, any>[]} nodes The list of nodes to be executed.
 */
export const executionHandlers: Record<string, ExecutionHandler<any, any>> = {
	sequence: async nodes => {
		const outputs = [];

		for (const node of nodes) {
			outputs.push(await node.execute());
		}

		return outputs;
	},
	parallel: nodes => {
		return Promise.all(nodes.map(node => node.execute()));
	},
};
