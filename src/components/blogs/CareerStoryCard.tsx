import { Link } from 'react-router-dom';
import type { CareerStory } from '../../data/careerStories';
import { CursorTarget } from '../interaction/CursorTarget';

export function CareerStoryCard({ story }: { story: CareerStory }) {
  return (
    <article className="cs-card">
      <div className="cs-card__avatar">
        {story.avatarUrl ? (
          <img src={story.avatarUrl} alt={story.authorName} />
        ) : (
          <div className="cs-card__avatar-fallback"><span className="technical-small">-Author</span></div>
        )}
      </div>
      
      <div className="cs-card__top-right">
        <div className="cs-card__likes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <span>{story.likes}</span>
        </div>
      </div>
      
      <div className="cs-card__body">
        <div className="cs-card__author-info">
          <span className="cs-card__author-name">{story.authorName}</span>
          <span className="cs-card__author-details"> | {story.authorDetails}</span>
        </div>
        
        <h3 className="cs-card__title">{story.title}</h3>
        
        <p className="cs-card__excerpt">{story.excerpt}</p>
        
        <CursorTarget intent="link" label="READ">
          <Link to={`/blogs/${story.track}/${story.id}`} className="cs-card__btn">
            Read More
          </Link>
        </CursorTarget>
      </div>
    </article>
  );
}
