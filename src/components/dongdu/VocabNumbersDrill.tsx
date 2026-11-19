import React, { useState } from 'react';
import type { DongDuVocabItem } from '../../types/vocabulary';
import { soundFx } from '../../utils/audio';

interface VocabNumbersDrillProps {
  vocabList: DongDuVocabItem[];
}

export const VocabNumbersDrill: React.FC<VocabNumbersDrillProps> = ({ vocabList }) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'numbers' | 'ages'>('numbers');

  const numbersList = vocabList.filter((v) => v.category === 'numbers');
  const ageList = vocabList.filter((v) => v.category === 'age_counters');

  const handleSpeak = (text: string) => {
    soundFx.speakJapanese(text);
  };

  return (
    <div className="numbers-drill-container">
      {/* Subtab Navigation */}
      <div className="drill-subtabs">
        <button
          type="button"
          className={`drill-subtab-btn ${selectedSubTab === 'numbers' ? 'active' : ''}`}
          onClick={() => setSelectedSubTab('numbers')}
        >
          🔢 Bảng Số Đếm (0 - 100)
        </button>
        <button
          type="button"
          className={`drill-subtab-btn ${selectedSubTab === 'ages' ? 'active' : ''}`}
          onClick={() => setSelectedSubTab('ages')}
        >
          🎂 Đếm Tuổi & Biến Âm Đặc Biệt
        </button>
      </div>

      {selectedSubTab === 'numbers' && (
        <div className="numbers-overview-panel">
          <div className="drill-info-banner">
            <span className="banner-icon">ℹ️</span>
            <div className="banner-text">
              <strong>Quy tắc ghép số tiếng Nhật:</strong>
              <p>Số hàng chục = <code>[Số 2-9] + じゅう (10)</code>. Ví dụ: 20 = <code>に (2) + じゅう (10) = にじゅう</code>.</p>
              <p>Số lẻ = <code>[Hàng chục] + [Số 1-9]</code>. Ví dụ: 25 = <code>にじゅう + ご = にじゅうご</code>.</p>
              <p>Lưu ý đặc biệt các số có nhiều cách đọc: <strong>4 (よん / し)</strong>, <strong>7 (なな / しち)</strong>, <strong>9 (きゅう / く)</strong>.</p>
            </div>
          </div>

          <div className="numbers-grid">
            {numbersList.map((item) => {
              const isSpecial = ['num_04', 'num_07', 'num_09', 'num_00', 'num_100'].includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`number-card ${isSpecial ? 'highlight-special' : ''}`}
                  onClick={() => handleSpeak(item.kana.split('/')[0].trim())}
                  role="button"
                  tabIndex={0}
                  title="Nhấn để nghe phát âm"
                >
                  <div className="number-card-top">
                    <span className="num-numeric-val">{item.value !== undefined ? item.value : item.vietnamese}</span>
                    <button
                      type="button"
                      className="num-audio-mini"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(item.kana.split('/')[0].trim());
                      }}
                    >
                      🔊
                    </button>
                  </div>

                  <div className="number-kanji">{item.kanji}</div>
                  <div className="number-kana">{item.kana}</div>
                  <div className="number-romaji">{item.romaji}</div>
                  {item.han_viet && (
                    <div className="number-hanviet">{item.han_viet}</div>
                  )}

                  {item.notes && (
                    <div className="number-note-pill">{item.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedSubTab === 'ages' && (
        <div className="ages-overview-panel">
          <div className="drill-info-banner warning-style">
            <span className="banner-icon">⚠️</span>
            <div className="banner-text">
              <strong>Các biến âm quan trọng cần nhớ trong Bài 1:</strong>
              <ul>
                <li><strong>1 tuổi:</strong> <code>いっさい</code> (âm ngắt <code>っ</code>, không đọc là <i>いちさい</i>)</li>
                <li><strong>8 tuổi:</strong> <code>はっさい</code> (âm ngắt <code>っ</code>, không đọc là <i>はちさい</i>)</li>
                <li><strong>10 tuổi:</strong> <code>じゅっさい</code> hoặc <code>じっさい</code> (âm ngắt <code>っ</code>)</li>
                <li><strong>20 tuổi:</strong> <code>はたち</code> (bất quy tắc đặc biệt, không đọc <i>にじゅっさい</i>)</li>
                <li><strong>Hỏi tuổi lịch sự:</strong> <code>おいくつですか？</code> (lịch sự hơn <i>なんさいですか？</i>)</li>
              </ul>
            </div>
          </div>

          <div className="ages-cards-grid">
            {ageList.map((item) => {
              const isSpecial = ['age_01', 'age_08', 'age_10', 'age_20'].includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`age-card ${isSpecial ? 'special-rendaku' : ''}`}
                  onClick={() => handleSpeak(item.kana)}
                  role="button"
                  tabIndex={0}
                  title="Nhấn để nghe phát âm"
                >
                  <div className="age-card-header">
                    <span className="age-vietnamese-title">{item.vietnamese}</span>
                    <button
                      type="button"
                      className="num-audio-mini"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(item.kana);
                      }}
                    >
                      🔊
                    </button>
                  </div>

                  <div className="age-kanji-big">{item.kanji || item.kana}</div>
                  <div className="age-kana-pronounce">{item.kana}</div>
                  <div className="age-romaji-sub">{item.romaji}</div>

                  {item.han_viet && (
                    <div className="age-hanviet-sub">Hán-Việt: {item.han_viet}</div>
                  )}

                  {item.notes && (
                    <div className="age-alert-note">
                      💡 {item.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
