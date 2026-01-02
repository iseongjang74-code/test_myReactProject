
import { Character, Rarity, Attribute, Team, Achievement, PlayerFriend, PlayerState, UltimateSkill, UltimateRarity, UltimateEffectType, TargetType, RaidBoss, Equipment } from '../../../types';

export const ALL_ULTIMATE_SKILLS: UltimateSkill[] = [
    { id: 1, name: '기본 일격', description: '적 하나에게 기본 피해를 줍니다.', rarity: UltimateRarity.R, level: 1, effectType: UltimateEffectType.SINGLE_TARGET_DAMAGE, power: 1.5, targetType: TargetType.ENEMY_SINGLE },
    { id: 2, name: '치유의 빛', description: '자신을 약간 회복시킵니다.', rarity: UltimateRarity.R, level: 1, effectType: UltimateEffectType.HEAL_SELF, power: 500, targetType: TargetType.ALLY_SELF },
    { id: 3, name: '파이어볼', description: '적 하나에게 강력한 화염 피해를 줍니다.', rarity: UltimateRarity.SR, level: 1, effectType: UltimateEffectType.SINGLE_TARGET_DAMAGE, power: 2.5, targetType: TargetType.ENEMY_SINGLE },
    { id: 4, name: '대지 가르기', description: '모든 적에게 피해를 줍니다.', rarity: UltimateRarity.SR, level: 1, effectType: UltimateEffectType.AREA_OF_EFFECT_DAMAGE, power: 1.2, targetType: TargetType.ENEMY_ALL },
    { id: 5, name: '대천사의 축복', description: '모든 아군을 회복시킵니다.', rarity: UltimateRarity.SSR, level: 1, effectType: UltimateEffectType.HEAL_TEAM, power: 1000, targetType: TargetType.ALLY_ALL },
    { id: 6, name: '천벌', description: '적 하나에게 압도적인 신성 피해를 줍니다.', rarity: UltimateRarity.SSR, level: 1, effectType: UltimateEffectType.SINGLE_TARGET_DAMAGE, power: 5.0, targetType: TargetType.ENEMY_SINGLE },
    { id: 7, name: '아마겟돈', description: '모든 적에게 파괴적인 피해를 입힙니다.', rarity: UltimateRarity.Mythic, level: 1, effectType: UltimateEffectType.AREA_OF_EFFECT_DAMAGE, power: 3.5, targetType: TargetType.ENEMY_ALL },
];

export const ALL_EQUIPMENT: Equipment[] = [
    { id: 101, name: '훈련용 목검', rarity: Rarity.N, level: 1, cards: 0, baseStats: { attack: 10, hp: 0, speed: 0 }, specialEffect: '기본 공격력 증가', description: '초보자가 쓰기 좋은 목검.' },
    { id: 102, name: '낡은 가죽 갑옷', rarity: Rarity.N, level: 1, cards: 0, baseStats: { attack: 0, hp: 50, speed: 0 }, specialEffect: '기본 체력 증가', description: '최소한의 보호를 제공하는 갑옷.' },
    { id: 103, name: '강철 검', rarity: Rarity.R, level: 1, cards: 0, baseStats: { attack: 30, hp: 0, speed: 2 }, specialEffect: '공격력 소폭 증가', description: '잘 제련된 강철 검.' },
    { id: 104, name: '사냥꾼의 장화', rarity: Rarity.R, level: 1, cards: 0, baseStats: { attack: 5, hp: 20, speed: 10 }, specialEffect: '속도 소폭 증가', description: '가볍고 튼튼한 장화.' },
    { id: 105, name: '화염의 지팡이', rarity: Rarity.SR, level: 1, cards: 0, baseStats: { attack: 80, hp: 0, speed: 0 }, specialEffect: '화염 속성 공격력 강화', description: '불타오르는 마력이 깃든 지팡이.' },
    { id: 106, name: '미스릴 갑옷', rarity: Rarity.SR, level: 1, cards: 0, baseStats: { attack: 0, hp: 300, speed: -5 }, specialEffect: '체력 대폭 증가', description: '가볍지만 매우 단단한 미스릴로 만든 갑옷.' },
    { id: 107, name: '엑스칼리버', rarity: Rarity.SSR, level: 1, cards: 0, baseStats: { attack: 250, hp: 100, speed: 5 }, specialEffect: '성스러운 힘으로 적을 압도', description: '전설 속의 왕이 사용하던 검.' },
    { id: 108, name: '드래곤 하트 목걸이', rarity: Rarity.SSR, level: 1, cards: 0, baseStats: { attack: 50, hp: 800, speed: 0 }, specialEffect: '생명력 재생', description: '용의 심장 조각으로 만든 목걸이.' },
    { id: 109, name: '신 살해자의 창', rarity: Rarity.Mythic, level: 1, cards: 0, baseStats: { attack: 800, hp: 0, speed: 20 }, specialEffect: '신에게도 상처를 입히는 힘', description: '신화를 끝내는 창.' },
    { id: 110, name: '아이기스', rarity: Rarity.Mythic, level: 1, cards: 0, baseStats: { attack: 0, hp: 2500, speed: 0 }, specialEffect: '모든 상태이상 저항', description: '신의 가호가 깃든 절대 방패.' },
];

