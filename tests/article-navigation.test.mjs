import assert from 'node:assert/strict';
import test from 'node:test';
import {isArticlePage,sectionNavigationKey} from '../src/utils/article-navigation.ts';
test('personal and collection pages do not inherit article tools',()=>{
 for(const p of ['home','games','about','friends',undefined]) assert.equal(isArticlePage(p,true),false);
 for(const p of ['blog','post','archive','categories','tags','series']) {assert.equal(isArticlePage(p,true),true);assert.equal(sectionNavigationKey(p,p,true),'blog');}
 assert.equal(isArticlePage('home',false),true);
 assert.equal(sectionNavigationKey('archive','archive',false),'archive');
});
