import React, { useState } from 'react';
import type { VocabStudyMode } from '../../types/vocabulary';
import { DONGDU_LESSONS, getLesson } from '../../data/dongduData';
import { VocabFlashcard } from './VocabFlashcard';
import { VocabQuiz } from './VocabQuiz';
import { VocabList } from './VocabList';
import { VocabNumbersDrill } from './VocabNumbersDrill';
import './dongdu.css';

export const DongDuVocabView: React.FC = () => {
  const [selectedLessonNum, setSelectedLessonNum] = useState<number>(1);
  const [activeStudyMode, setActiveStudyMode] = useState<VocabStudyMode>('flashcard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const currentLesson = getLesson(selectedLessonNum);
  const categoryIds = new Set(currentLesson.categories.map((c) => c.id));
  const hasBasicNumbers = categoryIds.has('numbers') || categoryIds.has('age_counters');
  const hasLargeNumbers = categoryIds.has('numbers_large') || categoryIds.has('floor_counters');
  const hasNumbersDrill = hasBasicNumbers || hasLargeNumbers;

  const totalVocabCount = DONGDU_LESSONS.reduce(
    (sum, l) => sum + l.vocabulary.length,
    0
  );

  const handleSelectLesson = (lessonNum: number) => {
    const nextLesson = getLesson(lessonNum);
    const nextCats = new Set(nextLesson.categories.map((c) => c.id));
    const nextHasDrill =
      nextCats.has('numbers') ||
      nextCats.has('age_counters') ||
      nextCats.has('numbers_large') ||
      nextCats.has('floor_counters');

    setSelectedLessonNum(lessonNum);
    setSelectedCategory('all');
    if (!nextHasDrill && activeStudyMode === 'numbers') {
      setActiveStudyMode('flashcard');
    }
  };

  return (
    <div className="dongdu-vocab-view">
      <div className="dongdu-vocab-layout">
        {/* Left Sidebar: List of Lesson Cards */}
        <aside className="dongdu-lessons-sidebar" aria-label="Danh sách bài học">
          <div className="sidebar-header">
            <div className="sidebar-title-row">
              <span className="sidebar-icon">📚</span>
              <h3 className="sidebar-title">Bài Học Đông Du</h3>
            </div>
            <p className="sidebar-subtitle">
              {DONGDU_LESSONS.length} bài học &bull; {totalVocabCount} từ vựng
            </p>
          </div>

          <div className="lesson-cards-list" role="tablist" aria-label="Chọn bài học">
            {DONGDU_LESSONS.map((lesson) => {
              const isSelected = lesson.metadata.lesson === selectedLessonNum;
              return (
                <button
                  key={lesson.metadata.lesson}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`lesson-nav-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectLesson(lesson.metadata.lesson)}
                >
                  <div className="lesson-card-top-row">
                    <div className="lesson-badge-cluster">
                      <span className="lesson-tag-pill">Bài {lesson.metadata.lesson}</span>
                      <span className="lesson-jp-badge">第{lesson.metadata.lesson}課</span>
                    </div>
                    {isSelected ? (
                      <span className="lesson-active-indicator">
                        <span className="indicator-dot" /> Đang học
                      </span>
                    ) : (
                      <span className="lesson-word-counter">{lesson.vocabulary.length} từ</span>
                    )}
                  </div>

                  <h4 className="lesson-card-heading">{lesson.metadata.title}</h4>

                  <div className="lesson-card-subinfo">
                    <span className="lesson-sub-level">{lesson.metadata.level}</span>
                    <span className="lesson-sub-cats">{lesson.categories.length} nhóm từ</span>
                  </div>

                  <div className="lesson-card-category-chips">
                    {lesson.categories.slice(0, 3).map((cat) => (
                      <span key={cat.id} className="category-mini-chip">
                        {cat.name_vi.split('&')[0].trim()}
                      </span>
                    ))}
                    {lesson.categories.length > 3 && (
                      <span className="category-mini-chip more">
                        +{lesson.categories.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Panel */}
        <section className="dongdu-main-panel" aria-label="Nội dung bài học">
          {/* Sub Navigation Modes */}
          <div className="vocab-subnav" role="tablist">
            <button
              type="button"
              className={`vocab-subnav-btn ${activeStudyMode === 'flashcard' ? 'active' : ''}`}
              onClick={() => setActiveStudyMode('flashcard')}
            >
              <span className="subnav-icon">🎴</span>
              <span className="subnav-text">Thẻ Flashcard</span>
            </button>

            <button
              type="button"
              className={`vocab-subnav-btn ${activeStudyMode === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveStudyMode('quiz')}
            >
              <span className="subnav-icon">⚔️</span>
              <span className="subnav-text">Luyện tập Dojo</span>
            </button>

            <button
              type="button"
              className={`vocab-subnav-btn ${activeStudyMode === 'list' ? 'active' : ''}`}
              onClick={() => setActiveStudyMode('list')}
            >
              <span className="subnav-icon">📖</span>
              <span className="subnav-text">Tra cứu từ vựng</span>
            </button>

            {hasNumbersDrill && (
              <button
                type="button"
                className={`vocab-subnav-btn ${activeStudyMode === 'numbers' ? 'active' : ''}`}
                onClick={() => setActiveStudyMode('numbers')}
              >
                <span className="subnav-icon">🔢</span>
                <span className="subnav-text">
                  {hasLargeNumbers ? 'Số lớn & Tầng lầu' : 'Số đếm & Tuổi'}
                </span>
              </button>
            )}
          </div>

          {/* Active Sub-Mode View */}
          <div className="vocab-mode-body">
            {activeStudyMode === 'flashcard' && (
              <VocabFlashcard
                key={currentLesson.metadata.lesson}
                vocabList={currentLesson.vocabulary}
                categories={currentLesson.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {activeStudyMode === 'quiz' && (
              <VocabQuiz
                key={currentLesson.metadata.lesson}
                vocabList={currentLesson.vocabulary}
                categories={currentLesson.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {activeStudyMode === 'list' && (
              <VocabList
                key={currentLesson.metadata.lesson}
                vocabList={currentLesson.vocabulary}
                categories={currentLesson.categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {activeStudyMode === 'numbers' && hasNumbersDrill && (
              <VocabNumbersDrill
                key={currentLesson.metadata.lesson}
                vocabList={currentLesson.vocabulary}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
