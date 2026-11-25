import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { DongDuVocabItem, DongDuCategory } from '../../types/vocabulary';
import { soundFx } from '../../utils/audio';

interface VocabFlashcardProps {
  vocabList: DongDuVocabItem[];
  categories: DongDuCategory[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const VocabFlashcard: React.FC<VocabFlashcardProps> = ({
  vocabList,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<DongDuVocabItem[]>([]);
  const [showHanViet, setShowHanViet] = useState(true);
  const [showKana, setShowKana] = useState(true);

  // Filter items based on selected category
  const filteredItems = useMemo(() => {
    let items = selectedCategory === 'all'
      ? vocabList
      : vocabList.filter((v) => v.category === selectedCategory);

    if (items.length === 0) {
      items = vocabList;
    }
    return items;
  }, [vocabList, selectedCategory]);

  const deck = isShuffled && shuffledOrder.length === filteredItems.length
    ? shuffledOrder
    : filteredItems;

  const handleToggleShuffle = () => {
    const nextShuffled = !isShuffled;
    setIsShuffled(nextShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);

    if (nextShuffled) {
      const array = [...filteredItems];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      setShuffledOrder(array);
    }
  };

  const handleSelectCategory = (catId: string) => {
    onSelectCategory(catId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(false);
  };

  const safeIndex = currentIndex >= deck.length ? 0 : currentIndex;
  const currentItem = deck[safeIndex] || deck[0];

  const handleNext = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleSpeak = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    const textToSpeak = currentItem.kanji || currentItem.kana;
    soundFx.speakJapanese(textToSpeak);
  }, [currentItem]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused on an input/select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleSpeak();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleSpeak]);

  if (!currentItem) {
    return (
      <div className="vocab-empty-state">
        <p>Không có từ vựng nào trong danh mục này.</p>
      </div>
    );
  }

  // Find category name
  const catObj = categories.find((c) => c.id === currentItem.category);
  const catName = catObj ? `${catObj.name_ja} (${catObj.name_vi})` : currentItem.category;

  const progressPercent = Math.round(((safeIndex + 1) / deck.length) * 100);

  return (
    <div className="vocab-flashcard-container">
      {/* Top Filter and Controls Bar */}
      <div className="flashcard-toolbar">
        <div className="category-selector-group">
          <label htmlFor="vocab-category-select" className="filter-label">Chủ đề:</label>
          <select
            id="vocab-category-select"
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => handleSelectCategory(e.target.value)}
          >
            <option value="all">Tất cả bài học ({vocabList.length} từ)</option>
            {categories.map((c) => {
              const count = vocabList.filter((v) => v.category === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name_vi} ({count} từ)
                </option>
              );
            })}
          </select>
        </div>

