/// <reference types="dom-chromium-ai" />
/**
 * Soma Extension - AI Word Selector
 * Uses Chrome AI to intelligently select words for translation
 */

import { DifficultyLevel } from '../types';

/**
 * Common English stop words to filter out
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'they', 'this', 'but', 'or', 'not',
  'you', 'all', 'can', 'had', 'her', 'his', 'if', 'one', 'our',
  'out', 'up', 'we', 'who', 'when', 'where', 'which', 'have', 'been',
  'their', 'what', 'there', 'more', 'into', 'than', 'them', 'some',
  'could', 'would', 'should', 'about', 'also', 'other', 'only', 'very',
  'just', 'now', 'any', 'such', 'these', 'those', 'may', 'much', 'said',
  'then', 'well', 'even', 'each', 'she', 'him', 'my', 'me', 'no', 'yes',
]);

/**
 * Extract all unique candidate words from page text
 */
export function extractCandidateWords(pageText: string): string[] {
  // Convert to lowercase and split into words
  const words = pageText
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => {
      // Filter criteria:
      // 1. Length >= 4 characters
      // 2. Not a stop word
      // 3. Only letters
      return (
        word.length >= 4 &&
        !STOP_WORDS.has(word) &&
        /^[a-z]+$/.test(word)
      );
    });

  // Return unique words
  return Array.from(new Set(words));
}

/**
 * Get word count for difficulty level
 */
function getWordCountForDifficulty(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case 'beginner':
      return 15; // 15 simple words
    case 'intermediate':
      return 30; // 30 moderate words
    case 'advanced':
      return 50; // 50 complex words
    default:
      return 15;
  }
}

/**
 * Get AI prompt for word selection based on difficulty
 */
function getSelectionPrompt(
  words: string[],
  difficulty: DifficultyLevel,
  targetLanguage: string
): string {
  const wordCount = getWordCountForDifficulty(difficulty);
  const languageNames: Record<string, string> = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    zh: 'Chinese',
    ko: 'Korean',
    ru: 'Russian',
    ar: 'Arabic',
  };
  const languageName = languageNames[targetLanguage] || targetLanguage.toUpperCase();

  let criteria = '';
  switch (difficulty) {
    case 'beginner':
      criteria = `Prioritize:
- Extremely common words (frequency rank < 1000)
- Concrete nouns (house, food, water, book, car)
- Basic verbs (eat, walk, see, have, make)
- Simple adjectives (big, small, good, bad, new)
- Words that are easy to visualize
- 1-2 syllable words when possible`;
      break;
    case 'intermediate':
      criteria = `Prioritize:
- Moderately common words (frequency rank 1000-5000)
- Abstract nouns (idea, thought, concept, reason)
- Action verbs (create, develop, consider, provide)
- Descriptive adjectives (important, different, various)
- Common adverbs (often, always, usually)
- 2-3 syllable words`;
      break;
    case 'advanced':
      criteria = `Prioritize:
- Academic/professional vocabulary (frequency rank 5000+)
- Complex abstract concepts
- Sophisticated verbs (analyze, synthesize, facilitate)
- Technical adjectives (significant, comprehensive, substantial)
- Domain-specific terms
- Multi-syllable words`;
      break;
  }

  return `You are a language learning assistant helping users learn ${languageName}.

TASK: From the following list of English words, select EXACTLY ${wordCount} words that are most suitable for a ${difficulty} level language learner to study.

SELECTION CRITERIA FOR ${difficulty.toUpperCase()} LEVEL:
${criteria}

RULES:
1. Return ONLY a valid JSON array of strings
2. The words you return should be in English and present in the word list you will be given.
2. Select EXACTLY ${wordCount} words (no more, no less)
3. Do NOT include explanations or comments
4. Do NOT include stop words or articles
5. Words should be appropriate for translation to ${languageName}. The translation will be done with a separate AI model.
6. Prioritize words that are meaningful and useful for learners

WORD LIST:
${words.slice(0, 200).join(', ')}

OUTPUT FORMAT (JSON array only):
["word1", "word2", "word3", ...]`;
}

/**
 * Use Chrome AI to intelligently select words for translation
 */
