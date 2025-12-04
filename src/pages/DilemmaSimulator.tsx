import React, { useState, useEffect } from 'react';

// Story data structure
const story = {
  start: {
    title: '엄마 편? 아빠 편?',
    description: '딜레마로 인한 결과를 참혹하게 보여줄 예정',
    isStart: true,
    choices: [
      { text: '엄마 편', nextScene: 'momRouteStart', color: 'red' },
      { text: '아빠 편', nextScene: 'dadRouteStart', color: 'blue' },
    ],
  },
  // --- Route A (Mom's Side) ---
  momRouteStart: {
    character: '아빠',
    dialogue: '그래? 너 엄마 편이야? 그럼 앞으로 게임은 없다.',
    choices: [
      { text: '말로 설득하기', nextScene: 'momRoute_persuade' },
      { text: '몰래 게임하기', nextScene: 'momRoute_sneak' },
    ],
  },
  momRoute_persuade: {
    character: '아빠',
    dialogue: '시끄럽다. 당분간 너는 공부 먼저다.',
    description: '아빠가 게임기 전원을 뽑고 숨겨버린다.',
    choices: [
      { text: '게임기 찾기', nextScene: 'momRoute_findGame' },
      { text: '순순히 따르기', nextScene: 'momRoute_obey' },
    ],
  },
   momRoute_sneak: {
      character: '나',
      dialogue: '아빠가 잠들 때까지 기다렸다가 몰래 게임을 했다. 하지만 다음 날 아침, 아빠에게 들키고 말았다.',
      description: '아빠가 화를 내며 휴대폰을 압수했다.',
      choices: [
          { text: '미안하다고 말하기', nextScene: 'momRoute_apologize' },
          { text: '반항하기', nextScene: 'momRoute_rebel' },
      ]
  },
  momRoute_findGame: {
    character: '나',
    dialogue: '아빠가 게임기를 어디에 숨겼을까?',
    description: '방, 거실, 차 안을 뒤져보았지만 찾을 수 없었다. 결국 아빠에게 게임기를 찾으려 한 것을 들키고 휴대폰도 압수당했다.',
    choices: [
      { text: '미안하다고 말하기', nextScene: 'momRoute_apologize' },
      { text: '반항하기', nextScene: 'momRoute_rebel' },
    ],
  },
  momRoute_obey: { 
      isEnding: true,
      endingTitle: '현명한 타협 엔딩',
      dialogue: '나는 아빠의 말을 따르기로 했다. 게임 없는 삶은 지루했지만, 더 큰 갈등은 피할 수 있었다.',
      description: '시간이 흘러 아빠의 화가 누그러졌고, 우리는 게임 시간을 정하는 것으로 타협했다.',
      choices: [ { text: '다시 시작하기', nextScene: 'start' } ],
  },
  momRoute_apologize: {
      isEnding: true,
      endingTitle: '게임 상실 엔딩',
      dialogue: '잘못했어요... 다시는 안 그럴게요.',
      description: '나의 사과에 아빠의 마음도 조금은 누그러졌다. 휴대폰은 돌려받았지만, 게임기는 영영 돌아오지 않았다.',
      choices: [ { text: '다시 시작하기', nextScene: 'start' } ],
  },
  momRoute_rebel: {
      isEnding: true,
      endingTitle: '완전한 통제 엔딩',
      dialogue: '아빠가 뭔데요! 이건 내 거란 말이에요!',
      description: '나의 반항에 아빠는 더욱 화를 냈고, 집안의 분위기는 최악으로 치달았다. 나는 방에 갇혀 외부와의 모든 소통이 차단되었다.',
      choices: [ { text: '다시 시작하기', nextScene: 'start' } ],
  },
  // --- Route B (Dad's Side) ---
  dadRouteStart: {
    character: '엄마',
    dialogue: '네가… 아빠 편을 든다고? 그래. 그럼 공부만 해.',
    choices: [
      { text: '사과하기', nextScene: 'dadRoute_apologize' },
      { text: '그냥 방으로 들어가기', nextScene: 'dadRoute_goRoom' },
    ],
  },
  dadRoute_apologize: {
      character: '나',
      dialogue: '엄마, 미안해요. 그런 뜻이 아니었는데...',
      description: '엄마는 내 사과를 받아주었지만, 서운한 감정은 쉽게 가시지 않는 듯 보였다. 엄마는 한숨을 쉬며 내 성적표를 꺼내 들었다.',
      choices: [
          { text: '대화를 이어나가기', nextScene: 'dadRoute_talk' },
          { text: '자리를 피하기', nextScene: 'dadRoute_goRoom' },
      ]
  },
  dadRoute_goRoom: {
    character: '엄마',
    dialogue: '어딜 도망가? 앉아봐. 수학 학원 하나 더 등록하자.',
    description: '엄마가 내 방 문을 열고 들어와 잔소리를 시작한다.',
    choices: [
      { text: '거절하기', nextScene: 'dadRoute_refuse' },
      { text: '억지로 동의하기', nextScene: 'dadRoute_agree' },
    ],
  },
  dadRoute_talk: {
      isEnding: true,
      endingTitle: '관계 회복 엔딩',
      dialogue: '엄마, 저도 노력하고 있어요. 조금만 믿고 기다려주세요.',
      description: '나의 진심 어린 말에 엄마는 잠시 생각에 잠겼다. 우리는 오랜 대화 끝에 서로의 입장을 이해하게 되었다.',
      choices: [ { text: '다시 시작하기', nextScene: 'start' } ],
  },
  dadRoute_refuse: {
      character: '나',
      dialogue: '싫어요. 지금도 충분히 힘들어요.',
      description: '나의 거절에 엄마는 크게 실망한 눈치였다. 그날 이후, 엄마의 잔소리는 전보다 훨씬 심해졌다.',
      choices: [
          { text: '알아서 할게라고 말하기', nextScene: 'dadRoute_byMyself' },
          { text: '폭발해서 소리치기', nextScene: 'dadRoute_explode' },
      ]
  },
  dadRoute_agree: {
    character: '나',
    dialogue: '네... 알겠어요.',
    description: '학원이 하나 더 늘었고, 친구들과 만날 시간은 완전히 사라졌다. 엄마의 기대치는 점점 더 높아져만 간다.',
    choices: [
      { text: '알아서 할게라고 말하기', nextScene: 'dadRoute_byMyself' },
      { text: '폭발해서 소리치기', nextScene: 'dadRoute_explode' },
    ],
  },
  dadRoute_byMyself: {
      isEnding: true,
      endingTitle: '공부 지옥 엔딩',
      dialogue: '엄마, 제발요. 제가 알아서 할게요!',
      description: '엄마는 내 말을 믿지 않았다. 결국 나는 엄마가 짜준 빡빡한 스케줄 속에서 숨 막히는 하루하루를 보내게 되었다.',
      choices: [ { text: '다시 시작하기', nextScene: 'start' } ],
  },
  dadRoute_explode: {
      isEnding: true,
      endingTitle: '관계 파탄 엔딩',
      dialogue: '이제 그만 좀 하세요! 숨 막혀 죽을 것 같단 말이에요!',
      description: '나의 폭발에 엄마는 충격을 받은 듯 보였다. 집안은 얼음장처럼 차가워졌고, 엄마와 나는 서로 말을 섞지 않게 되었다.',
      choices: [ { text: '다시 시작하기', nextScene: 'start' } ],
  },
};

