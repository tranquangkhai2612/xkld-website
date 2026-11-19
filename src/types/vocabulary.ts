export interface DongDuVocabItem {
  id: string;
  category: string;
  kana: string;
  kanji: string | null;
  romaji: string;
  vietnamese: string;
  han_viet: string | null;
  part_of_speech: string;
  politeness: string;
  notes: string | null;
  value?: number;
}

export interface DongDuCategory {
  id: string;
  name_vi: string;
  name_ja: string;
}

export interface DongDuLessonMetadata {
  title: string;
  source: string;
  level: string;
  lesson: number;
  description: string;
  language_pairs: string[];
  schema_version: string;
  total_entries: number;
}

export interface DongDuLesson {
  metadata: DongDuLessonMetadata;
  categories: DongDuCategory[];
  vocabulary: DongDuVocabItem[];
}

export type VocabStudyMode = 'flashcard' | 'quiz' | 'list' | 'numbers';

export type VocabQuizType = 'ja_to_vi' | 'vi_to_ja' | 'kanji_hanviet' | 'typing';
