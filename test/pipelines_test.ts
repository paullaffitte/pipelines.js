import { expect } from 'chai';
import Pipelines from '../src/Pipelines';
import { Executor } from '../src/ExecutionNode';
import 'mocha';

describe('Pipelines', () => {
	it('should works', async () => {
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
					expect(output).to.be.a('number');
					expect(config.duration).to.be.a('number');
					expect(Math.abs(output - config.duration)).to.be.below(50);
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

		const resultTree: Array<any> = await executionTree.execute();
		console.log(JSON.stringify(resultTree, null, 2));

		expect(resultTree).to.be.an('array');
		expect(resultTree.length).to.equals(4);

		expect(resultTree[0]).to.equals(undefined);
		expect(resultTree[2]).to.equals(undefined);

		expect(resultTree[1]).to.be.an('array');
		expect(resultTree[1].length).to.equals(3);
		resultTree[1].forEach((output: any) => expect(output).to.be.a('number'));

		expect(resultTree[3]).to.be.an('array');
		expect(resultTree[3].length).to.equals(3);
		resultTree[3].forEach((output: any) => expect(output).to.be.a('number'));
	});
});
