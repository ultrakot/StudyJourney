import {ExternalLink, Play, Youtube} from 'lucide-react';
import type {Exercise} from './data';
import {videosForExercise} from './lessonVideos';
import './videos.css';

export function RelatedVideos({exercise}:{exercise:Exercise}) {
  const {focus,videos}=videosForExercise(exercise);
  return <section className="panel video-panel" aria-labelledby="lesson-videos-heading">
    <div className="section-heading compact">
      <h2 id="lesson-videos-heading"><Youtube size={20} aria-hidden="true"/>Related YouTube videos</h2>
      <span className="video-count">{videos.length} resources</span>
    </div>
    <p className="video-focus"><strong>For this lesson</strong>{focus}</p>
    <ul className="video-list">
      {videos.map((video,index)=><li key={video.id}>
        <a className="video-link" href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`${video.title} by ${video.channel} — opens on YouTube in a new tab`}>
          <span className="video-play" aria-hidden="true"><Play size={17}/></span>
          <span className="video-info"><span className="video-channel">{String(index+1).padStart(2,'0')} · {video.channel}</span><strong>{video.title}</strong><span className="video-context">{video.context}</span><span className="video-watch">Watch on YouTube <ExternalLink size={12} aria-hidden="true"/></span></span>
        </a>
      </li>)}
    </ul>
    <p className="video-footnote">Optional viewing. Longer tutorials support several lessons; watch the relevant part and keep time for practice.</p>
  </section>;
}
