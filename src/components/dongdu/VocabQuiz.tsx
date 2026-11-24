import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { DongDuVocabItem, DongDuCategory, VocabQuizType } from '../../types/vocabulary';
import { soundFx } from '../../utils/audio';

interface VocabQuizProps {
  vocabList: DongDuVocabItem[];
  categories: DongDuCategory[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

interface QuizOption {
  id: string;
  text: string;
  subtext?: string;
  isCorrect: boolean;
}

function getEligiblePool(
  vocabList: DongDuVocabItem[],
  selectedCategory: string,
  quizType: VocabQuizType
): DongDuVocabItem[] {
  let pool = selectedCategory === 'all'
    ? vocabList
    : vocabList.filter((v) => v.category === selectedCategory);

  if (quizType === 'kanji_hanviet') {
    pool = pool.filter((v) => Boolean(v.kanji && v.han_viet));
  }

  if (pool.length < 4 && selectedCategory !== 'all') {
    if (quizType === 'kanji_hanviet') {
      pool = vocabList.filter((v) => Boolean(v.kanji && v.han_viet));
    } else {
      pool = vocabList;
    }
  }

  return pool;
}

function buildQuestion(
  pool: DongDuVocabItem[],
  type: VocabQuizType
): { target: DongDuVocabItem | null; options: QuizOption[] } {
  if (pool.length === 0) return { target: null, options: [] };

  const targetIdx = Math.floor(Math.random() * pool.length);
  const target = pool[targetIdx];

  if (type === 'typing') {
    return { target, options: [] };
  }

  const distractors = pool.filter((item) => item.id !== target.id);
  const chosenDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
  const candidateList = [target, ...chosenDistractors].sort(() => 0.5 - Math.random());

  const options: QuizOption[] = candidateList.map((item) => {
    const isCorrect = item.id === target.id;
    if (type === 'ja_to_vi') {
      return {
        id: item.id,
        text: item.vietnamese,
        subtext: item.han_viet ? `[${item.han_viet}]` : undefined,
        isCorrect,
      };
    } else if (type === 'vi_to_ja') {
      return {
        id: item.id,
        text: item.kanji || item.kana,
        subtext: item.kanji ? item.kana : item.romaji,
        isCorrect,
      };
    } else {
      return {
        id: item.id,
        text: item.han_viet || '',
        subtext: item.vietnamese,
        isCorrect,
      };
    }
  });

  return { target, options };
}

export const VocabQuiz: React.FC<VocabQuizProps> = ({
  vocabList,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [quizType, setQuizType] = useState<VocabQuizType>('ja_to_vi');

  // Initial pool and question
  const initialPool = useMemo(
    () => getEligiblePool(vocabList, selectedCategory, 'ja_to_vi'),
    [vocabList, selectedCategory]
  );

  const [questionData, setQuestionData] = useState(() =>
    buildQuestion(initialPool, 'ja_to_vi')
  );

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [typingInput, setTypingInput] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const typingInputRef = useRef<HTMLInputElement>(null);
  const autoNextTimeout = useRef<number | null>(null);

  const currentPool = useMemo(
    () => getEligiblePool(vocabList, selectedCategory, quizType),
    [vocabList, selectedCategory, quizType]
  );

  const currentQuestionItem = questionData.target;
  const options = questionData.options;

  // Next question handler
  const generateNextQuestion = useCallback(
    (pool = currentPool, type = quizType) => {
      if (autoNextTimeout.current) {
        window.clearTimeout(autoNextTimeout.current);
        autoNextTimeout.current = null;
      }

      setIsAnswered(false);
      setSelectedOptionId(null);
      setIsCorrect(false);
      setTypingInput('');
      setQuestionData(buildQuestion(pool, type));
    },
    [currentPool, quizType]
  );

  const handleSelectQuizType = (newType: VocabQuizType) => {
    setQuizType(newType);
    const newPool = getEligiblePool(vocabList, selectedCategory, newType);
    generateNextQuestion(newPool, newType);
  };

  const handleSelectCategory = (catId: string) => {
    onSelectCategory(catId);
    const newPool = getEligiblePool(vocabList, catId, quizType);
    generateNextQuestion(newPool, quizType);
  };

  // Focus typing input when on typing question
  useEffect(() => {
    if (quizType === 'typing' && !isAnswered && typingInputRef.current) {
      typingInputRef.current.focus();
    }
  }, [quizType, isAnswered, currentQuestionItem]);

  const handleSelectOption = (option: QuizOption) => {
    if (isAnswered || !currentQuestionItem) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);
    const correct = option.isCorrect;
    setIsCorrect(correct);

    // Speak audio
    soundFx.speakJapanese(currentQuestionItem.kanji || currentQuestionItem.kana);

    if (correct) {
      soundFx.playCorrectSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      if (newStreak % 5 === 0) {
        soundFx.playStreakSound();
      }
      setScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));

      // Auto advance on correct answer after 1.4s
      autoNextTimeout.current = window.setTimeout(() => {
        generateNextQuestion();
      }, 1400);
    } else {
      soundFx.playIncorrectSound();
      setStreak(0);
      setScore((prev) => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleTypingSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswered || !currentQuestionItem || !typingInput.trim()) return;

    setIsAnswered(true);
    const normalizeRomaji = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/ā/g, 'a')
        .replace(/ī/g, 'i')
        .replace(/ū/g, 'u')
        .replace(/ē/g, 'e')
        .replace(/ō/g, 'o');

    const expandLongVowels = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/ā/g, 'aa')
        .replace(/ī/g, 'ii')
        .replace(/ū/g, 'uu')
        .replace(/ē/g, 'ee')
        .replace(/ō/g, 'ou');

