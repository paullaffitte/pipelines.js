import { expect } from 'chai';
import Pipelines from '../src/Pipelines';
import { Executor } from '../src/ExecutionNode';
import 'mocha';

describe('Pipelines', () => {
	it('should works', async () => {
		expect(true).to.equal(true);

		const defaultExecutor: Executor<{ index: number; duration: number }, number> = async config => {
			return new Promise<number>(resolve => {
				const start = Date.now();
				setTimeout(() => resolve(Date.now() - start), config.duration);
			});
		};

		const pp = new Pipelines(defaultExecutor, [
			node => {
				const { config, output } = node;

				if (typeof config.index == 'number') {
					console.log(`${config.index} done (${output}ms)`);
				}
			},
		]);

		const executionList = [
			pp.exec({ index: 1, duration: 500 }),
			pp.exec({ index: 2, duration: 300 }),
			pp.exec({ index: 3, duration: 100 }),
		];

		const executionTree = pp.sequence([
			pp.with(console.log).exec('Parallel pipelines'),
			pp.parallel(executionList),
			pp.with(console.log).exec('Sequencial pipelines'),
			pp.sequence(executionList),
		]);

		console.log(JSON.stringify(await executionTree.execute(), null, 2));
	});
});
