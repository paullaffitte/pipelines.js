import { ExecutionHandler, ExecutionNode, Executor } from './ExecutionNode';

export default class Pipelines<T, U> {

	executor: Executor<T, U>;

	constructor(executor: Executor<T, U>) {
		this.executor = executor;
	}

	public node(executionHandler: ExecutionHandler<T, U>, nodes: ExecutionNode<T, U>[]) {
		return new ExecutionNode({
			executionHandler,
			executor: this.executor,
			nodes
		});
	}

	public exec(config: T): ExecutionNode<T, U> {
		return new ExecutionNode<T, U>({ executor: this.executor, config});
	}

	public with<V, W>(executor: Executor<V, W>) {
		return new Pipelines(executor);
	}

	public sequence(nodes: ExecutionNode<any, any>[]) {
		return this.node(executionHandlers.sequence, nodes);
	}

	public parallel(nodes: ExecutionNode<any, any>[]) {
		return this.node(executionHandlers.parallel, nodes);
	}
}

export const executionHandlers: Record<string, ExecutionHandler<any, any>> = {
	sequence: async (nodes) => {
		const outputs = [];

		for (const node of nodes) {
			outputs.push(await node.execute());
		}

		return outputs;
	},
	parallel: (nodes) => {
		return Promise.all(nodes.map(node => node.execute()));
	}
};
