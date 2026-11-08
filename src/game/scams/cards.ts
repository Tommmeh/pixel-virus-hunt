// Every lesson card shown in the Achievements app: the Gemini chat scams plus each storyline's cards.
// To add a storyline's cards: export them from its folder and append them here.
import { AARON_CARDS } from "../storylines/aaron/cards";
import { AI_SCAMS, type LessonCard } from "./ai";

export const LESSON_CARDS: LessonCard[] = [...AI_SCAMS, ...AARON_CARDS];

export const getLessonCard = (id: string) => LESSON_CARDS.find((c) => c.id === id);
