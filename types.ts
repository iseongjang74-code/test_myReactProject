export type WebsiteCategory = 'Game' | 'MBTI';

export interface Website {
  id: number;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: WebsiteCategory;
  path?: string;
}

export interface IntroductionCardProps {
  name: string;
  likes: string[];
  motto: string;
  imageUrl: string;
}

export enum Rarity {
  N = 'N',
  R = 'R',
  SR = 'SR',
  SSR = 'SSR',
  Mythic = '신화',
}

export enum Attribute {
  Fire = '불',
  Water = '물',
  Wind = '바람',
  Light = '빛',
  Dark = '어둠',
}

export enum UltimateRarity {
    R = 'R',
    SR = 'SR',
    SSR = 'SSR',
    Mythic = '신화',
}

export enum UltimateEffectType {
    SINGLE_TARGET_DAMAGE = '단일 대상 공격',
    AREA_OF_EFFECT_DAMAGE = '광역 공격',
    HEAL_SELF = '자가 치유',
    HEAL_TEAM = '팀 치유',
}

export enum TargetType {
    ENEMY_SINGLE = '적 단일',
    ENEMY_ALL = '적 전체',
    ALLY_SELF = '자신',
    ALLY_ALL = '아군 전체',
}

export interface Equipment {
    id: number;
    name: string;
    rarity: Rarity;
    level: number;
    cards: number; // For progression
    baseStats: {
        attack: number;
        hp: number;
        speed: number;
    };
    specialEffect: string;
    description: string;
    imageUrl?: string; 
}


export interface UltimateSkill {
    id: number;
    name: string;
    description: string;
    rarity: UltimateRarity;
    level: number;
    effectType: UltimateEffectType;
    power: number; // e.g., damage multiplier or heal amount
    targetType: TargetType;
}

export interface Character {
  id: number;
  name: string;
  rarity: Rarity;
  attribute: Attribute;
  imageUrl: string;
  level: number;
  cards: number; // 다음 레벨업까지 필요한 카드 수량
  description: string;
  equippedUltimateId: number;
  equippedEquipmentId?: number; // New field
}

export interface Team {
  name: string;
  characters: (Character | null)[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  requiredCharacterAttribute?: Attribute;
}

export interface PlayerFriend {
  id: number;
  name: string;
  team: Team;
  lastActive: string;
  lastRarePull?: Character;
}

// --- Guild System Types ---
export interface GuildMember {
    username: string;
    joinedAt: string;
}

export interface ChatMessage {
    username: string;
    message: string;
    timestamp: string;
}

export interface RaidBoss {
    name: string;
    imageUrl: string;
    hp: number;
    maxHp: number;
    reward: number;
    lastAttackedBy?: string;
}

export interface Guild {
    id: string;
    name: string;
    creator: string;
    members: GuildMember[];
    chat: ChatMessage[];
    raidBoss: RaidBoss;
}
// --- End Guild System Types ---


export interface PlayerState {
  currency: number;
  characters: Character[];
  teams: Team[];
  achievements: Achievement[];
  friends: PlayerFriend[];
  ultimateSkills: UltimateSkill[];
  inventory: Equipment[]; // New field
  guildId: string | null;
}

export type EntityType = 'PLAYER' | 'ENEMY' | 'KEY' | 'BATTERY' | 'DOOR' | 'CAR' | 'LOCKER' | 'BED' | 'SHADOW' | 'NOTE' | 'BAT';

export interface KeyConfig {
  MOVE_FORWARD: string;
  MOVE_BACKWARD: string;
  MOVE_LEFT: string;
  MOVE_RIGHT: string;
  RUN: string;
  SNEAK: string; // Changed from Control to customizable
  INTERACT: string;
  FLASHLIGHT: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean; // If false, removed from rendering (e.g. picked up key)
  // Locker/Bed specific
  isOpen?: boolean; // Used for Locker
  content?: 'BATTERY' | 'KEY' | 'BAT' | 'EMPTY';
  // Note specific
  text?: string;
}

export interface Player extends Entity {
  speed: number;
  battery: number; // 0-100
  keys: number;
  noise: number; // 0-1 (Current noise level generated)
  flashlightOn: boolean;
  hasFlashlight: boolean; // Narrative item
  direction: Point; // Vector for flashlight facing
  isFlickering: boolean; // Horror event state
  isCrouching: boolean;
  
  // New Mechanics
  isHidden: boolean; // Inside a locker or under bed
  hidingType?: 'LOCKER' | 'BED'; // Visual distinction
  hasBat: boolean;
  attackTimer: number; // > 0 means swinging
  lastAttackTime: number;

  // View control
  yaw: number;   // Rotation in radians
  pitch: number; // Vertical tilt (look ahead) -1 to 1
  
  // Horror States
  lastJumpScareTime: number;
  sanity: number; // 0-1 (1 is insane)
}
export interface Word {
  id: string;
  term: string;
  definition: string;
  example?: string;
  mnemonic?: string; // optional memory hook
  status: 'new' | 'memorized' | 'wrong';
  isMemorized?: boolean;
}

export interface WordSet {
  id: number;
  words: Word[];
  isUnlocked: boolean;
  score?: number;
}

export interface WordBlock {
  id: number;
  words: Word[];
  status: 'locked' | 'ready' | 'in-progress' | 'completed';
}

export enum AppMode {
  HOME = 'HOME',
  STUDY = 'STUDY',
  TEST = 'TEST',
  RESULT = 'RESULT',
  WRONG_REVIEW = 'WRONG_REVIEW' // Feature 6: Specific mode for wrong answers
}
export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2 code for flag emojis
}

export type LeaderboardData = Record<string, number>;

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type AutoClickTier = 'slow' | 'fast' | 'ludicrous';

export interface AutoClickTierInfo {
  id: AutoClickTier;
  name: string;
  clicksPerSecond: number;
  price: string;
  intervalMs: number;
}

export interface CountryTheme {
  button: string;
  text: string;
}

export enum RelationshipType {
  BEST_FRIEND = '베스트 프렌드',
  SCHOOL = '학교 친구',
  WORK = '직장 동료',
  HOBBY = '취미 활동',
  OTHER = '기타'
}

export interface SocialFriend {
  id: string;
  name: string;
  relationship: RelationshipType;
  birthday?: string;
  notes?: string;
  createdAt: number;
}

export interface AIGeneratedContent {
  nicknames: string[];
  message: string;
}

export enum Difficulty {
  EASY = '쉬움',
  MEDIUM = '보통',
  HARD = '어려움'
}

// Gacha / Battle difficulties used in the gacha module
export type GachaDifficulty =
  | 'very_easy'
  | 'easy'
  | 'normal'
  | 'hard'
  | 'very_hard'
  | 'hell'
  | 'hardcore'
  | 'boss';

export interface Puzzle {
  story: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}

export interface GameState {
  stage: number;
  difficulty: Difficulty;
  score: number;
  lives: number;
  status: 'MENU' | 'PLAYING' | 'GAME_OVER' | 'RANKING';
}

export interface ScoreEntry {
  name: string;
  score: number;
  stage: number;
  date: string;
}
export interface PuzzleGenerationResponse {
  story: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}