export const ALL_CHARACTERS: Character[] = [
  { id: 1, name: '블레이즈 나이트', rarity: Rarity.N, attribute: Attribute.Fire, imageUrl: 'https://picsum.photos/seed/1/200', level: 1, cards: 0, description: '작은 불꽃을 다루는 초보 기사.', equippedUltimateId: 1 },
  { id: 2, name: '아쿠아 스프라이트', rarity: Rarity.N, attribute: Attribute.Water, imageUrl: 'https://picsum.photos/seed/2/200', level: 1, cards: 0, description: '장난기 많은 물의 정령.', equippedUltimateId: 1 },
  { id: 3, name: '게일 아처', rarity: Rarity.R, attribute: Attribute.Wind, imageUrl: 'https://picsum.photos/seed/3/200', level: 1, cards: 0, description: '바람을 다루는 명사수.', equippedUltimateId: 1 },
  { id: 4, name: '태양의 사제', rarity: Rarity.R, attribute: Attribute.Light, imageUrl: 'https://picsum.photos/seed/4/200', level: 1, cards: 0, description: '성스러운 빛을 사용하는 사제.', equippedUltimateId: 2 },
  { id: 5, name: '그림자 시노비', rarity: Rarity.R, attribute: Attribute.Dark, imageUrl: 'https://picsum.photos/seed/5/200', level: 1, cards: 0, description: '그림자 속에 숨어드는 닌자.', equippedUltimateId: 1 },
  { id: 6, name: '인페르노 소서러', rarity: Rarity.SR, attribute: Attribute.Fire, imageUrl: 'https://picsum.photos/seed/6/200', level: 1, cards: 0, description: '폭발적인 화염을 다루는 강력한 마법사.', equippedUltimateId: 3 },
  { id: 7, name: '타이달 가디언', rarity: Rarity.SR, attribute: Attribute.Water, imageUrl: 'https://picsum.photos/seed/7/200', level: 1, cards: 0, description: '깊은 바다의 수호자.', equippedUltimateId: 4 },
  { id: 8, name: '스톰 드라군', rarity: Rarity.SR, attribute: Attribute.Wind, imageUrl: 'https://picsum.photos/seed/8/200', level: 1, cards: 0, description: '폭풍을 타고 나는 용기사.', equippedUltimateId: 1 },
  { id: 9, name: '천상의 발키리', rarity: Rarity.SSR, attribute: Attribute.Light, imageUrl: 'https://picsum.photos/seed/9/200', level: 1, cards: 0, description: '천상에서 내려온 신성한 전사.', equippedUltimateId: 5 },
  { id: 10, name: '심연의 군주', rarity: Rarity.SSR, attribute: Attribute.Dark, imageUrl: 'https://picsum.photos/seed/10/200', level: 1, cards: 0, description: '어두운 심연의 절대 지배자.', equippedUltimateId: 6 },
  { id: 11, name: '불사조', rarity: Rarity.SSR, attribute: Attribute.Fire, imageUrl: 'https://picsum.photos/seed/11/200', level: 1, cards: 0, description: '부활과 불의 불멸의 존재.', equippedUltimateId: 6 },
  { id: 12, name: '리바이어던 현자', rarity: Rarity.SSR, attribute: Attribute.Water, imageUrl: 'https://picsum.photos/seed/12/200', level: 1, cards: 0, description: '바다를 다스리는 고대의 현자.', equippedUltimateId: 5 },
  { id: 13, name: '템페스트 윙', rarity: Rarity.SSR, attribute: Attribute.Wind, imageUrl: 'https://picsum.photos/seed/13/200', level: 1, cards: 0, description: '태풍의 눈에서 태어난 날카로운 바람.', equippedUltimateId: 4 },
  { id: 14, name: '나이트메어 팬텀', rarity: Rarity.SSR, attribute: Attribute.Dark, imageUrl: 'https://picsum.photos/seed/14/200', level: 1, cards: 0, description: '악몽을 현실로 만드는 공포의 현신.', equippedUltimateId: 6 },
  { id: 15, name: '창세의 아크엔젤', rarity: Rarity.Mythic, attribute: Attribute.Light, imageUrl: 'https://picsum.photos/seed/15/200', level: 1, cards: 0, description: '세계를 창조한 빛의 대리인.', equippedUltimateId: 7 },
  { id: 16, name: '종말의 이프리트', rarity: Rarity.Mythic, attribute: Attribute.Fire, imageUrl: 'https://picsum.photos/seed/16/200', level: 1, cards: 0, description: '모든 것을 재로 돌리는 파괴의 화신.', equippedUltimateId: 7 },
  { id: 17, name: '세계수 위그드라실', rarity: Rarity.Mythic, attribute: Attribute.Water, imageUrl: 'https://picsum.photos/seed/17/200', level: 1, cards: 0, description: '생명의 근원, 세계를 품은 거대한 나무 정령.', equippedUltimateId: 5 },
];

