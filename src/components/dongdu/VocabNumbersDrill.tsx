import React, { useState } from 'react';
import type { DongDuVocabItem } from '../../types/vocabulary';
import { soundFx } from '../../utils/audio';

interface VocabNumbersDrillProps {
  vocabList: DongDuVocabItem[];
}

export const VocabNumbersDrill: React.FC<VocabNumbersDrillProps> = ({ vocabList }) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'primary' | 'secondary'>('primary');

  const numbersList = vocabList.filter((v) => v.category === 'numbers');
  const ageList = vocabList.filter((v) => v.category === 'age_counters');
  const largeNumbersList = vocabList.filter((v) => v.category === 'numbers_large');
  const floorList = vocabList.filter((v) => v.category === 'floor_counters');

  const isLargeMode = largeNumbersList.length > 0 || floorList.length > 0;
  const activeNumbersList = isLargeMode ? largeNumbersList : numbersList;
  const activeCountersList = isLargeMode ? floorList : ageList;

  const specialNumberIds = isLargeMode
    ? ['l3_num_300', 'l3_num_600', 'l3_num_800', 'l3_num_1000', 'l3_num_3000', 'l3_num_8000', 'l3_num_10000']
    : ['num_04', 'num_07', 'num_09', 'num_00', 'num_100'];

  const specialCounterIds = isLargeMode
    ? ['l3_floor_1', 'l3_floor_3', 'l3_floor_6', 'l3_floor_8', 'l3_floor_10', 'l3_floor_q']
    : ['age_01', 'age_08', 'age_10', 'age_20'];

  const handleSpeak = (text: string) => {
    soundFx.speakJapanese(text);
  };

  return (
    <div className="numbers-drill-container">
      {/* Subtab Navigation */}
      <div className="drill-subtabs">
        <button
          type="button"
          className={`drill-subtab-btn ${selectedSubTab === 'primary' ? 'active' : ''}`}
          onClick={() => setSelectedSubTab('primary')}
        >
          {isLargeMode ? '🔢 Số Đếm Lớn (100 - 1.000.000)' : '🔢 Bảng Số Đếm (0 - 100)'}
        </button>
        <button
          type="button"
          className={`drill-subtab-btn ${selectedSubTab === 'secondary' ? 'active' : ''}`}
          onClick={() => setSelectedSubTab('secondary')}
        >
          {isLargeMode ? '🏢 Đếm Tầng Lầu (~かい / ~がい)' : '🎂 Đếm Tuổi & Biến Âm Đặc Biệt'}
        </button>
      </div>

      {selectedSubTab === 'primary' && (
        <div className="numbers-overview-panel">
          {isLargeMode ? (
            <div className="drill-info-banner">
              <span className="banner-icon">ℹ️</span>
              <div className="banner-text">
                <strong>Quy tắc biến âm số lớn trong Bài 3:</strong>
                <p>Hàng trăm (<code>ひゃく</code>): <strong>300</strong> = <code>さんびゃく</code>, <strong>600</strong> = <code>ろっぴゃく</code>, <strong>800</strong> = <code>はっぴゃく</code>.</p>
                <p>Hàng nghìn (<code>せん</code>): <strong>1.000</strong> = <code>せん</code> (không nói <i>いちせん</i>), <strong>3.000</strong> = <code>さんぜん</code>, <strong>8.000</strong> = <code>はっせん</code>.</p>
                <p>Hàng vạn (<code>まん</code>): <strong>10.000</strong> bắt buộc đọc là <code>いちまん</code> (1 vạn).</p>
              </div>
            </div>
          ) : (
            <div className="drill-info-banner">
              <span className="banner-icon">ℹ️</span>
              <div className="banner-text">
                <strong>Quy tắc ghép số tiếng Nhật:</strong>
                <p>Số hàng chục = <code>[Số 2-9] + じゅう (10)</code>. Ví dụ: 20 = <code>に (2) + じゅう (10) = にじゅう</code>.</p>
                <p>Số lẻ = <code>[Hàng chục] + [Số 1-9]</code>. Ví dụ: 25 = <code>にじゅう + ご = にじゅうご</code>.</p>
                <p>Lưu ý đặc biệt các số có nhiều cách đọc: <strong>4 (よん / し)</strong>, <strong>7 (なな / しち)</strong>, <strong>9 (きゅう / く)</strong>.</p>
              </div>
            </div>
          )}

          <div className="numbers-grid">
            {activeNumbersList.map((item) => {
              const isSpecial = specialNumberIds.includes(item.id);

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
                    <span className="num-numeric-val">
                      {item.value !== undefined ? item.value.toLocaleString('vi-VN') : item.vietnamese}
                    </span>
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

      {selectedSubTab === 'secondary' && (
        <div className="ages-overview-panel">
          {isLargeMode ? (
            <div className="drill-info-banner warning-style">
              <span className="banner-icon">⚠️</span>
              <div className="banner-text">
                <strong>Các biến âm khi đếm tầng lầu (~かい / ~がい) trong Bài 3:</strong>
                <ul>
                  <li><strong>Tầng 1:</strong> <code>いっかい</code> (âm ngắt <code>っ</code>)</li>
                  <li><strong>Tầng 3:</strong> <code>さんがい</code> (biến âm đục <code>がい</code>)</li>
                  <li><strong>Tầng 6:</strong> <code>ろっかい</code> (âm ngắt <code>っ</code>)</li>
                  <li><strong>Tầng 8:</strong> <code>はっかい</code> (âm ngắt <code>っ</code>)</li>
                  <li><strong>Tầng 10:</strong> <code>じゅっかい</code> (âm ngắt <code>っ</code>)</li>
                  <li><strong>Hỏi tầng mấy:</strong> <code>なんがい</code> hoặc <code>なんかい</code></li>
                </ul>
              </div>
            </div>
          ) : (
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
          )}

          <div className="ages-cards-grid">
            {activeCountersList.map((item) => {
              const isSpecial = specialCounterIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`age-card ${isSpecial ? 'special-rendaku' : ''}`}
                  onClick={() => handleSpeak(item.kana.split('/')[0].trim())}
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
                        handleSpeak(item.kana.split('/')[0].trim());
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
