import { expect } from 'chai';
import Pipelines from '../src/Pipelines';
import { Executor } from '../src/ExecutionNode';
import 'mocha';

describe('Pipelines', () => {
	it('should works', async () => {
		expect(true).to.equal(true);

		const defaultExecutor: Executor<
			{ index: number; duration: number },
			{ success: boolean; error: boolean; output: number }
		> = async config => {
			return new Promise<{ success: boolean; error: boolean; output: number }>(resolve => {
				setTimeout(() => {
					console.log(`${config.index} done (${config.duration}ms)`);
					resolve({
						success: true,
						error: false,
						output: Date.now(),
					});
				}, config.duration);
			});
		};

		const logExecutor: Executor<string, null> = message => {
			console.log(message);
			return null;
		};

		const pp = new Pipelines(defaultExecutor);

		const executionList = [
			pp.exec({ index: 1, duration: 500 }),
			pp.exec({ index: 2, duration: 300 }),
			pp.exec({ index: 3, duration: 100 }),
		];
		console.log(pp);
		const executionTree = pp.sequence([
			pp.with(logExecutor).exec('Parallel pipelines'),
			pp.parallel(executionList),
			pp.with(logExecutor).exec('Sequencial pipelines'),
			pp.sequence(executionList),
		]);
		console.log(JSON.stringify(await executionTree.execute(), null, 2));
	});
});