export async function selectWordsWithAI(
  candidateWords: string[],
  difficulty: DifficultyLevel,
  targetLanguage: string
): Promise<string[]> {
  console.log('[Soma AI] Starting AI word selection...', {
    candidates: candidateWords.length,
    difficulty,
    targetLanguage,
  });

  try {
    const availability = await LanguageModel.availability();
    console.log('[Soma AI] Language model availability:', availability);
    let session;

    if (availability === 'available') {
      console.log('[Soma AI] Model is available, creating session...');
      session = await LanguageModel.create({
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`[Soma AI] Model download progress: ${Math.round(e.loaded * 100)}%`);
          });
        },
      });
    } else if (availability === 'downloadable') {
      console.log('[Soma AI] Model is downloadable. Checking for user activation...');
      
      if (navigator.userActivation.isActive) {
        console.log('[Soma AI] User activation detected, creating session (will trigger download)...');
        session = await LanguageModel.create({
          expectedInputs: [{type: "text", languages: ["en"]}],
          expectedOutputs: [{type: "text", languages: ["en"]}],
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              console.log(`[Soma AI] Model download progress: ${Math.round(e.loaded * 100)}%`);
            });
          },
        });
        console.log('[Soma AI] Model downloaded and session created.');
      } else {
        console.warn('[Soma AI] Model is downloadable, but user activation is required. Using fallback.');
        return fallbackWordSelection(candidateWords, difficulty);
      }
    } else {
      // This covers 'unavailable' and 'downloading'
      console.warn(`[Soma AI] Language model status is '${availability}'. Using fallback.`);
      return fallbackWordSelection(candidateWords, difficulty);
    }

    console.log('[Soma AI] AI session created, generating prompt...');

    // Get selection prompt
    const prompt = getSelectionPrompt(candidateWords, difficulty, targetLanguage);

    // Get AI response
    console.log('[Soma AI] Sending prompt to AI...');
    console.log('[Soma AI] Actual prompt:', prompt);
    const response = await session.prompt(prompt);
    console.log('[Soma AI] AI response received:', response.substring(0, 200) + '...');

    // Clean up session
    session.destroy();

    // Parse JSON response
    try {
      // Extract JSON array from response (may have extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('[Soma AI] No JSON array found in response');
        return fallbackWordSelection(candidateWords, difficulty);
      }

      const selectedWords = JSON.parse(jsonMatch[0]) as string[];

      // Validate response
      if (!Array.isArray(selectedWords) || selectedWords.length === 0) {
        console.error('[Soma AI] Invalid AI response format');
        return fallbackWordSelection(candidateWords, difficulty);
      }

      // Filter to ensure words are actually in candidate list
      const validWords = selectedWords.filter(word =>
        candidateWords.includes(word.toLowerCase())
      );

      console.log('[Soma AI] AI selected', validWords.length, 'words');
      return validWords;
    } catch (parseError) {
      console.error('[Soma AI] Error parsing AI response:', parseError);
      return fallbackWordSelection(candidateWords, difficulty);
    }
  } catch (error) {

    console.error('[Soma AI] Error in AI word selection:', error);
    return fallbackWordSelection(candidateWords, difficulty);
  }
}

/**
 * Fallback word selection (simple frequency-based approach)
 */
function fallbackWordSelection(
  candidateWords: string[],
  difficulty: DifficultyLevel
): string[] {
  const wordCount = getWordCountForDifficulty(difficulty);

  // Simple heuristic: prefer shorter words for beginners, longer for advanced
  const sortedWords = [...candidateWords].sort((a, b) => {
    if (difficulty === 'beginner') {
      // Prefer shorter words
      return a.length - b.length;
    } else if (difficulty === 'advanced') {
      // Prefer longer words
      return b.length - a.length;
    } else {
      // Intermediate: random mix
      return Math.random() - 0.5;
    }
  });

  // Take first N words
  return sortedWords.slice(0, Math.min(wordCount, sortedWords.length));
}

/**
 * Translate selected words using Chrome AI Translator
 */