export const GACHA_RATES = {
  [Rarity.N]: 0.5,
  [Rarity.R]: 0.34,
  [Rarity.SR]: 0.12,
  [Rarity.SSR]: 0.03,
  [Rarity.Mythic]: 0.01,
};

export const ULTIMATE_GACHA_RATES = {
  [UltimateRarity.R]: 0.6,
  [UltimateRarity.SR]: 0.3,
  [UltimateRarity.SSR]: 0.08,
  [UltimateRarity.Mythic]: 0.02,
};


const initialTeam: Team = {
  name: '기본 팀',
  characters: [ALL_CHARACTERS[0], ALL_CHARACTERS[1], null, null],
};

export const RAID_BOSS_TEMPLATE: RaidBoss = {
    name: '타락한 거신',
    imageUrl: 'https://picsum.photos/seed/raidboss/400',
    hp: 50000000,
    maxHp: 50000000,
    reward: 25000,
};

export const INITIAL_PLAYER_STATE: PlayerState = {
  currency: 1000,
  characters: [
    { ...ALL_CHARACTERS[0], cards: 0 }, 
    { ...ALL_CHARACTERS[1], cards: 0 }, 
    { ...ALL_CHARACTERS[2], cards: 0 }
  ],
  teams: [initialTeam],
  achievements: [
    { id: 1, name: '일일 로그인', description: '오늘 로그인하세요.', progress: 1, target: 1, reward: '보석 100개' },
    { id: 2, name: '주간 가챠', description: '이번 주에 가챠를 10번 뽑으세요.', progress: 3, target: 10, reward: '가챠 티켓 1장' },
    { id: 3, name: '불의 힘', description: '불 속성 캐릭터 2명으로 팀을 구성하세요.', progress: 1, target: 2, reward: '보석 50개', requiredCharacterAttribute: Attribute.Fire },
  ] as Achievement[],
  friends: [
    { id: 1, name: 'AcePlayer', team: { name: 'Vanguard', characters: [ALL_CHARACTERS[8], ALL_CHARACTERS[9], ALL_CHARACTERS[10], ALL_CHARACTERS[6]] }, lastActive: '5분 전', lastRarePull: ALL_CHARACTERS[11] },
    { id: 2, name: 'ShadowCat', team: { name: 'Abyss', characters: [ALL_CHARACTERS[4], ALL_CHARACTERS[7], ALL_CHARACTERS[9], ALL_CHARACTERS[5]] }, lastActive: '1시간 전' },
  ] as PlayerFriend[],
  ultimateSkills: [
      {...ALL_ULTIMATE_SKILLS[0]},
      {...ALL_ULTIMATE_SKILLS[1]},
  ],
  inventory: [
      {...ALL_EQUIPMENT[0], id: 1, cards: 0}, // Starter item 1
      {...ALL_EQUIPMENT[1], id: 2, cards: 0}, // Starter item 2
  ],
  guildId: null,
};
