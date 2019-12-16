type Result<T> = T | Promise<T>;

export type Executor<T, U> = (config: T) => Result<U>;

export type ExecutionHandler<T, U> = ((nodes: ExecutionNode<T, U>[]) => Result<U>);

type ExecutionVertexConfig<T, U> = {
	executionHandler: ExecutionHandler<T, U>,
	nodes: ExecutionNode<T, U>[]
};

type ExecutionLeaveConfig<T, U> = {
	executor: Executor<T, U>,
	config: T
};

type ExecutionNodeConfig<T, U> = (
	ExecutionVertexConfig<T, U>
	| ExecutionLeaveConfig<T, U>
);

export class ExecutionNode<T, U> {

	private config: ExecutionNodeConfig<T, U>;
	private output?: {
		name?: string,
		value: U
	};

	constructor(config: ExecutionNodeConfig<T, U>) {
		this.config = config;
	}

	public async execute() {

		if ((this.config as ExecutionVertexConfig<T, U>).nodes) {
			const config = this.config as ExecutionVertexConfig<T, U>;

			this.output = { value: await config.executionHandler(config.nodes) };

		} else {
			const config = this.config as ExecutionLeaveConfig<T, U>;

			this.output = { value: await config.executor(config.config) };
		}

		return this.output;
	}
}