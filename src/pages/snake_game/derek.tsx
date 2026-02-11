
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Point, Direction, GameStatus, GameState } from '../../../types';
import { GRID_SIZE, INITIAL_SPEED, MIN_SPEED, SPEED_INCREMENT, CANVAS_SIZE, COLORS } from './constants';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import FullscreenContainer from '../../../components/FullscreenContainer';
import { Play, Pause, Square } from 'lucide-react';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    food: { x: 5, y: 5 },
    direction: Direction.UP,
    score: 0,
    highScore: Number(localStorage.getItem('snakeHighScore')) || 0,
    status: GameStatus.IDLE,
    speed: INITIAL_SPEED,
    level: 1,
  });

  const directionRef = useRef<Direction>(Direction.UP);

  // Generate random food position not on snake
  const generateFood = useCallback((snake: Point[]): Point => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
      };
      const isOnSnake = snake.some(s => s.x === newFood!.x && s.y === newFood!.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    directionRef.current = Direction.UP;
    setState(prev => ({
      ...prev,
      snake: initialSnake,
      food: generateFood(initialSnake),
      direction: Direction.UP,
      score: 0,
      status: GameStatus.PLAYING,
      speed: INITIAL_SPEED,
      level: 1,
    }));
  };

  const togglePause = () => {
    setState(prev => ({
      ...prev,
      status: prev.status === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING
    }));
  };

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current !== Direction.DOWN) directionRef.current = Direction.UP;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current !== Direction.UP) directionRef.current = Direction.DOWN;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current !== Direction.RIGHT) directionRef.current = Direction.LEFT;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current !== Direction.LEFT) directionRef.current = Direction.RIGHT;
          break;
        case ' ':
          if (state.status === GameStatus.PLAYING || state.status === GameStatus.PAUSED) togglePause();
          else if (state.status === GameStatus.IDLE) resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status]);

  // Game Logic Loop
  useEffect(() => {
    if (state.status !== GameStatus.PLAYING) return;

    const moveSnake = () => {
      setState(prev => {
        const head = { ...prev.snake[0] };
        const currentDir = directionRef.current;

        switch (currentDir) {
          case Direction.UP: head.y -= 1; break;
          case Direction.DOWN: head.y += 1; break;
          case Direction.LEFT: head.x -= 1; break;
          case Direction.RIGHT: head.x += 1; break;
        }

        // Collision Check (Walls)
        const gridSizeCount = CANVAS_SIZE / GRID_SIZE;
        if (head.x < 0 || head.x >= gridSizeCount || head.y < 0 || head.y >= gridSizeCount) {
          if (prev.score > prev.highScore) {
            localStorage.setItem('snakeHighScore', String(prev.score));
          }
          return { ...prev, status: GameStatus.GAME_OVER, highScore: Math.max(prev.score, prev.highScore) };
        }

        // Collision Check (Self)
        if (prev.snake.some(s => s.x === head.x && s.y === head.y)) {
          if (prev.score > prev.highScore) {
            localStorage.setItem('snakeHighScore', String(prev.score));
          }
          return { ...prev, status: GameStatus.GAME_OVER, highScore: Math.max(prev.score, prev.highScore) };
        }

        const newSnake = [head, ...prev.snake];

        // Food Check
        if (head.x === prev.food.x && head.y === prev.food.y) {
          const newScore = prev.score + 10;
          const newLevel = Math.floor(newScore / 50) + 1;
          const newSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (newLevel * SPEED_INCREMENT * 2));
          return {
            ...prev,
            snake: newSnake,
            food: generateFood(newSnake),
            score: newScore,
            level: newLevel,
            speed: newSpeed
          };
        }

        newSnake.pop();
        return { ...prev, snake: newSnake, direction: currentDir };
      });
    };

    const intervalId = setInterval(moveSnake, state.speed);
    return () => clearInterval(intervalId);
  }, [state.status, state.speed, generateFood]);

  // Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid
    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw Food
    const { food, snake } = state;
    ctx.fillStyle = COLORS.FOOD;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.FOOD;
    ctx.beginPath();
    ctx.arc(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
      
      if (isHead) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.SNAKE_HEAD;
      }

      // Rounded rect for snake segments
      const x = segment.x * GRID_SIZE + 2;
      const y = segment.y * GRID_SIZE + 2;
      const size = GRID_SIZE - 4;
      const radius = 4;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + size - radius, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
      ctx.lineTo(x + size, y + size - radius);
      ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
      ctx.lineTo(x + radius, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
    });

  }, [state]);

  return (
    <FullscreenContainer className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-4">
      {/* Background Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full"></div>
      </div>

      <header className="mb-8 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-orbitron font-bold tracking-tighter bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          NEON SNAKE
        </h1>
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mt-2">Evolution Protocol 2.5</p>
      </header>

      <HUD score={state.score} highScore={state.highScore} level={state.level} />

      <div className="relative group">
        {/* Glow behind canvas */}
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative bg-black border border-white/10 rounded-lg overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="max-w-full h-auto cursor-none"
          />

          {state.status === GameStatus.IDLE && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-40">
              <button
                onClick={resetGame}
                className="group flex flex-col items-center gap-4 transition-transform hover:scale-105"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.5)]">
                  <Play className="w-10 h-10 text-black fill-current ml-1" />
                </div>
                <span className="text-white font-orbitron text-xl tracking-widest animate-pulse">INITIATE GAME</span>
              </button>
              <div className="mt-12 flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Move</p>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">W</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">A</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">S</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">D</kbd>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Pause</p>
                  <kbd className="px-4 py-1 bg-white/10 rounded border border-white/20 text-xs">SPACE</kbd>
                </div>
              </div>
            </div>
          )}

          {state.status === GameStatus.PAUSED && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-40">
              <div className="text-center">
                <h3 className="text-4xl font-orbitron text-white mb-6">PAUSED</h3>
                <button
                  onClick={togglePause}
                  className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
                >
                  RESUME
                </button>
              </div>
            </div>
          )}

          {state.status === GameStatus.GAME_OVER && (
            <GameOver score={state.score} onRestart={resetGame} />
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4 z-10">
        <button
          onClick={togglePause}
          disabled={state.status !== GameStatus.PLAYING && state.status !== GameStatus.PAUSED}
          className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors disabled:opacity-20"
        >
          {state.status === GameStatus.PAUSED ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
        </button>
        <button
          onClick={() => setState(s => ({ ...s, status: GameStatus.GAME_OVER }))}
          disabled={state.status !== GameStatus.PLAYING && state.status !== GameStatus.PAUSED}
          className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-red-500/20 transition-colors group disabled:opacity-20"
        >
          <Square className="w-6 h-6 group-hover:text-red-500" />
        </button>
      </div>

      <footer className="mt-12 text-gray-600 text-[10px] tracking-[0.2em] uppercase font-semibold">
        Design by AI Evolution Lab • v2.5.0
      </footer>
    </FullscreenContainer>
  );
};

export default App;
