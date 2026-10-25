import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courses,exercises} from '../src/data';
import {lessonVideoPlan,videosForExercise} from '../src/lessonVideos';
import {videoCatalog} from '../src/videoCatalog';

test('every syllabus lesson has two distinct direct teaching videos and objective guidance',()=>{
  for(const c of courses) assert.equal(lessonVideoPlan[c.id].length,42,`${c.id} must have an explicit mapping for all 42 days`);
  for(const e of exercises) {
    const {focus,videos}=videosForExercise(e);
    assert.ok(focus.length>35,`Missing objective guidance: ${e.id}`);
    assert.equal(videos.length,2,e.id);
    assert.equal(new Set(videos.map(v=>v.id)).size,2,`Duplicate video: ${e.id}`);
    for(const v of videos) {
      assert.ok(v.title.trim());assert.ok(v.channel.trim());assert.ok(v.context.trim());
      const url=new URL(v.url);
      assert.equal(url.origin,'https://www.youtube.com');assert.equal(url.pathname,'/watch');
      assert.match(url.searchParams.get('v')||'',/^[\w-]{11}$/);
      assert.equal(url.searchParams.get('v'),v.id);
    }
  }
});

test('video catalog is unique and all entries are assigned to actual lessons',()=>{
  const catalog=Object.values(videoCatalog);
  assert.equal(new Set(catalog.map(v=>v.id)).size,catalog.length);
  const used=new Set(exercises.flatMap(e=>videosForExercise(e).videos.map(v=>v.id)));
  assert.deepEqual(used,new Set(catalog.map(v=>v.id)));
});
