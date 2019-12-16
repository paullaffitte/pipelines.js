import { ExecutionHandler, ExecutionNode, Executor, Hook } from './ExecutionNode';

export default class Pipelines<T, U> {
	private executor: Executor<T, U>;
	private hooks?: Hook[];

	constructor(executor: Executor<T, U>, hooks?: Hook[]) {
		this.executor = executor;
		this.hooks = hooks;
	}

	public node(
		executionHandler: ExecutionHandler<T, U>,
		nodes: ExecutionNode<T, U>[]
	): ExecutionNode<ExecutionNode<T, U>[], U> {
		return new ExecutionNode(executionHandler, nodes, this.hooks);
	}

	public exec(config: T): ExecutionNode<T, U> {
		return new ExecutionNode(this.executor, config, this.hooks);
	}

	public with<V, W>(executor: Executor<V, W>): Pipelines<V, W> {
		return new Pipelines(executor, this.hooks);
	}

	public sequence(nodes: ExecutionNode<any, any>[]): ExecutionNode<ExecutionNode<T, U>[], U> {
		return this.node(executionHandlers.sequence, nodes);
	}

	public parallel(nodes: ExecutionNode<any, any>[]): ExecutionNode<ExecutionNode<T, U>[], U> {
		return this.node(executionHandlers.parallel, nodes);
	}
}

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
