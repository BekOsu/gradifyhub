export type VocabPackItem = {
  phrase: string;
  meaning: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'Daily Life' | 'Work' | 'Technical' | 'Opinion' | 'Social';
  example: string;
};

export { dailyLifePack } from './daily-life';
export { workCommunicationPack } from './work-communication';
export { technicalDevopsPack } from './technical-devops';
export { technicalAIPack } from './technical-ai';
export { technicalFullstackPack } from './technical-fullstack';
export { opinionDiscussionPack } from './opinion-discussion';
export { socialCommunicationPack } from './social-communication';