const StartScreen = ({ scene, onChoice }) => (
    <>
      <main className="flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-2xl">
        {/* Main Illustration Area */}
        <div className="relative w-full aspect-[16/10] bg-black/30 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="redGlow" cx="15%" cy="50%" r="50%" fx="15%" fy="50%">
                <stop offset="0%" style={{ stopColor: 'rgba(220, 38, 38, 0.5)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(220, 38, 38, 0)', stopOpacity: 0 }} />
              </radialGradient>
              <radialGradient id="blueGlow" cx="85%" cy="50%" r="50%" fx="85%" fy="50%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.5)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0)', stopOpacity: 0 }} />
              </radialGradient>
            </defs>
            <rect width="400" height="250" fill="url(#redGlow)" />
            <rect width="400" height="250" fill="url(#blueGlow)" />
            {/* Silhouettes */}
            <g transform="translate(60 160) scale(0.6)"><path d="M52.3,92.5c-2.4-5.3-4.5-10.7-6-16.3c-3.4-12.7-5.9-25.7-6.2-39.1c-0.2-8.3,0.5-16.6,1.9-24.7 c1.6-9.1,4.1-17.9,8-26.1c5.2-11,12.3-20.7,21.6-28.3c8.9-7.2,19.3-12.3,30.7-14.9c-8.9,13.1-13.4,28.2-12.9,43.4 c0.5,15.7,5.9,30.8,15.4,43.2C89.7,94.2,75.4,98.5,62.3,105.9C58.1,100.3,54.8,96.1,52.3,92.5z" fill="black" /></g>
            <g transform="translate(250 160) scale(0.6) scale(-1, 1) translate(-140, 0)"><path d="M52.3,92.5c-2.4-5.3-4.5-10.7-6-16.3c-3.4-12.7-5.9-25.7-6.2-39.1c-0.2-8.3,0.5-16.6,1.9-24.7 c1.6-9.1,4.1-17.9,8-26.1c5.2-11,12.3-20.7,21.6-28.3c8.9-7.2,19.3-12.3,30.7-14.9c-8.9,13.1-13.4,28.2-12.9,43.4 c0.5,15.7,5.9,30.8,15.4,43.2C89.7,94.2,75.4,98.5,62.3,105.9C58.1,100.3,54.8,96.1,52.3,92.5z" fill="black" /></g>
            <g transform="translate(198, 180) scale(0.4)"><path d="M49.5,82.7c-1.3-3-2.5-5.9-3.4-9c-1.9-7-3.3-14.2-3.4-21.6c-0.1-4.6,0.3-9.2,1-13.6c0.9-5,2.3-9.9,4.4-14.4 c2.9-6,6.8-11.4,11.9-15.6c4.9-3.9,10.7-6.8,16.9-8.2c-4.9,7.2-7.4,15.5-7.1,23.9c0.3,8.7,3.2,17,8.5,23.8 c-8.3,0.9-16.2,3.3-23.4,7.4C56,70,52.3,76,49.5,82.7z" fill="black"/></g>
          </svg>
        </div>

        {/* Scenario Title */}
        <section className="text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg">{scene.title}</h2>
          <p className="text-red-500 font-bold mt-2 text-lg md:text-xl tracking-tight">{scene.description}</p>
        </section>
      </main>

      {/* Choice Buttons Area */}
      <footer className="w-full max-w-2xl pt-4 md:pt-8">
        <div className="flex flex-col md:flex-row justify-around items-center gap-6">
          {scene.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onChoice(choice.nextScene)}
              className={`w-full md:w-auto text-2xl md:text-3xl font-bold text-white rounded-lg px-12 py-4 md:px-16 md:py-5 transition-all duration-300 focus:outline-none 
              ${choice.color === 'red' 
                ? 'bg-red-900/70 border-2 border-red-600 hover:bg-red-800/90 hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] focus:ring-4 focus:ring-red-500/50'
                : 'bg-blue-900/70 border-2 border-blue-600 hover:bg-blue-800/90 hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] focus:ring-4 focus:ring-blue-500/50'
              }`}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </footer>
    </>
);