        <div className="flashcard-toggles">
          <button
            type="button"
            className={`toggle-pill ${isShuffled ? 'active' : ''}`}
            onClick={handleToggleShuffle}
            title="Đảo ngẫu nhiên danh sách thẻ"
          >
            🔀 Trộn thẻ
          </button>
          <button
            type="button"
            className={`toggle-pill ${showKana ? 'active' : ''}`}
            onClick={() => setShowKana(!showKana)}
            title="Hiện/Ẩn Furigana (Hiragana)"
          >
            Kana (Furigana)
          </button>
          <button
            type="button"
            className={`toggle-pill ${showHanViet ? 'active' : ''}`}
            onClick={() => setShowHanViet(!showHanViet)}
            title="Hiện/Ẩn âm Hán-Việt Đông Du"
          >
            Hán-Việt
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flashcard-progress-wrapper">
        <div className="flashcard-progress-info">
          <span className="progress-counter">
            Thẻ <strong>{safeIndex + 1}</strong> / {deck.length}
          </span>
          <span className="progress-percentage">{progressPercent}%</span>
        </div>
        <div className="flashcard-progress-track">
          <div
            className="flashcard-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Flashcard */}
      <div
        className={`vocab-card-scene ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Nhấn để lật thẻ"
      >
        <div className="vocab-card-inner">
          {/* Front Side: Japanese (Kanji / Kana / Romaji) */}
          <div className="vocab-card-face card-front">
            <div className="card-badge-row">
              <span className="card-category-badge">{catName}</span>
              <button
                type="button"
                className="card-audio-btn"
                onClick={handleSpeak}
                title="Nghe phát âm tiếng Nhật (phím R)"
              >
                🔊 Nghe
              </button>
            </div>

            <div className="card-main-content">
              {/* If word has Kanji, show Kanji as primary and Kana as furigana */}
              {currentItem.kanji ? (
                <div className="kanji-display-block">
                  {showKana && <div className="kanji-furigana">{currentItem.kana}</div>}
                  <div className="kanji-primary-glyph">{currentItem.kanji}</div>
                </div>
              ) : (
                <div className="kana-primary-glyph">{currentItem.kana}</div>
              )}

              {showHanViet && currentItem.han_viet && (
                <div className="card-hanviet-badge">
                  <span className="hanviet-label">Hán-Việt:</span>
                  <span className="hanviet-val">{currentItem.han_viet}</span>
                </div>
              )}
            </div>

            <div className="card-footer-hint">
              <span>Chạm hoặc phím <kbd>Space</kbd> để xem nghĩa</span>
            </div>
          </div>

          {/* Back Side: Vietnamese, Han-Viet, Notes, Politeness */}
          <div className="vocab-card-face card-back">
            <div className="card-badge-row">
              <span className="card-category-badge">{catName}</span>
              <button
                type="button"
                className="card-audio-btn"
                onClick={handleSpeak}
                title="Nghe lại phát âm (phím R)"
              >
                🔊 Nghe
              </button>
            </div>

            <div className="card-main-content back-content">
              <div className="back-japanese-summary">
                <span className="back-jp-kana">{currentItem.kana}</span>
                {currentItem.kanji && (
                  <span className="back-jp-kanji">({currentItem.kanji})</span>
                )}
              </div>

              <div className="back-vietnamese-meaning">
                {currentItem.vietnamese}
              </div>

              {currentItem.han_viet && (
                <div className="back-hanviet-highlight">
                  <span className="badge-title">Âm Hán-Việt:</span>
                  <span className="badge-body">{currentItem.han_viet}</span>
                </div>
              )}

              {currentItem.notes && (
                <div className="card-notes-box">
                  <span className="notes-icon">💡</span>
                  <span className="notes-text">{currentItem.notes}</span>
                </div>
              )}

              <div className="card-meta-chips">
                {currentItem.part_of_speech && (
                  <span className="meta-chip chip-pos">{currentItem.part_of_speech}</span>
                )}
                {currentItem.politeness && (
                  <span className="meta-chip chip-polite">{currentItem.politeness}</span>
                )}
              </div>
            </div>

            <div className="card-footer-hint">
              <span>Chạm hoặc phím <kbd>Space</kbd> để lật lại</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flashcard-nav-controls">
        <button
          type="button"
          className="nav-control-btn prev-btn"
          onClick={handlePrev}
          title="Thẻ trước (phím Mũi tên trái hoặc K)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Trước</span>
        </button>

        <button
          type="button"
          className="flip-action-btn"
          onClick={handleFlip}
          title="Lật thẻ (phím Space)"
        >
          🔄 Lật thẻ
        </button>

        <button
          type="button"
          className="nav-control-btn next-btn"
          onClick={handleNext}
          title="Thẻ tiếp theo (phím Mũi tên phải hoặc J)"
        >
          <span>Sau</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {/* Keyboard shortcuts reminder */}
      <div className="flashcard-shortcuts-legend">
        <span>Phím tắt:</span>
        <code>Space</code> lật thẻ &bull; <code>&larr;</code> hoặc <code>K</code> lùi &bull; <code>&rarr;</code> hoặc <code>J</code> tiến &bull; <code>R</code> phát âm
      </div>
    </div>
  );
};