    const normalizedInput = typingInput.trim().toLowerCase();
    const correctKana = currentQuestionItem.kana.trim().toLowerCase();
    const correctRomaji = currentQuestionItem.romaji.trim().toLowerCase();

    const kanaAlternatives = correctKana.split('/').map((s) => s.trim());
    const romajiAlternatives = correctRomaji.split('/').flatMap((s) => [
      s.trim(),
      normalizeRomaji(s),
      expandLongVowels(s),
    ]);

    const matched =
      kanaAlternatives.includes(normalizedInput) ||
      romajiAlternatives.includes(normalizedInput) ||
      normalizedInput === correctKana ||
      normalizedInput === correctRomaji;

    setIsCorrect(matched);
    soundFx.speakJapanese(currentQuestionItem.kanji || currentQuestionItem.kana);

    if (matched) {
      soundFx.playCorrectSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      if (newStreak % 5 === 0) {
        soundFx.playStreakSound();
      }
      setScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));

      autoNextTimeout.current = window.setTimeout(() => {
        generateNextQuestion();
      }, 1500);
    } else {
      soundFx.playIncorrectSound();
      setStreak(0);
      setScore((prev) => ({ ...prev, total: prev.total + 1 }));
    }
  };

  if (!currentQuestionItem || currentPool.length === 0) {
    return (
      <div className="vocab-empty-state">
        <p>Không có đủ từ vựng phù hợp cho bài thi này. Hãy chọn danh mục khác hoặc "Tất cả bài học".</p>
        <button
          type="button"
          className="zen-btn-primary"
          onClick={() => handleSelectCategory('all')}
        >
          Chọn tất cả bài học
        </button>
      </div>
    );
  }

  return (
    <div className="vocab-quiz-container">
      {/* Quiz Top Controls */}
      <div className="quiz-header-toolbar">
        {/* Quiz Type Selector */}
        <div className="quiz-type-selector" role="group" aria-label="Chọn hình thức luyện tập">
          <button
            type="button"
            className={`quiz-type-btn ${quizType === 'ja_to_vi' ? 'active' : ''}`}
            onClick={() => handleSelectQuizType('ja_to_vi')}
            title="Nhìn chữ Nhật, chọn nghĩa tiếng Việt"
          >
            Nhật &rarr; Việt
          </button>
          <button
            type="button"
            className={`quiz-type-btn ${quizType === 'vi_to_ja' ? 'active' : ''}`}
            onClick={() => handleSelectQuizType('vi_to_ja')}
            title="Nhìn tiếng Việt, chọn từ tiếng Nhật"
          >
            Việt &rarr; Nhật
          </button>
          <button
            type="button"
            className={`quiz-type-btn ${quizType === 'kanji_hanviet' ? 'active' : ''}`}
            onClick={() => handleSelectQuizType('kanji_hanviet')}
            title="Đặc sản Đông Du: Luyện Kanji và Hán-Việt"
          >
            Kanji &harr; Hán-Việt
          </button>
          <button
            type="button"
            className={`quiz-type-btn ${quizType === 'typing' ? 'active' : ''}`}
            onClick={() => handleSelectQuizType('typing')}
            title="Gõ Kana hoặc Romaji"
          >
            Gõ từ vựng
          </button>
        </div>

        {/* Category Filter */}
        <div className="quiz-category-filter">
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => handleSelectCategory(e.target.value)}
          >
            <option value="all">Tất cả bài học ({vocabList.length} từ)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_vi}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="quiz-stats-bar">
        <div className="quiz-stat-pill">
          <span className="flame-icon">🔥</span>
          <span>Chuỗi đúng: <strong>{streak}</strong></span>
          <span className="best-streak-sub">(Kỷ lục: {bestStreak})</span>
        </div>
        <div className="quiz-stat-pill">
          <span>Đã làm: <strong>{score.correct}/{score.total}</strong></span>
          {score.total > 0 && (
            <span className="accuracy-rate">
              ({Math.round((score.correct / score.total) * 100)}%)
            </span>
          )}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="quiz-question-card">
        <div className="question-prompt-header">
          {quizType === 'ja_to_vi' && 'Chọn nghĩa tiếng Việt của từ sau:'}
          {quizType === 'vi_to_ja' && 'Chọn từ tiếng Nhật tương ứng:'}
          {quizType === 'kanji_hanviet' && 'Chọn âm Hán-Việt của chữ Hán sau:'}
          {quizType === 'typing' && 'Gõ từ tiếng Nhật (Kana hoặc Romaji):'}
        </div>

        {/* Prompt content */}
        <div className="question-display-target">
          {quizType === 'ja_to_vi' && (
            <div className="target-japanese">
              {currentQuestionItem.kanji ? (
                <>
                  <div className="target-furigana">{currentQuestionItem.kana}</div>
                  <div className="target-kanji-big">{currentQuestionItem.kanji}</div>
                </>
              ) : (
                <div className="target-kana-big">{currentQuestionItem.kana}</div>
              )}
              <div className="target-romaji-sub">{currentQuestionItem.romaji}</div>
            </div>
          )}

          {quizType === 'vi_to_ja' && (
            <div className="target-vietnamese-big">
              {currentQuestionItem.vietnamese}
              {currentQuestionItem.notes && (
                <div className="target-hint-note">({currentQuestionItem.notes})</div>
              )}
            </div>
          )}

          {quizType === 'kanji_hanviet' && (
            <div className="target-kanji-hanviet-view">
              <div className="target-kanji-big">{currentQuestionItem.kanji}</div>
              <div className="target-furigana">{currentQuestionItem.kana}</div>
              <div className="target-vi-hint">Nghĩa: {currentQuestionItem.vietnamese}</div>
            </div>
          )}

          {quizType === 'typing' && (
            <div className="target-vietnamese-big">
              {currentQuestionItem.vietnamese}
              {currentQuestionItem.han_viet && (
                <div className="target-hanviet-sub">Hán-Việt: {currentQuestionItem.han_viet}</div>
              )}
            </div>
          )}

          <button
            type="button"
            className="quiz-speak-prompt-btn"
            onClick={() => soundFx.speakJapanese(currentQuestionItem.kanji || currentQuestionItem.kana)}
            title="Nghe phát âm"
          >
            🔊
          </button>
        </div>

        {/* Answer Section: Options or Typing Input */}
        {quizType !== 'typing' ? (
          <div className="quiz-options-grid">
            {options.map((opt) => {
              let optionClass = 'quiz-option-btn';
              if (isAnswered) {
                if (opt.isCorrect) {
                  optionClass += ' correct';
                } else if (opt.id === selectedOptionId) {
                  optionClass += ' incorrect';
                } else {
                  optionClass += ' disabled';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={optionClass}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                >
                  <span className="option-primary-text">{opt.text}</span>
                  {opt.subtext && (
                    <span className="option-subtext">{opt.subtext}</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <form className="quiz-typing-form" onSubmit={handleTypingSubmit}>
            <div className="typing-input-wrapper">
              <input
                ref={typingInputRef}
                type="text"
                className={`quiz-text-input ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                placeholder="Gõ kana (ví dụ: わたし) hoặc romaji (watashi)..."
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                disabled={isAnswered}
                autoComplete="off"
                spellCheck="false"
              />
              {!isAnswered ? (
                <button
                  type="submit"
                  className="typing-submit-btn"
                  disabled={!typingInput.trim()}
                >
                  Kiểm tra &rarr;
                </button>
              ) : null}
            </div>
          </form>
        )}

        {/* Feedback details and Next button when answered */}
        {isAnswered && (
          <div className={`quiz-feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
            <div className="feedback-result-row">
              <span className="feedback-badge">
                {isCorrect ? '✓ Chính xác!' : '✕ Chưa đúng'}
              </span>
              <div className="feedback-solution">
                <span className="sol-jp">
                  {currentQuestionItem.kanji || currentQuestionItem.kana}
                </span>
                {currentQuestionItem.kanji && (
                  <span className="sol-kana"> ({currentQuestionItem.kana})</span>
                )}
                <span className="sol-vi"> = {currentQuestionItem.vietnamese}</span>
                {currentQuestionItem.han_viet && (
                  <span className="sol-hv"> [{currentQuestionItem.han_viet}]</span>
                )}
              </div>
            </div>

            {currentQuestionItem.notes && (
              <div className="feedback-notes">
                💡 {currentQuestionItem.notes}
              </div>
            )}

            <div className="feedback-actions">
              <button
                type="button"
                className="zen-btn-primary next-question-btn"
                onClick={() => generateNextQuestion()}
              >
                Câu tiếp theo &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
