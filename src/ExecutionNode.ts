type Result<T> = T | Promise<T>;

export type Executor<T, U> = (config: T) => Result<U>;

export type ExecutionHandler<T, U> = (nodes: ExecutionNode<T, U>[]) => Result<U>;

export class ExecutionNode<T, U> {
	private executor: Executor<T, U>;
	private config: T;
	private output?: U

	constructor(executor: Executor<T, U>, config: T) {
		this.executor = executor;
		this.config = config;
	}

	public async execute(): Promise<U> {
		this.output = await this.executor(this.config);

		return this.output;
	}
}
