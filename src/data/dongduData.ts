import type { DongDuLesson, DongDuVocabItem } from '../types/vocabulary';
import lesson1Json from '../assets/dongdu/dongdu-1-vocabulary.json';

// Registered lessons from the Dong Du curriculum
export const DONGDU_LESSONS: DongDuLesson[] = [
  lesson1Json as DongDuLesson,
  // Future lessons:
  // lesson2Json as DongDuLesson,
];

export function getLesson(lessonNumber: number): DongDuLesson {
  const found = DONGDU_LESSONS.find((l) => l.metadata.lesson === lessonNumber);
  return found || DONGDU_LESSONS[0];
}

export function filterVocab(
  vocabList: DongDuVocabItem[],
  categoryId: string,
  searchQuery: string
): DongDuVocabItem[] {
  let list = vocabList;

  if (categoryId && categoryId !== 'all') {
    list = list.filter((item) => item.category === categoryId);
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
}
