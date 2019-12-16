import { ExecutionHandler, ExecutionNode, Executor } from './ExecutionNode';

function newPipelineBuilder(config: Record<string, ExecutionHandler<any, any>>, executor: Executor<any>) {
	const pp: Record<string, (arg: any) => ExecutionNode<any, any>> = {}

	for (const key in config) {
		pp[key] = (nodes: Array<ExecutionNode<any, any>>) => new ExecutionNode({
			executionHandler: config[key],
			executor,
			nodes
		});
	}

	pp.exec = (config) => new ExecutionNode({ executor, config });

	return pp;
};

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

export default function pipelines(executor: Executor<any>, config: Record<string, ExecutionHandler<any, any>> = {}) {
	const mergedConfig = { ...executionHandlers, ...config };
	const executorUpdater = (newExecutor: Executor<any>) => newPipelineBuilder(mergedConfig, newExecutor);
	const pp = newPipelineBuilder(mergedConfig, executor);

	return Object.assign(executorUpdater, pp);
}
