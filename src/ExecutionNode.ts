/** The result of an execution. */
type Result<T> = T | Promise<T>;

/** A function that execute something given parameters and returns a {@link Result}. */
export type Executor<T, U> = (config: T) => Result<U>;

/** A function that execute a list of {@link ExecutionNode} and returns a result. */
export type ExecutionHandler<T, U> = (nodes: ExecutionNode<T, U>[]) => Result<U>;

/** A function that do something given an {@link ExecutionNode} */
export type Hook = (node: ExecutionNode<any, any>) => any;

/**
 * A node in an execution tree.
 */
export class ExecutionNode<T, U> {
	private executor: Executor<T, U>;
	private _config: T;
	private hooks: Hook[];
	private _output?: U;

	/**
	 * Constructor.
	 *
	 * @param {Executor<T, U>} executor The executor to be executed on the given configuration.
	 * @param {T} config The config to be passed to the executor on execution.
	 * @param {Hook[]} [hooks] Callbacks to be executed after each {@link Executor} execution.
	 */
	constructor(executor: Executor<T, U>, config: T, hooks: Hook[] = []) {
		this.executor = executor;
		this._config = config;
		this.hooks = hooks;
	}

	/**
	 * Execute this node and his sub-tree if it has one.
	 *
	 * @returns The output of the execution.
	 */
	public async execute(): Promise<U> {
		this._output = await this.executor(this.config);
		this.hooks.map(hook => hook(this));

		return this._output;
	}

	/**
	 * Get the output (readonly)
	 *
	 * @returns
	 */
	get output(): U | undefined {
		return this._output;
	}

	/**
	 * Get the config (readonly)
	 *
	 * @returns
	 */
	get config(): T {
		return this._config;
	}
}
