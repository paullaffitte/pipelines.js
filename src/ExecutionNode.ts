type Result<T> = T | Promise<T>;

export type Executor<T, U> = (config: T) => Result<U>;

export type ExecutionHandler<T, U> = (nodes: ExecutionNode<T, U>[]) => Result<U>;

export type Hook = (node: ExecutionNode<any, any>) => any;

export class ExecutionNode<T, U> {
	private executor: Executor<T, U>;
	private _config: T;
	private hooks: Hook[];
	private _output?: U;

	constructor(executor: Executor<T, U>, config: T, hooks: Hook[] = []) {
		this.executor = executor;
		this._config = config;
		this.hooks = hooks;
	}

	public async execute(): Promise<U> {
		this._output = await this.executor(this.config);
		this.hooks.map(hook => hook(this));

		return this._output;
	}

	get output(): U | undefined {
		return this._output;
	}

	get config(): T {
		return this._config;
	}
}