const GameScreen = ({ scene, onChoice }) => (
    <>
      <main className="flex flex-col items-center space-y-8 w-full max-w-2xl bg-black/30 rounded-xl border border-gray-700 p-8 shadow-2xl">
        {scene.isEnding && (
          <h2 className="text-4xl font-black text-yellow-400 drop-shadow-lg">{scene.endingTitle}</h2>
        )}
        {scene.character && (
            <p className="text-2xl font-bold text-gray-300">{scene.character}:</p>
        )}
        <p className="text-3xl text-center leading-relaxed">"{scene.dialogue}"</p>
        {scene.description && (
             <p className="text-lg text-gray-400 text-center italic mt-4">{scene.description}</p>
        )}
      </main>
       <footer className="w-full max-w-2xl pt-8">
            <div className="flex flex-col justify-around items-center gap-4">
                {scene.choices.map((choice, index) => (
                    <button
                        key={index}
                        onClick={() => onChoice(choice.nextScene)}
                        className="w-full md:w-3/4 text-xl font-bold text-white bg-gray-800/70 border-2 border-gray-600 rounded-lg px-12 py-4 transition-all duration-300 hover:bg-gray-700/90 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                    >
                        {choice.text}
                    </button>
                ))}
            </div>
        </footer>
    </>
);


const DilemmaSimulator: React.FC = () => {
  const [currentSceneId, setCurrentSceneId] = useState('start');
  const [isFading, setIsFading] = useState(false);
  const currentScene = story[currentSceneId];
  
  const handleChoice = (nextSceneId) => {
      setIsFading(true);
      setTimeout(() => {
          setCurrentSceneId(nextSceneId);
          setIsFading(false);
      }, 300); // Duration should match CSS transition
  };

  return (
    <div className="bg-gradient-to-b from-black to-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-4 space-y-6 md:space-y-8 font-['Noto_Sans_KR']">

      {/* Top Area */}
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-wider">DILEMMA SIMULATOR</h1>
        <p className="text-gray-400 mt-2 text-md md:text-lg">당신의 선택이 누군가의 마지막이 된다.</p>
      </header>

      <div key={currentSceneId} className={`w-full flex flex-col items-center space-y-6 md:space-y-8 transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        {currentScene.isStart ? (
            <StartScreen scene={currentScene} onChoice={handleChoice} />
        ) : (
            <GameScreen scene={currentScene} onChoice={handleChoice} />
        )}
      </div>

    </div>
  );
};

export default DilemmaSimulator;
