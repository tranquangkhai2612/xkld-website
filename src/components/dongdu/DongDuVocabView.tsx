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

  return (
    <div className="dongdu-vocab-view">
      {/* Lesson Header Banner */}
      <div className="dongdu-hero-banner">
        <div className="hero-content-left">
          <div className="hero-badges-row">
            <span className="source-badge">東遊 • Nhật Ngữ Đông Du</span>
            <span className="level-badge">{currentLesson.metadata.level}</span>
            <span className="lesson-badge">Bài {currentLesson.metadata.lesson}</span>
          </div>
          <h2 className="dongdu-lesson-title">{currentLesson.metadata.title}</h2>
          <p className="dongdu-lesson-desc">{currentLesson.metadata.description}</p>
        </div>

        {/* Lesson Selector dropdown (Scalable for future lessons) */}
        <div className="lesson-picker-box">
          <label htmlFor="lesson-select" className="picker-label">Chọn bài học:</label>
          <select
            id="lesson-select"
            className="lesson-dropdown"
            value={selectedLessonNum}
            onChange={(e) => {
              const nextLessonNum = Number(e.target.value);
              const nextLesson = getLesson(nextLessonNum);
              const nextCats = new Set(nextLesson.categories.map((c) => c.id));
              const nextHasDrill =
                nextCats.has('numbers') ||
                nextCats.has('age_counters') ||
                nextCats.has('numbers_large') ||
                nextCats.has('floor_counters');

              setSelectedLessonNum(nextLessonNum);
              setSelectedCategory('all');
              if (!nextHasDrill && activeStudyMode === 'numbers') {
                setActiveStudyMode('flashcard');
              }
            }}
          >
            {DONGDU_LESSONS.map((l) => (
              <option key={l.metadata.lesson} value={l.metadata.lesson}>
                Bài {l.metadata.lesson}: {l.metadata.level} ({l.vocabulary.length} từ)
              </option>
            ))}
          </select>
        </div>
      </div>

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
    </div>
  );
};
