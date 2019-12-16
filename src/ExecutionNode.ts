type Result<T> = T | Promise<T>;

export type Executor<T, U> = (config: T) => Result<U>;

export type ExecutionHandler<T, U> = ((nodes: ExecutionNode<T, U>[]) => Result<U>);

export class ExecutionNode<T, U> {

	private executor: Executor<T, U>;
	private config: T;
	private output?: {
		name?: string,
		value: U
	};

	constructor(executor: Executor<T, U>, config: T) {
		this.executor = executor;
		this.config = config;
	}

	public async execute() {
		this.output = { value: await this.executor(this.config) };

		return this.output;
	}
}
