import fs from 'node:fs';
const spec = fs.readFileSync(new URL('../study_tracker_codex_spec.md', import.meta.url), 'utf8');
const ids = ['ai', 'fusion', 'linux'];
const names = ['AI Internals', 'Fusion 360 Mechanisms', 'Linux Reverse Engineering & Security'];
const descriptions = ['From first principles to a miniature transformer.', 'Turn ideas into real, moving mechanisms.', 'Understand systems. Investigate what lies beneath.'];
const courses = spec.split(/^### Course [ABC] — /m).slice(1).map((section, i) => {
  const weeks = [...section.matchAll(/^#### Week (\d+) — (.+)\r?\n([\s\S]*?)(?=^#### |^## |$(?![\s\S]))/gm)].map(match => ({
    number: Number(match[1]), title: match[2].trim(),
    exercises: [...match[3].matchAll(/^(\d+)\. (.+)$/gm)].map(day => ({
      id: `${ids[i]}-w${match[1]}-d${day[1]}`, courseId: ids[i], week: Number(match[1]), day: Number(day[1]),
      title: day[2].trim().split(/\. (?=[A-Z])/)[0].replace(/\.$/, ''), task: day[2].trim(),
      isMiniProject: /^(Mini-project|Final project|Mini-challenge|Mini research challenge|Mock interview):/.test(day[2])
    }))
  }));
  return {id: ids[i], name: names[i], description: descriptions[i], outcome: section.match(/\*\*Outcome:\*\* (.+)/)?.[1].trim(), weeks};
});
if(courses.length !== 3 || courses.some(c => c.weeks.length !== 6 || c.weeks.some(w => w.exercises.length !== 7))) throw Error('Incomplete syllabus');
fs.mkdirSync(new URL('../src', import.meta.url), {recursive: true});
fs.writeFileSync(new URL('../src/syllabus.json', import.meta.url), JSON.stringify(courses, null, 2) + '\n');
