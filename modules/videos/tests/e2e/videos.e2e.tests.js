'use strict';

describe('Videos E2E Tests:', function() {
	describe('Test videos page', function() {
		it('Should report missing credentials', function() {
			browser.get('http://localhost:3000/#!/videos');
			expect(element.all(by.repeater('video in videos')).count()).toEqual(0);
		});
	});
});
