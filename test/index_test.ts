import { expect } from 'chai';
import isAwesome from '../src/index';
import 'mocha';

describe('Index', () => {
	it('should be awsome', () => {
		expect(isAwesome).to.equal(true);
	});
});