export async function translateWordsWithAI(
  words: string[],
  targetLanguage: string
): Promise<Record<string, string>> {
  console.log('[Soma AI] Starting AI translation of', words.length, 'words');
  
  const sourceLanguage = 'en';
  const availability = await Translator.availability({ sourceLanguage, targetLanguage });
  console.log('[Soma AI] Translator availability:', availability);
  
  let session;
  
  if (availability === 'available') {
    console.log('[Soma AI] Translator model is available, creating session...');
    session = await Translator.create({
      sourceLanguage, // Fixed: was 'es'
      targetLanguage,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`[Soma AI] Translator model download progress: ${Math.round(e.loaded * 100)}%`);
        });
      },
    });
  } else if (availability === 'downloadable') {
    console.log('[Soma AI] Translator model is downloadable. Checking for user activation...');
    
    if (navigator.userActivation.isActive) {
      console.log('[Soma AI] User activation detected, creating session (will trigger download)...');
      session = await Translator.create({
        sourceLanguage, // Fixed: was 'es'
        targetLanguage,
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`[Soma AI] Translator model download progress: ${Math.round(e.loaded * 100)}%`);
          });
        },
      });
      console.log('[Soma AI] Translator model downloaded and session created.');
    } else {
      console.warn('[Soma AI] Translator model is downloadable, but user activation is required. Using fallback.');
      return getFallbackTranslations(words, targetLanguage);
    }
  } else {
    // This covers 'unavailable' and 'downloading'
    console.warn(`[Soma AI] Translator model status is '${availability}'. Using fallback.`);
    return getFallbackTranslations(words, targetLanguage);
  }

  const translationMap: Record<string, string> = {};

  try {
    // Translate all words concurrently
    console.log('[Soma AI] Translating words concurrently...');
    const translationPromises = words.map(async (word) => {
      try {
        const translation = await session.translate(word);
        return { word, translation };
      } catch (error) {
        console.error(`[Soma AI] Error translating "${word}":`, error);
        return { word, translation: word }; // Keep original if translation fails
      }
    });

    const results = await Promise.all(translationPromises);

    // Build translation map
    results.forEach(({ word, translation }) => {
      translationMap[word] = translation;
    });
    
    // Clean up session
    session.destroy();

    console.log('[Soma AI] Translation complete:', Object.keys(translationMap).length, 'words');
    return translationMap;
  } catch (error) {
    console.error('[Soma AI] Error in AI translation:', error);
    // Ensure session is destroyed even if Promise.all fails
    if (session) {
      session.destroy();
    }
    return getFallbackTranslations(words, targetLanguage);
  }
}

/**
 * Fallback translations (static word lists for common languages)
 */
function getFallbackTranslations(
  words: string[],
  targetLanguage: string
): Record<string, string> {
  console.log('[Soma AI] Using fallback translations');

  // Static translation maps (limited but reliable)
  const staticTranslations: Record<string, Record<string, string>> = {
    es: {
      house: 'casa',
      food: 'comida',
      water: 'agua',
      book: 'libro',
      time: 'tiempo',
      person: 'persona',
      year: 'año',
      work: 'trabajo',
      life: 'vida',
      hand: 'mano',
      part: 'parte',
      child: 'niño',
      woman: 'mujer',
      place: 'lugar',
      week: 'semmana',
      case: 'caso',
      point: 'punto',
      government: 'gobierno',
      company: 'empresa',
      number: 'número',
    },
    fr: {
      house: 'maison',
      food: 'nourriture',
      water: 'eau',
      book: 'livre',
      time: 'temps',
      person: 'personne',
      year: 'année',
      work: 'travail',
      life: 'vie',
      hand: 'main',
      part: 'partie',
      child: 'enfant',
      woman: 'femme',
      place: 'lieu',
      week: 'semaine',
      case: 'cas',
      point: 'point',
      government: 'gouvernement',
      company: 'entreprise',
      number: 'nombre',
    },
    de: {
      house: 'Haus',
      food: 'Essen',
      water: 'Wasser',
      book: 'Buch',
      time: 'Zeit',
      person: 'Person',
      year: 'Jahr',
      work: 'Arbeit',
      life: 'Leben',
      hand: 'Hand',
      part: 'Teil',
      child: 'Kind',
      woman: 'Frau',
      place: 'Ort',
      week: 'Woche',
      case: 'Fall',
      point: 'Punkt',
      government: 'Regierung',
      company: 'Firma',
      number: 'Nummer',
    },
  };

  const translations = staticTranslations[targetLanguage] || {};
  const translationMap: Record<string, string> = {};

  words.forEach(word => {
    translationMap[word] = translations[word] || word; // Keep original if no translation
  });

  return translationMap;
}