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

		const pp = new Pipelines(defaultExecutor);

		const executionList = [
			pp.exec({ index: 1, duration: 500 }),
			pp.exec({ index: 2, duration: 300 }),
			pp.exec({ index: 3, duration: 100 }),
		];
		console.log(pp);
		const executionTree = pp.sequence([
			pp.with(console.log).exec('Parallel pipelines'),
			pp.parallel(executionList),
			pp.with(console.log).exec('Sequencial pipelines'),
			pp.sequence(executionList),
		]);
		console.log(JSON.stringify(await executionTree.execute(), null, 2));
	});
});
