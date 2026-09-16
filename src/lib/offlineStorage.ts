/**
 * NexLearn AI - Native IndexedDB Offline Storage Engine
 * High-performance, zero-dependency client-side database for offline learning.
 * Stores complete course outlines, 2-page module notes, exercises, code, and flashcards.
 */

const DB_NAME = 'NexLearnOfflineDB';
const DB_VERSION = 1;

export interface OfflineCourse {
  id: string;
  title: string;
  description?: string;
  topic?: string;
  level?: string;
  goal?: string;
  hoursPerDay?: number;
  duration?: string;
  roadmap?: any;
  modules: Array<{
    id: string;
    title: string;
    description?: string;
    difficulty?: string;
    orderIndex?: number;
    subtopics?: string;
    completed?: boolean;
  }>;
  savedAt: number;
  totalModules: number;
}

export interface OfflineModule {
  id: string;
  courseId: string;
  title: string;
  difficulty?: string;
  notes?: string;
  summary?: string;
  examples?: string;
  exercises?: string;
  subtopics?: string;
  orderIndex?: number;
  savedAt: number;
}

export interface OfflineFlashcardDeck {
  key: string; // `${courseId}:${moduleId}`
  courseId: string;
  moduleId: string;
  cards: Array<{
    id: string;
    question: string;
    answer: string;
    hint?: string;
  }>;
  savedAt: number;
}

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not available in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Courses Store
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }

      // 2. Modules Store (Composite key: courseId:moduleId)
      if (!db.objectStoreNames.contains('modules')) {
        const moduleStore = db.createObjectStore('modules', { keyPath: 'id' });
        moduleStore.createIndex('courseId', 'courseId', { unique: false });
      }

      // 3. Flashcards Store
      if (!db.objectStoreNames.contains('flashcards')) {
        db.createObjectStore('flashcards', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save or update a course for offline access
 */
export async function saveCourseOffline(course: any): Promise<void> {
  if (!course || !course.id) return;
  try {
    const db = await openDB();
    const tx = db.transaction('courses', 'readwrite');
    const store = tx.objectStore('courses');

    const offlineRecord: OfflineCourse = {
      id: course.id,
      title: course.title || 'Untitled Course',
      description: course.description || '',
      topic: course.topic || '',
      level: course.level || 'Intermediate',
      goal: course.goal || '',
      hoursPerDay: course.hoursPerDay || 1,
      duration: course.duration || '',
      roadmap: course.roadmap || null,
      modules: (course.modules || []).map((m: any, idx: number) => ({
        id: m.id,
        title: m.title || `Module ${idx + 1}`,
        description: m.description || '',
        difficulty: m.difficulty || course.level || 'Intermediate',
        orderIndex: m.orderIndex ?? idx,
        subtopics: m.subtopics || '',
        completed: Boolean(m.completed),
      })),
      savedAt: Date.now(),
      totalModules: (course.modules || []).length,
    };

    store.put(offlineRecord);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineStorage] Failed to save course:', err);
  }
}

/**
 * Get a course from offline storage
 */
export async function getOfflineCourse(courseId: string): Promise<OfflineCourse | null> {
  if (!courseId) return null;
  try {
    const db = await openDB();
    const tx = db.transaction('courses', 'readonly');
    const store = tx.objectStore('courses');
    const request = store.get(courseId);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Retrieve all courses saved offline
 */
export async function getAllOfflineCourses(): Promise<OfflineCourse[]> {
  try {
    const db = await openDB();
    const tx = db.transaction('courses', 'readonly');
    const store = tx.objectStore('courses');
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Check if a course is saved offline
 */
export async function isCourseSavedOffline(courseId: string): Promise<boolean> {
  const course = await getOfflineCourse(courseId);
  return Boolean(course);
}

/**
 * Delete a course and all its cached modules from offline storage
 */
export async function deleteOfflineCourse(courseId: string): Promise<void> {
  try {
    const db = await openDB();

    // 1. Delete course
    const txCourse = db.transaction('courses', 'readwrite');
    txCourse.objectStore('courses').delete(courseId);

    // 2. Delete all modules for course
    const txModules = db.transaction('modules', 'readwrite');
    const moduleStore = txModules.objectStore('modules');
    const index = moduleStore.index('courseId');
    const request = index.getAllKeys(courseId);

    request.onsuccess = () => {
      const keys = request.result || [];
      keys.forEach((k) => moduleStore.delete(k));
    };
  } catch (err) {
    console.warn('[OfflineStorage] Error deleting offline course:', err);
  }
}

/**
 * Save a single module's full content (notes, examples, exercises, summary) offline
 */
export async function saveModuleOffline(courseId: string, module: any): Promise<void> {
  if (!courseId || !module || !module.id) return;
  try {
    const db = await openDB();
    const tx = db.transaction('modules', 'readwrite');
    const store = tx.objectStore('modules');

    const record: OfflineModule = {
      id: `${courseId}:${module.id}`,
      courseId,
      title: module.title || 'Untitled Module',
      difficulty: module.difficulty || 'Intermediate',
      notes: module.notes || '',
      summary: module.summary || '',
      examples: module.examples || '',
      exercises: module.exercises || '',
      subtopics: module.subtopics || '',
      orderIndex: module.orderIndex ?? 0,
      savedAt: Date.now(),
    };

    store.put(record);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[OfflineStorage] Failed to save module:', err);
  }
}

/**
 * Get a module from offline storage
 */
export async function getOfflineModule(courseId: string, moduleId: string): Promise<OfflineModule | null> {
  if (!courseId || !moduleId) return null;
  try {
    const db = await openDB();
    const tx = db.transaction('modules', 'readonly');
    const store = tx.objectStore('modules');
    const request = store.get(`${courseId}:${moduleId}`);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save a deck of flashcards for offline practice
 */
export async function saveFlashcardsOffline(courseId: string, moduleId: string, cards: any[]): Promise<void> {
  if (!courseId || !moduleId || !cards || cards.length === 0) return;
  try {
    const db = await openDB();
    const tx = db.transaction('flashcards', 'readwrite');
    const store = tx.objectStore('flashcards');

    const record: OfflineFlashcardDeck = {
      key: `${courseId}:${moduleId}`,
      courseId,
      moduleId,
      cards: cards.map((c, i) => ({
        id: c.id || String(i),
        question: c.question || c.front || '',
        answer: c.answer || c.back || '',
        hint: c.hint || '',
      })),
      savedAt: Date.now(),
    };

    store.put(record);
  } catch (err) {
    console.warn('[OfflineStorage] Failed to save flashcards:', err);
  }
}

/**
 * Get flashcards from offline storage
 */
export async function getOfflineFlashcards(courseId: string, moduleId: string): Promise<OfflineFlashcardDeck | null> {
  try {
    const db = await openDB();
    const tx = db.transaction('flashcards', 'readonly');
    const store = tx.objectStore('flashcards');
    const request = store.get(`${courseId}:${moduleId}`);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Complete 1-Click Download: Fetches course outline and pre-downloads every module's
 * complete 2-page notes, worked examples, exercises, and summaries into IndexedDB.
 */
export async function downloadFullCourseForOffline(
  courseId: string,
  onProgress?: (completed: number, total: number, currentTitle: string) => void
): Promise<{ success: boolean; totalModules: number }> {
  try {
    // 1. Fetch course details
    const res = await fetch(`/api/courses/${courseId}`);
    if (!res.ok) throw new Error('Failed to fetch course');
    const data = await res.json();
    const course = data.course;
    if (!course) throw new Error('Course payload invalid');

    // Save course root
    await saveCourseOffline(course);

    const modules = course.modules || [];
    const total = modules.length;

    // 2. Fetch and save each module
    for (let i = 0; i < total; i++) {
      const m = modules[i];
      if (onProgress) {
        onProgress(i, total, m.title);
      }

      try {
        const modRes = await fetch(`/api/courses/${courseId}/modules/${m.id}`);
        if (modRes.ok) {
          const modData = await modRes.json();
          if (modData.module) {
            await saveModuleOffline(courseId, modData.module);
          }
        }
      } catch (modErr) {
        console.warn(`[OfflineStorage] Failed to pre-cache module ${m.id}:`, modErr);
      }
    }

    if (onProgress) {
      onProgress(total, total, 'Completed!');
    }

    return { success: true, totalModules: total };
  } catch (err) {
    console.error('[OfflineStorage] Error during full course download:', err);
    throw err;
  }
}
