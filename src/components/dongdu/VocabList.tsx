import React, { useState, useMemo } from 'react';
import type { DongDuVocabItem, DongDuCategory } from '../../types/vocabulary';
import { soundFx } from '../../utils/audio';

interface VocabListProps {
  vocabList: DongDuVocabItem[];
  categories: DongDuCategory[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const VocabList: React.FC<VocabListProps> = ({
  vocabList,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on category and search query
  const filteredList = useMemo(() => {
    let list = vocabList;

    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((item) => {
        return (
          item.vietnamese.toLowerCase().includes(q) ||
          item.kana.toLowerCase().includes(q) ||
          (item.kanji && item.kanji.toLowerCase().includes(q)) ||
          item.romaji.toLowerCase().includes(q) ||
          (item.han_viet && item.han_viet.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [vocabList, selectedCategory, searchQuery]);

  const handleSpeak = (item: DongDuVocabItem) => {
    soundFx.speakJapanese(item.kanji || item.kana);
  };

  return (
    <div className="vocab-list-container">
      {/* Search and Filter Bar */}
      <div className="vocab-list-header">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="vocab-search-input"
            placeholder="Tìm theo tiếng Việt, Kana, Kanji, Romaji hoặc Hán-Việt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="category-pills-scroll" role="tablist">
          <button
            type="button"
            className={`cat-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onSelectCategory('all')}
          >
            Tất cả <span className="cat-count">({vocabList.length})</span>
          </button>
          {categories.map((c) => {
            const count = vocabList.filter((v) => v.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className={`cat-pill-btn ${selectedCategory === c.id ? 'active' : ''}`}
                onClick={() => onSelectCategory(c.id)}
              >
                {c.name_vi} <span className="cat-count">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result stats summary */}
      <div className="vocab-result-summary">
        <span>Hiển thị <strong>{filteredList.length}</strong> / {vocabList.length} từ vựng</span>
      </div>

      {/* Grid of Vocabulary Cards */}
      {filteredList.length === 0 ? (
        <div className="vocab-empty-state">
          <p>Không tìm thấy từ vựng nào khớp với từ khóa "{searchQuery}".</p>
          <button
            type="button"
            className="zen-btn-secondary"
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="vocab-grid-list">
          {filteredList.map((item) => {
            const catObj = categories.find((c) => c.id === item.category);

            return (
              <div key={item.id} className="vocab-item-card">
                <div className="vocab-item-top">
                  <div className="vocab-item-japanese">
                    {item.kanji ? (
                      <div className="kanji-with-furigana">
                        <span className="item-furigana">{item.kana}</span>
                        <span className="item-kanji">{item.kanji}</span>
                      </div>
                    ) : (
                      <div className="item-kana-only">{item.kana}</div>
                    )}
                    <div className="item-romaji">{item.romaji}</div>
                  </div>

                  <button
                    type="button"
                    className="item-speak-btn"
                    onClick={() => handleSpeak(item)}
                    title="Nghe phát âm"
                  >
                    🔊
                  </button>
                </div>

                <div className="vocab-item-body">
                  <div className="item-vietnamese-meaning">
                    {item.vietnamese}
                  </div>

                  {item.han_viet && (
                    <div className="item-hanviet-tag">
                      <span className="hv-label">Hán-Việt:</span>
                      <span className="hv-value">{item.han_viet}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="item-note-row">
                      <span className="note-bulb">💡</span>
                      <span className="note-content">{item.notes}</span>
                    </div>
                  )}
                </div>

                <div className="vocab-item-footer">
                  <span className="footer-cat-badge">
                    {catObj?.name_vi || item.category}
                  </span>
                  {item.politeness && item.politeness !== 'standard' && (
                    <span className={`footer-politeness-badge ${item.politeness}`}>
                      {item.politeness === 'polite' ? 'Lịch sự' : item.politeness === 'formal' ? 'Trang trọng' : item.politeness}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
