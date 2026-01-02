
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { 
  GameState, Player, Enemy, Entity, 
  KeyConfig 
} from '../../../../types';
import { 
  TILE_SIZE, MAP_LAYOUT, MAP_WIDTH, MAP_HEIGHT,
  PLAYER_SIZE, ENEMY_SIZE, WALK_SPEED, RUN_SPEED, STEALTH_SPEED,
  ENEMY_SPEED_IDLE, ENEMY_SPEED_HUNT, ENEMY_SPEED_STALK,
  BATTERY_DECAY,
  NOISE_WALK, NOISE_RUN, NOISE_STEALTH, NOISE_DECAY, NOISE_THRESHOLD_DETECT,
  JUMP_SCARE_COOLDOWN, GHOST_STARE_THRESHOLD, GHOST_TELEPORT_MIN_DIST, GHOST_TELEPORT_MAX_DIST,
  BAT_COOLDOWN, BAT_RANGE, BAT_HIT_ARC, BATTERY_RECHARGE,
  FOV, NUM_RAYS, MAX_DEPTH
} from '../constants';
import { AudioEngine } from '../utils/AudioEngine';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onStatsUpdate: (stats: any) => void;
  keyBindings: KeyConfig;
}

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
}

const STORY_NOTES = [
    "NOTE 1: The camera is the only thing that works here. I don't know why, but seeing them through the lens keeps them at bay... for a while.",
    "NOTE 2: The batteries drain so fast. It's like the darkness eats the power. If the camera dies, I die.",
    "NOTE 3: I saw him in the viewfinder. He wasn't there when I looked with my own eyes. Trust the camera.",
    "NOTE 4: The Janitor took the master keys to the basement boiler room. He said the heat keeps them away. I hope he's right.",
    "NOTE 5: DO NOT LET THE CAMERA DIE. It's your only connection to the living world.",
    "NOTE 6: Find the keys. Leave this cursed place. Do not look back.",
    "NOTE 7: Static... so much static. It means he's getting closer."
];

// Image Assets
const TEXTURE_URLS = {
    bed: "https://m.media-amazon.com/images/I/71Wp3-gZlGL._AC_SL1500_.jpg",
    note: "https://i.stack.imgur.com/tL80j.jpg",
    ghost: "https://i.imgur.com/W2C2x2s.jpeg" 
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  onStatsUpdate,
  keyBindings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  
  // Game State Refs
  const playerRef = useRef<Player>({
    id: 'player', type: 'PLAYER', x: 100, y: 100, width: PLAYER_SIZE, height: PLAYER_SIZE, active: true,
    speed: WALK_SPEED, battery: 100, keys: 0, noise: 0, flashlightOn: true, hasFlashlight: true,
    direction: { x: 1, y: 0 }, isFlickering: false, isCrouching: false,
    yaw: -Math.PI / 2, // Face North/Up initially
    pitch: 0,
    lastJumpScareTime: 0,
    sanity: 0,
    isHidden: false,
    hasBat: false,
    attackTimer: 0,
    lastAttackTime: 0
  });
  
  const enemyRef = useRef<Enemy>({
    id: 'enemy', type: 'ENEMY', x: 600, y: 300, width: ENEMY_SIZE, height: ENEMY_SIZE, active: true,
    state: 'IDLE', speed: ENEMY_SPEED_IDLE, lastKnownPlayerPos: null,
    patrolPoints: [], currentPatrolIndex: 0, invisible: false,
    stareTimer: 0, footstepTimer: 0, teleportCooldown: 0
  });

  const entitiesRef = useRef<Entity[]>([]);
  const keysInput = useRef<{ [key: string]: boolean }>({});
  const stepTimer = useRef<number>(0); 
  const texturesRef = useRef<Record<string, HTMLImageElement>>({});
  
  // Visuals & Intro
  const rainRef = useRef<RainDrop[]>([]);
  const frameCountRef = useRef(0);
  const scriptedEventTriggered = useRef(false);
  const introTimer = useRef(0); // Frames since start
  const introPhase = useRef(0); // 0:Black, 1:Bell, 2:FadeIn, 3:Done
  const flickerTimer = useRef<number>(0); 
  const jumpScareState = useRef<{active: boolean, timer: number}>({active: false, timer: 0});
  
  // New: Death Animation State
  const deathSequence = useRef<{active: boolean, startTime: number}>({active: false, startTime: 0});

  // Z-Buffer for occlusion
  const zBuffer = useRef<number[]>(new Array(NUM_RAYS).fill(0));

  // Initialize Game
  const initGame = useCallback(() => {
    entitiesRef.current = [];
    scriptedEventTriggered.current = false;
    introTimer.current = 0;
    introPhase.current = 0;
    jumpScareState.current = { active: false, timer: 0 };
    deathSequence.current = { active: false, startTime: 0 };
    playerRef.current.battery = 100; 
    
    const audio = AudioEngine.getInstance();
    audio.startWind();
    audio.playCrow();
    
    // Load Textures
    Object.entries(TEXTURE_URLS).forEach(([key, url]) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Try to handle CORS if possible
        img.src = url;
        texturesRef.current[key] = img;
    });

    // Screen-space Rain
    rainRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * 1280,
      y: Math.random() * 720,
      length: 10 + Math.random() * 20,
      speed: 15 + Math.random() * 10
    }));

    // Parse Map
    let lockers: Entity[] = [];
    let noteCount = 0;

    for (let r = 0; r < MAP_LAYOUT.length; r++) {
      for (let c = 0; c < MAP_LAYOUT[0].length; c++) {
        const cell = MAP_LAYOUT[r][c];
        const cx = c * TILE_SIZE + TILE_SIZE / 2;
        const cy = r * TILE_SIZE + TILE_SIZE / 2;

        if (cell === 9) { // Spawn
          playerRef.current.x = cx;
          playerRef.current.y = cy;
          playerRef.current.keys = 0;
          playerRef.current.noise = 0;
          playerRef.current.hasFlashlight = true;
          playerRef.current.flashlightOn = true;
          playerRef.current.isFlickering = false;
          playerRef.current.yaw = -Math.PI / 2;
          playerRef.current.pitch = 0;
          playerRef.current.lastJumpScareTime = 0;
          playerRef.current.isHidden = false;
          playerRef.current.hasBat = false;
          playerRef.current.attackTimer = 0;
        } else if (cell === 2) { // Key
          entitiesRef.current.push({
            id: `key_${r}_${c}`, type: 'KEY', x: cx, y: cy, width: 20, height: 20, active: true
          });
        } else if (cell === 4) { // Car
           entitiesRef.current.push({
            id: `car_${r}_${c}`, type: 'CAR', x: cx, y: cy, width: 60, height: 40, active: true
          });
        } else if (cell === 5) { // Locker
           const locker: Entity = {
               id: `locker_${r}_${c}`, type: 'LOCKER', x: cx, y: cy, width: 30, height: 30, active: true,
               isOpen: false, content: 'EMPTY'
           };
           lockers.push(locker);
           entitiesRef.current.push(locker);
        } else if (cell === 10) { // Bed
           entitiesRef.current.push({
               id: `bed_${r}_${c}`, type: 'BED', x: cx, y: cy, width: 32, height: 38, active: true,
           });
        } else if (cell === 6) { // Note
           entitiesRef.current.push({
               id: `note_${r}_${c}`, type: 'NOTE', x: cx, y: cy, width: 25, height: 25, active: true,
               text: STORY_NOTES[noteCount % STORY_NOTES.length]
           });
           noteCount++;
        }
      }
    }

    // Spawn Bat near start (near car)
    entitiesRef.current.push({
        id: 'weapon_bat', type: 'BAT', x: 200, y: 100, width: 30, height: 8, active: true
    });

    // Assign loot
    if (lockers.length > 0) {
        const keyIdx1 = Math.floor(Math.random() * lockers.length);
        let keyIdx2 = Math.floor(Math.random() * lockers.length);
        while(keyIdx2 === keyIdx1) keyIdx2 = Math.floor(Math.random() * lockers.length);

        lockers[keyIdx1].content = 'KEY';
        lockers[keyIdx2].content = 'KEY';
        
        lockers.forEach((l, idx) => {
            if (idx !== keyIdx1 && idx !== keyIdx2 && Math.random() < 0.6) { // Increased battery spawn rate
                l.content = 'BATTERY';
            }
        });
    }

    // Reset Enemy
    enemyRef.current.x = MAP_WIDTH - 200;
    enemyRef.current.y = MAP_HEIGHT - 200;
    enemyRef.current.state = 'IDLE';
    enemyRef.current.active = false; 
    enemyRef.current.invisible = false;
    enemyRef.current.stareTimer = 0;

    keysInput.current = {};
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      initGame();
    } else {
        AudioEngine.getInstance().stopWind();
        if (document.pointerLockElement === canvasRef.current) {
            document.exitPointerLock();
        }
    }
  }, [gameState, initGame]);

  const triggerJumpScare = () => {
      const now = Date.now();
      if (now - playerRef.current.lastJumpScareTime > JUMP_SCARE_COOLDOWN) {
          jumpScareState.current = { active: true, timer: now };
          playerRef.current.lastJumpScareTime = now;
          playerRef.current.noise = 1.0; 
          AudioEngine.getInstance().playJumpScare();
          // Force player out of hiding if caught
          if (playerRef.current.isHidden) playerRef.current.isHidden = false;
      }
  };

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
        keysInput.current[e.code] = true;
        if (e.code === keyBindings.INTERACT) handleInteraction();
        // Camera cannot be turned off
        // if (e.code === keyBindings.FLASHLIGHT) toggleFlashlight();
        if ((e.code === 'Escape' || e.code === keyBindings.INTERACT) && activeNote) setActiveNote(null);
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
        // Removed the "clumsy noise" penalty to fix the sneaking error.
        keysInput.current[e.code] = false; 
    };
    
    // MOUSE LOOK
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvasRef.current && !jumpScareState.current.active && !deathSequence.current.active) {
          const sensitivity = 0.002;
          playerRef.current.yaw += e.movementX * sensitivity;
          // Pitch controls vertical look (shearing in 2.5D)
          playerRef.current.pitch -= e.movementY * 0.002;
          playerRef.current.pitch = Math.max(-0.5, Math.min(0.5, playerRef.current.pitch));
          
          playerRef.current.direction = {
              x: Math.cos(playerRef.current.yaw),
              y: Math.sin(playerRef.current.yaw)
          };
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
        if (gameState === 'PLAYING' && !deathSequence.current.active) {
            if (!activeNote && document.pointerLockElement !== canvasRef.current) {
                canvasRef.current?.requestPointerLock();
            } else if (playerRef.current.hasBat && !playerRef.current.isHidden && e.button === 0) {
                 performAttack();
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    const cvs = canvasRef.current;
    if (cvs) cvs.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      if (cvs) cvs.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gameState, activeNote, keyBindings]);

  const performAttack = () => {
      const p = playerRef.current;
      const now = Date.now();
      if (now - p.lastAttackTime < BAT_COOLDOWN) return;

      p.attackTimer = 200; // Animation frames (decremented in loop)
      p.lastAttackTime = now;
      AudioEngine.getInstance().playSwing();

      // Check hit immediately
      const e = enemyRef.current;
      if (e.active) {
          const dist = Math.hypot(e.x - p.x, e.y - p.y);
          if (dist < BAT_RANGE) {
              const angleToEnemy = Math.atan2(e.y - p.y, e.x - p.x);
              let diff = angleToEnemy - p.yaw;
              // Normalize angle
              while (diff > Math.PI) diff -= 2*Math.PI;
              while (diff < -Math.PI) diff += 2*Math.PI;
              
              if (Math.abs(diff) < BAT_HIT_ARC / 2) {
                  // Hit!
                  AudioEngine.getInstance().playHit();
                  onStatsUpdate((prev: any) => ({ ...prev, message: "BANISHED!" }));
                  // Teleport enemy away
                  e.state = 'IDLE';
                  e.x = -2000;
                  e.y = -2000;
                  e.teleportCooldown = 500;
                  e.invisible = true;
              }
          }
      }
  };

  const handleInteraction = () => {
      if (activeNote) {
          setActiveNote(null);
          return;
      }
      
      const p = playerRef.current;
      
      // If hidden, exit hiding
      if (p.isHidden) {
          p.isHidden = false;
          onStatsUpdate((prev: any) => ({ ...prev, message: "" }));
          return;
      }

      let nearest: Entity | null = null;
      let minDist = 70; 

      entitiesRef.current.forEach(ent => {
          if (!ent.active) return;
          const dist = Math.hypot(ent.x - p.x, ent.y - p.y);
          if (dist < minDist) {
              nearest = ent;
              minDist = dist;
          }
      });

      if (nearest) {
          const ent = nearest as Entity;
          // Car logic kept for flavor, but player starts with flashlight now
          if (ent.type === 'CAR' && !p.hasFlashlight) {
              p.hasFlashlight = true;
              p.flashlightOn = true;
              p.battery = 100; 
              AudioEngine.getInstance().playClick(true);
              AudioEngine.getInstance().playBuzz(0.5);
              AudioEngine.getInstance().playDrone();
              flickerTimer.current = Date.now();
              onStatsUpdate((prev: any) => ({ ...prev, message: "BATTERY RECHARGED" }));
          } else if (ent.type === 'BAT') {
              p.hasBat = true;
              ent.active = false;
              AudioEngine.getInstance().playItemDrop();
              onStatsUpdate((prev: any) => ({ ...prev, message: "BASEBALL BAT ACQUIRED" }));
          } else if (ent.type === 'NOTE') {
              setActiveNote(ent.text || "...");
              ent.active = false;
              AudioEngine.getInstance().playClick(true);
              onStatsUpdate((prev: any) => ({ ...prev, message: "STORY NOTE FOUND" }));
          } else if (ent.type === 'BED') {
              p.isHidden = true;
              p.hidingType = 'BED';
              AudioEngine.getInstance().playItemDrop(); // Cloth sound simulation
              onStatsUpdate((prev: any) => ({ ...prev, message: "HIDING UNDER BED..." }));
          } else if (ent.type === 'LOCKER') {
              // Locker Logic
              if (!ent.isOpen) {
                  // Open it
                  ent.isOpen = true;
                  p.noise = 1.0; 
                  AudioEngine.getInstance().playItemDrop();
                  if (Math.random() < 0.2) triggerJumpScare();

                  if (ent.content === 'BATTERY') {
                      p.battery = Math.min(100, p.battery + BATTERY_RECHARGE);
                      onStatsUpdate((prev: any) => ({ ...prev, message: "REPLACED BATTERY" }));
                      ent.content = 'EMPTY';
                  } else if (ent.content === 'KEY') {
                      p.keys++;
                      onStatsUpdate((prev: any) => ({ ...prev, message: "FOUND KEY" }));
                      ent.content = 'EMPTY';
                  } else {
                      onStatsUpdate((prev: any) => ({ ...prev, message: "EMPTY" }));
                  }
              } else {
                  // Already open - Hide inside
                  p.isHidden = true;
                  p.hidingType = 'LOCKER';
                  onStatsUpdate((prev: any) => ({ ...prev, message: "HIDING IN LOCKER..." }));
              }
          }
      }
  };

  // Improved collision that takes an Entity ID/Type to avoid checking non-physical triggers
  const checkCollision = (x: number, y: number, size: number, isEnemy: boolean = false): boolean => {
    const left = Math.floor((x - size / 2) / TILE_SIZE);
    const right = Math.floor((x + size / 2) / TILE_SIZE);
    const top = Math.floor((y - size / 2) / TILE_SIZE);
    const bottom = Math.floor((y + size / 2) / TILE_SIZE);

    if (left < 0 || right >= MAP_LAYOUT[0].length || top < 0 || bottom >= MAP_LAYOUT.length) return true;

    // Walls
    if (MAP_LAYOUT[top][left] === 1 || MAP_LAYOUT[top][left] === 7) return true;
    if (MAP_LAYOUT[top][right] === 1 || MAP_LAYOUT[top][right] === 7) return true;
    if (MAP_LAYOUT[bottom][left] === 1 || MAP_LAYOUT[bottom][left] === 7) return true;
    if (MAP_LAYOUT[bottom][right] === 1 || MAP_LAYOUT[bottom][right] === 7) return true;

    const solidTypes = ['CAR', 'LOCKER', 'BED'];
    for (const ent of entitiesRef.current) {
        if (!ent.active) continue;
        if (solidTypes.includes(ent.type)) {
            const dist = Math.hypot(x - ent.x, y - ent.y);
            // Simple circular collision check against solid objects
            if (dist < (size/2 + ent.width/2)) return true;
        }
    }

    if (!isEnemy) {
        const isExit = (
        MAP_LAYOUT[top][left] === 3 || MAP_LAYOUT[top][right] === 3 ||
        MAP_LAYOUT[bottom][left] === 3 || MAP_LAYOUT[bottom][right] === 3
        );

        if (isExit) {
            if (playerRef.current.keys >= 12) {
                setGameState('VICTORY');
                return false;
            } else {
                onStatsUpdate((prev: any) => ({ ...prev, message: "NEED 12 KEYS" }));
                return true; 
            }
        }
    }
    return false;
  };

  const handleHorrorEvents = () => {
      const p = playerRef.current;
      
      // 1. Camera Battery Mechanics
      // Always drains when playing
      p.battery = Math.max(0, p.battery - BATTERY_DECAY);
      
      if (p.battery <= 0) {
          // Death by lost connection
          setGameState('GAME_OVER');
          return;
      }
      
      if (p.battery < 20 && Math.random() < 0.05) {
          p.isFlickering = true;
          AudioEngine.getInstance().playBuzz(0.1);
      } else if (Date.now() - flickerTimer.current < 200) {
           p.isFlickering = Math.random() < 0.5;
      } else {
           p.isFlickering = false;
      }

      // 3. Shadow Spawns
      if (Math.random() < 0.001 && p.noise > 0.1 && !p.isHidden) {
          const spawnDist = 60;
          const shadowX = p.x - (Math.cos(p.yaw) * spawnDist);
          const shadowY = p.y - (Math.sin(p.yaw) * spawnDist);
          
          entitiesRef.current.push({
              id: `ghost_${Date.now()}`, type: 'SHADOW',
              x: shadowX, y: shadowY, width: 30, height: 60, active: true
          });
          
          setTimeout(() => {
              const idx = entitiesRef.current.findIndex(e => e.type === 'SHADOW' && e.id.startsWith('ghost'));
              if (idx !== -1) entitiesRef.current.splice(idx, 1);
          }, 200); 
      }
  };

  const updatePlayer = () => {
    const player = playerRef.current;

    // Tick Attack Timer
    if (player.attackTimer > 0) {
        player.attackTimer -= 1000/60; // Approximate ms per frame
    }

    if (introPhase.current < 2 || jumpScareState.current.active) return;
    
    // If Hidden, don't move
    if (player.isHidden) {
        player.noise = 0;
        return;
    }

    const yaw = player.yaw;
    const dxF = Math.cos(yaw); 
    const dyF = Math.sin(yaw); 
    const dxR = Math.cos(yaw + Math.PI/2); 
    const dyR = Math.sin(yaw + Math.PI/2); 

    let moveX = 0;
    let moveY = 0;
    
    const isRunning = keysInput.current[keyBindings.RUN];
    const isSneaking = keysInput.current[keyBindings.SNEAK]; 
    
    player.isCrouching = !!isSneaking;

    let currentSpeed = WALK_SPEED;
    if (isRunning) currentSpeed = RUN_SPEED;
    if (isSneaking) currentSpeed = STEALTH_SPEED;

    if (keysInput.current[keyBindings.MOVE_FORWARD] || keysInput.current['ArrowUp']) {
        moveX += dxF * currentSpeed;
        moveY += dyF * currentSpeed;
    }
    if (keysInput.current[keyBindings.MOVE_BACKWARD] || keysInput.current['ArrowDown']) {
        moveX -= dxF * currentSpeed;
        moveY -= dyF * currentSpeed;
    }
    if (keysInput.current[keyBindings.MOVE_LEFT] || keysInput.current['ArrowLeft']) {
        moveX -= dxR * currentSpeed; 
        moveY -= dyR * currentSpeed;
    }
    if (keysInput.current[keyBindings.MOVE_RIGHT] || keysInput.current['ArrowRight']) {
        moveX += dxR * currentSpeed;
        moveY += dyR * currentSpeed;
    }

    if (!checkCollision(player.x + moveX, player.y, player.width)) player.x += moveX;
    if (!checkCollision(player.x, player.y + moveY, player.width)) player.y += moveY;

    // Noise and Audio
    const isMoving = Math.abs(moveX) + Math.abs(moveY) > 0.1;
    let noiseLevel = 0;
    if (isMoving) {
        if (isRunning) noiseLevel = NOISE_RUN;
        else if (isSneaking) noiseLevel = NOISE_STEALTH;
        else noiseLevel = NOISE_WALK;
    }

    player.noise = Math.max(0, player.noise - NOISE_DECAY);
    player.noise = Math.max(player.noise, noiseLevel);
    
    if (isMoving) {
        if (isSneaking) {
             AudioEngine.getInstance().playBreathing();
        }
        const stepInterval = isRunning ? 300 : (isSneaking ? 700 : 500);
        if (Date.now() - stepTimer.current > stepInterval) {
            let surface: 'DIRT' | 'WOOD' | 'WATER' = player.y > 360 ? 'WOOD' : 'DIRT'; 
            if (surface === 'DIRT' && Math.random() < 0.3) surface = 'WATER'; 

            const volume = isSneaking ? 0.2 : 1.0;
            AudioEngine.getInstance().playFootstep(surface, volume);
            stepTimer.current = Date.now();
        }
    }

    // Event Triggers
    if (!scriptedEventTriggered.current && player.y > 340 && player.y < 450) {
        scriptedEventTriggered.current = true;
        entitiesRef.current.push({
            id: 'shadow_event', type: 'SHADOW',
            x: 350, y: 380, width: 30, height: 60, active: true
        });
        enemyRef.current.active = true;
        enemyRef.current.x = 800; 
        enemyRef.current.y = 800;
        enemyRef.current.state = 'IDLE';
    }
    
    entitiesRef.current.forEach(ent => {
        if (!ent.active) return;
        if (ent.type === 'KEY') {
             const dist = Math.hypot(ent.x - player.x, ent.y - player.y);
             if (dist < PLAYER_SIZE + ent.width) {
                 ent.active = false;
                 player.keys++;
                 AudioEngine.getInstance().playItemDrop();
                 onStatsUpdate((prev: any) => ({ ...prev, message: "KEY FOUND" }));
             }
        }
    });
  };

  const updateEnemy = () => {
    const enemy = enemyRef.current;
    if (!enemy.active || jumpScareState.current.active || deathSequence.current.active) return;
    
    // If player hidden, enemy acts like player doesn't exist (unless scripted)
    if (playerRef.current.isHidden) {
        enemy.state = 'IDLE';
        return;
    }

    const player = playerRef.current;
    const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    const audio = AudioEngine.getInstance();
    enemy.footstepTimer++;

    // --- VISIBILITY / STARE MECHANIC ---
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    // In 3D, check if enemy is within FOV
    const angleToEnemy = Math.atan2(dy, dx);
    let diff = angleToEnemy - player.yaw;
    while (diff > Math.PI) diff -= 2*Math.PI;
    while (diff < -Math.PI) diff += 2*Math.PI;
    
    // Check if enemy is in front and reachable by flashlight ray
    const isInFOV = Math.abs(diff) < FOV / 1.5; 
    const isLit = player.flashlightOn && isInFOV && distToPlayer < 400; // Increased range for 3D feel

    if (isLit) {
        enemy.stareTimer++;
        if (enemy.stareTimer > GHOST_STARE_THRESHOLD && enemy.state === 'STALKING') {
             // Banish
             enemy.state = 'IDLE';
             enemy.x = -1000;
             enemy.y = -1000;
             enemy.invisible = true;
             enemy.stareTimer = 0;
             onStatsUpdate((prev: any) => ({ ...prev, message: "IT FLED" }));
             return;
        }
    } else {
        enemy.stareTimer = Math.max(0, enemy.stareTimer - 1);
    }

    // --- STATE MACHINE ---
    let targetX = enemy.x;
    let targetY = enemy.y;
    let moveSpeed = 0;

    if (enemy.state === 'IDLE') {
        if (Math.random() < 0.01) enemy.state = 'STALKING';
        if (player.noise > NOISE_THRESHOLD_DETECT && distToPlayer < 600) {
            enemy.state = 'HUNTING';
            enemy.invisible = false;
        }
    } 
    else if (enemy.state === 'STALKING') {
        enemy.invisible = true; 
        enemy.teleportCooldown--;

        if (enemy.teleportCooldown <= 0 && !isInFOV && distToPlayer > GHOST_TELEPORT_MAX_DIST) {
             const angle = player.yaw + Math.PI + (Math.random() - 0.5); 
             const dist = GHOST_TELEPORT_MIN_DIST + Math.random() * 100;
             enemy.x = player.x + Math.cos(angle) * dist;
             enemy.y = player.y + Math.sin(angle) * dist;
             enemy.teleportCooldown = 200;
             audio.playDrone();
        }

        moveSpeed = ENEMY_SPEED_STALK;
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        targetX = enemy.x + Math.cos(angle) * moveSpeed;
        targetY = enemy.y + Math.sin(angle) * moveSpeed;

        if (distToPlayer < 200) {
            if (enemy.footstepTimer > 60) {
                audio.playGhostFootstep('SOFT');
                enemy.footstepTimer = 0;
            }
            if (Math.random() < 0.02) {
                enemy.state = 'HUNTING';
                enemy.invisible = false;
            }
        } else if (distToPlayer < 400) {
            if (enemy.footstepTimer > 100) {
                audio.playGhostFootstep('SOFT');
                enemy.footstepTimer = 0;
            }
        }
    } 
    else if (enemy.state === 'HUNTING') {
        enemy.invisible = false;
        
        moveSpeed = ENEMY_SPEED_HUNT;
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        targetX = enemy.x + Math.cos(angle) * moveSpeed;
        targetY = enemy.y + Math.sin(angle) * moveSpeed;

        if (enemy.footstepTimer > 25) {
            audio.playGhostFootstep('HEAVY');
            enemy.footstepTimer = 0;
        }

        if (distToPlayer > 700) {
            enemy.state = 'IDLE'; 
        }
    }

    // Apply Movement with Wall Sliding Logic
    if (moveSpeed > 0) {
        if (!checkCollision(targetX, enemy.y, enemy.width, true)) {
            enemy.x = targetX;
        } else {
            const slideY = enemy.y + (player.y > enemy.y ? moveSpeed : -moveSpeed);
             if (!checkCollision(enemy.x, slideY, enemy.width, true)) {
                enemy.y = slideY;
            }
        }
        
        if (!checkCollision(enemy.x, targetY, enemy.width, true)) {
            enemy.y = targetY;
        } else {
            const slideX = enemy.x + (player.x > enemy.x ? moveSpeed : -moveSpeed);
            if (!checkCollision(slideX, enemy.y, enemy.width, true)) {
                enemy.x = slideX;
            }
        }
    }

    if (!enemy.invisible && distToPlayer < 25) {
        if (!deathSequence.current.active) {
            deathSequence.current = { active: true, startTime: Date.now() };
            AudioEngine.getInstance().playJumpScare();
        }
    }
  };

  const updateScriptedEvents = () => {
      introTimer.current++;
      if (introPhase.current === 0 && introTimer.current > 120) {
          introPhase.current = 1;
          AudioEngine.getInstance().playBell();
      }
      if (introPhase.current === 1 && introTimer.current > 180) {
          introPhase.current = 2; 
          AudioEngine.getInstance().playCarCooling();
          AudioEngine.getInstance().playFlashlightRoll();
      }
      if (introPhase.current === 3 && frameCountRef.current % 300 === 0) {
          if (Math.random() < 0.3) AudioEngine.getInstance().playCarCooling(); 
      }
      const shadowIndex = entitiesRef.current.findIndex(e => e.type === 'SHADOW' && e.id === 'shadow_event');
      if (shadowIndex !== -1) {
          const shadow = entitiesRef.current[shadowIndex];
          shadow.x += 12; 
          if (shadow.x > 800) {
              shadow.active = false;
              entitiesRef.current.splice(shadowIndex, 1);
          }
      }
      if (jumpScareState.current.active) {
          if (Date.now() - jumpScareState.current.timer > 500) {
              jumpScareState.current.active = false;
          }
      }
  };
  
  const updateRain = () => {
      rainRef.current.forEach(drop => {
          drop.y += drop.speed;
          if (drop.y > 720) {
                 drop.y = -20;
                 drop.x = Math.random() * 1280;
          }
      });
  };

  // --- 3D RENDERING ---

  // Helper to check image validity
  const isDrawable = (img: HTMLImageElement | undefined): boolean => {
    return !!(img && img.complete && img.naturalWidth > 0);
  };
  
  // Helper to draw the procedural scary face if image is missing
  const drawProceduralFace = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isFullScreen: boolean) => {
      ctx.save();
      // Jitter effect if full screen
      if (isFullScreen) {
          const jitterX = (Math.random() - 0.5) * 20;
          const jitterY = (Math.random() - 0.5) * 20;
          ctx.translate(jitterX, jitterY);
      }
      
      // Face shape
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(x + w/2, y + h/2, w/2, h/1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Eyes
      const eyeSize = w/5;
      const eyeOffset = w/4;
      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = isFullScreen ? 50 : 10;
      ctx.shadowColor = 'red';
      
      // Left Eye
      ctx.beginPath();
      ctx.ellipse(x + w/2 - eyeOffset, y + h/3, eyeSize, eyeSize*0.7, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Right Eye
      ctx.beginPath();
      ctx.ellipse(x + w/2 + eyeOffset, y + h/3, eyeSize, eyeSize*0.7, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.fillStyle = '#300';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(x + w/2 - eyeSize, y + h*0.65);
      ctx.quadraticCurveTo(x + w/2, y + h*0.85, x + w/2 + eyeSize, y + h*0.65);
      ctx.quadraticCurveTo(x + w/2, y + h*0.55, x + w/2 - eyeSize, y + h*0.65);
      ctx.fill();

      ctx.restore();
  };

  const drawRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
  };

  const castRays = (ctx: CanvasRenderingContext2D, p: Player, width: number, height: number) => {
      // 1. Draw Floor & Ceiling
      // Ceiling (Dark)
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height/2 + p.pitch * height);
      // Floor (Gradient attempt)
      const grad = ctx.createLinearGradient(0, height/2 + p.pitch * height, 0, height);
      grad.addColorStop(0, '#0a0a0a');
      grad.addColorStop(1, '#2a2a2a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, height/2 + p.pitch * height, width, height/2 - p.pitch * height);

      // 2. Raycasting Wall Loop
      for(let x = 0; x < NUM_RAYS; x++) {
          const cameraX = 2 * x / NUM_RAYS - 1; 
          const rayDirX = Math.cos(p.yaw) + Math.cos(p.yaw + Math.PI/2) * Math.tan(FOV/2) * cameraX;
          const rayDirY = Math.sin(p.yaw) + Math.sin(p.yaw + Math.PI/2) * Math.tan(FOV/2) * cameraX;

          let mapX = Math.floor(p.x / TILE_SIZE);
          let mapY = Math.floor(p.y / TILE_SIZE);

          let sideDistX, sideDistY;
          const deltaDistX = Math.abs(1 / rayDirX);
          const deltaDistY = Math.abs(1 / rayDirY);
          let perpWallDist;
          let stepX, stepY;
          let hit = 0;
          let side = 0; // 0 for NS, 1 for EW

          if (rayDirX < 0) {
              stepX = -1;
              sideDistX = (p.x/TILE_SIZE - mapX) * deltaDistX;
          } else {
              stepX = 1;
              sideDistX = (mapX + 1.0 - p.x/TILE_SIZE) * deltaDistX;
          }
          if (rayDirY < 0) {
              stepY = -1;
              sideDistY = (p.y/TILE_SIZE - mapY) * deltaDistY;
          } else {
              stepY = 1;
              sideDistY = (mapY + 1.0 - p.y/TILE_SIZE) * deltaDistY;
          }

          // DDA Algorithm
          let hitType = 0;
          while (hit === 0) {
              if (sideDistX < sideDistY) {
                  sideDistX += deltaDistX;
                  mapX += stepX;
                  side = 0;
              } else {
                  sideDistY += deltaDistY;
                  mapY += stepY;
                  side = 1;
              }
              if (mapY >= 0 && mapY < MAP_LAYOUT.length && mapX >= 0 && mapX < MAP_LAYOUT[0].length) {
                  if (MAP_LAYOUT[mapY][mapX] === 1 || MAP_LAYOUT[mapY][mapX] === 7) {
                      hit = 1;
                      hitType = MAP_LAYOUT[mapY][mapX];
                  }
              } else {
                  hit = 1; // map boundary
              }
          }

          if (side === 0) perpWallDist = (mapX - p.x/TILE_SIZE + (1 - stepX)/2) / rayDirX;
          else perpWallDist = (mapY - p.y/TILE_SIZE + (1 - stepY)/2) / rayDirY;

          // Store for Sprite Occlusion
          zBuffer.current[x] = perpWallDist;

          // Calculate Height
          const WALL_HEIGHT_SCALE = 2.0; 
          const lineHeight = Math.floor((height * WALL_HEIGHT_SCALE) / perpWallDist);
          
          // Apply pitch (look up/down)
          const horizon = height / 2 + p.pitch * height;
          const drawStart = -lineHeight / 2 + horizon;
          const drawEnd = lineHeight / 2 + horizon;

          // Wall Color (Concrete Gray)
          let baseColor = 150; // Light Gray
          if (hitType === 7) baseColor = 100; // Obstacle is darker
          if (side === 1) baseColor *= 0.75; // Shading for side

          // Fog / Darkness Fade
          const brightness = Math.min(1.0, 4.0 / perpWallDist); 
          const r = Math.floor(baseColor * brightness);
          const g = Math.floor(baseColor * brightness);
          const b = Math.floor(baseColor * brightness);

          // Draw Wall Strip
          const stripWidth = Math.ceil(width / NUM_RAYS);
          const renderX = x * stripWidth;
          
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(renderX, drawStart, stripWidth, drawEnd - drawStart + 1);
      }
  };

  const renderSprites = (ctx: CanvasRenderingContext2D, p: Player, width: number, height: number) => {
      // Sort entities by distance (far to close)
      const visibleEntities = entitiesRef.current
        .filter(e => e.active)
        .map(e => {
            return { ...e, dist: Math.hypot(p.x - e.x, p.y - e.y) };
        })
        .sort((a, b) => b.dist - a.dist);
      
      // Add Enemy to list
      const e = enemyRef.current;
      if (e.active && (!e.invisible || (e.invisible && e.state === 'STALKING' && Math.random() < 0.2))) {
          visibleEntities.push({
              ...e, 
              dist: Math.hypot(p.x - e.x, p.y - e.y)
          } as any);
          visibleEntities.sort((a, b) => b.dist - a.dist);
      }

      visibleEntities.forEach(sprite => {
          // Transform sprite with the inverse camera matrix
          const spriteX = sprite.x - p.x;
          const spriteY = sprite.y - p.y;

          // Camera Plane (FOV logic inverted)
          const planeX = Math.cos(p.yaw + Math.PI/2) * Math.tan(FOV/2);
          const planeY = Math.sin(p.yaw + Math.PI/2) * Math.tan(FOV/2);
          const dirX = Math.cos(p.yaw);
          const dirY = Math.sin(p.yaw);

          const invDet = 1.0 / (planeX * dirY - dirX * planeY);
          const transformX = invDet * (dirY * spriteX - dirX * spriteY);
          const transformY = invDet * (-planeY * spriteX + planeX * spriteY); // Depth inside screen

          if (transformY <= 0) return; // Behind camera

          const spriteScreenX = Math.floor((width / 2) * (1 + transformX / transformY));
          
          // Calculate height of the sprite on screen
          let spriteHeight = Math.abs(Math.floor(height / (transformY / TILE_SIZE))); 
          const spriteWidth = Math.abs(Math.floor(height / (transformY / TILE_SIZE)));
          
          // Adjust aspect ratios per type (e.g., taller ghosts)
          if (sprite.type === 'ENEMY') {
              spriteHeight *= 1.6;
          }

          // Center Y (account for pitch)
          const horizon = height / 2 + p.pitch * height;
          const spriteTopY = -spriteHeight / 2 + horizon;
          
          // Render logic based on Type
          const stripWidth = Math.ceil(width / NUM_RAYS);
          
          // Simple Billboard Drawing Loop
          const drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
          const drawEndX = drawStartX + spriteWidth;
          
          // Check occlusion for center of sprite (approx optimization)
          const screenIndex = Math.floor(spriteScreenX / stripWidth);
          
          if (screenIndex >= 0 && screenIndex < NUM_RAYS) {
             const wallDist = zBuffer.current[screenIndex];
             // TILE_SIZE unit conversion for depth check
             if (transformY / TILE_SIZE < wallDist) {
                 // Visible! Draw the sprite shape
                 const brightness = Math.min(1.0, 5.0 / (transformY / TILE_SIZE));
                 
                 ctx.save();
                 ctx.globalAlpha = brightness;
                 
                 if (sprite.type === 'ENEMY') {
                     const img = texturesRef.current['ghost'];
                     // 🔴 Image Rendering with Fallback
                     if (isDrawable(img)) {
                         ctx.globalAlpha = (e.invisible) ? 0.1 : brightness;
                         ctx.drawImage(img, drawStartX, spriteTopY, spriteWidth, spriteHeight);
                     } else {
                         // Fallback to procedural face
                         ctx.fillStyle = e.invisible ? 'rgba(0,0,0,0.1)' : `rgba(0,0,0,${brightness})`;
                         drawProceduralFace(ctx, drawStartX, spriteTopY, spriteWidth, spriteHeight, false);
                     }
                 } else if (sprite.type === 'KEY') {
                     ctx.fillStyle = `rgb(${255*brightness},${215*brightness},0)`;
                     ctx.beginPath();
                     ctx.arc(spriteScreenX, spriteTopY + spriteHeight/2, spriteWidth/3, 0, Math.PI*2);
                     ctx.fill();
                 } else if (sprite.type === 'BAT') {
                     ctx.fillStyle = `rgb(${150*brightness},${150*brightness},${150*brightness})`;
                     ctx.fillRect(drawStartX, spriteTopY, spriteWidth, spriteHeight);
                     ctx.fillStyle = `rgb(${100*brightness},${50*brightness},0)`;
                     ctx.fillRect(drawStartX, spriteTopY + spriteHeight*0.7, spriteWidth, spriteHeight*0.3);
                 } else if (sprite.type === 'LOCKER') {
                     const l = sprite as any;
                     ctx.fillStyle = l.isOpen ? '#444' : '#666';
                     ctx.fillRect(drawStartX, spriteTopY - spriteHeight/2, spriteWidth, spriteHeight*1.5); // Taller
                 } else if (sprite.type === 'BED') {
                     const img = texturesRef.current['bed'];
                     if (isDrawable(img)) {
                        ctx.drawImage(img, drawStartX, spriteTopY + spriteHeight/2, spriteWidth, spriteHeight/2);
                     } else {
                        ctx.fillStyle = '#ccc';
                        ctx.fillRect(drawStartX, spriteTopY + spriteHeight/2, spriteWidth, spriteHeight/2);
                     }
                 } else if (sprite.type === 'CAR') {
                     ctx.fillStyle = '#557';
                     ctx.fillRect(drawStartX - spriteWidth, spriteTopY, spriteWidth*3, spriteHeight/2);
                 } else if (sprite.type === 'NOTE') {
                     const img = texturesRef.current['note'];
                     if (isDrawable(img)) {
                        ctx.drawImage(img, drawStartX, spriteTopY + spriteHeight*0.8, spriteWidth/2, spriteHeight/4);
                     } else {
                        ctx.fillStyle = '#fff';
                        ctx.fillRect(drawStartX, spriteTopY + spriteHeight*0.8, spriteWidth/2, spriteHeight/4);
                     }
                 }

                 ctx.restore();
             }
          }
      });
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const p = playerRef.current;
    
    // Death Sequence Override
    if (deathSequence.current.active) {
        // Clear background to black
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0, width, height);
        
        // Jitter effect for the face
        const jitterX = (Math.random() - 0.5) * 50;
        const jitterY = (Math.random() - 0.5) * 50;
        // Scale pulse
        const pulse = 1.0 + Math.sin(Date.now() / 50) * 0.05;
        
        ctx.save();
        ctx.translate(width/2 + jitterX, height/2 + jitterY);
        ctx.scale(pulse, pulse);

        const img = texturesRef.current['ghost'];
        // 🔴 Fullscreen Death Face with Fallback and Cover Logic
        if (isDrawable(img)) {
            const imgRatio = img.width / img.height;
            const canvasRatio = width / height;
            
            let renderW, renderH;
            
            // Cover logic: if canvas is wider than image (relative to ratios), scale by width
            if (canvasRatio > imgRatio) {
                renderW = width;
                renderH = width / imgRatio;
            } else {
                renderH = height;
                renderW = height * imgRatio;
            }

            ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        } else {
            drawProceduralFace(ctx, -width/2, -height/2, width, height, true);
        }

        ctx.restore();
        
        // Red flash overlay
        if (Math.random() > 0.7) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.fillRect(0, 0, width, height);
        }
        return;
    }

    // 1. Raycast World
    castRays(ctx, p, width, height);
    
    // 2. Render Sprites
    renderSprites(ctx, p, width, height);

    // 3. Flashlight / Vignette Overlay
    const batteryStrength = Math.max(0.2, p.battery / 100);
    const flicker = (p.battery < 20 || p.isFlickering) ? (Math.random() * 0.2) : 0;
    
    const grad = ctx.createRadialGradient(width/2, height/2, height/4 * batteryStrength, width/2, height/2, height * (0.8 + flicker));
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0.95)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 4. Weapon (Bat) - First Person View
    if (p.hasBat && !p.isHidden) {
        ctx.save();
        const swingOffset = p.attackTimer > 0 ? Math.sin(p.attackTimer/200 * Math.PI) * 200 : 0;
        const swingRot = p.attackTimer > 0 ? -Math.PI/4 : 0;

        ctx.translate(width * 0.7 + swingOffset, height);
        ctx.rotate(-Math.PI/6 + swingRot);
        
        ctx.fillStyle = '#5d4037'; // Handle
        ctx.fillRect(-20, -200, 40, 200);
        ctx.fillStyle = '#9ca3af'; // Bat
        ctx.fillRect(-25, -500, 50, 300);
        ctx.restore();
    }

    // 4.5. Minimap (Top Left)
    const mmSize = 150;
    const mmScale = 0.15; // Zoom level
    const mmMargin = 30; // Slightly more margin from left
    const mmTop = 150;   // Below the timecode UI

    ctx.save();
    ctx.translate(mmMargin, mmTop);

    // Border and Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, mmSize, mmSize);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, mmSize, mmSize);

    // Clip to box
    ctx.beginPath();
    ctx.rect(0, 0, mmSize, mmSize);
    ctx.clip();

    const mmCenterX = mmSize / 2;
    const mmCenterY = mmSize / 2;
    
    // Calculate visible range in world units
    const range = (mmSize / 2) / mmScale; 
    
    // Bounds for iteration
    const startRow = Math.max(0, Math.floor((p.y - range) / TILE_SIZE));
    const endRow = Math.min(MAP_LAYOUT.length, Math.ceil((p.y + range) / TILE_SIZE));
    const startCol = Math.max(0, Math.floor((p.x - range) / TILE_SIZE));
    const endCol = Math.min(MAP_LAYOUT[0].length, Math.ceil((p.x + range) / TILE_SIZE));

    for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
            const tile = MAP_LAYOUT[r][c];
            if (tile === 0) continue; // Skip floors for clarity

            const worldX = c * TILE_SIZE;
            const worldY = r * TILE_SIZE;
            
            const drawX = mmCenterX + (worldX - p.x) * mmScale;
            const drawY = mmCenterY + (worldY - p.y) * mmScale;
            const drawSize = Math.max(1, TILE_SIZE * mmScale); // Ensure at least 1px

            if (tile === 1 || tile === 7) {
                ctx.fillStyle = '#94a3b8'; // Wall Slate-400
                ctx.fillRect(drawX, drawY, drawSize, drawSize);
            } else if (tile === 3) {
                 ctx.fillStyle = '#ef4444'; // Exit Red
                 ctx.fillRect(drawX, drawY, drawSize, drawSize);
            } else if (tile === 4) {
                 ctx.fillStyle = '#f59e0b'; // Car Amber
                 ctx.fillRect(drawX, drawY, drawSize, drawSize);
            }
        }
    }

    // Draw Player Arrow
    ctx.save();
    ctx.translate(mmCenterX, mmCenterY);
    ctx.rotate(p.yaw);
    ctx.fillStyle = '#22c55e'; // Green
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-4, 4);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // 5. Hiding UI
    if (p.isHidden) {
        ctx.fillStyle = 'rgba(0,0,0,0.95)';
        ctx.fillRect(0,0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.hidingType === 'BED' ? "UNDER BED" : "IN LOCKER", width/2, height/2);
    }
    
    // 6. Jump Scare Face (Non-lethal random event)
    if (jumpScareState.current.active) {
        const t = (Date.now() - jumpScareState.current.timer) / 200; 
        if (t < 1) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0,0,width, height);
            ctx.save();
            ctx.translate(width/2 + (Math.random()-0.5)*20, height/2 + (Math.random()-0.5)*20);
            ctx.scale(2 + t, 2 + t);
            
            // Re-use procedural face or image for mini-jumpscare too? 
            // Let's stick to procedural for the "flash" scares to vary it, or use image if reliable.
            // Using procedural here for variety as the requested image is for the DEATH sequence.
            ctx.fillStyle = '#1a0000';
            ctx.beginPath();
            ctx.ellipse(0, 0, 100, 140, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-40, -20, 15, 0, Math.PI*2);
            ctx.arc(40, -20, 15, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(-40, -20, 5, 0, Math.PI*2);
            ctx.arc(40, -20, 5, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // 7. Note Overlay
    if (activeNote) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fef3c7'; // Paper
        ctx.fillRect(width/2 - 200, height/2 - 150, 400, 300);
        ctx.fillStyle = '#000';
        ctx.font = '20px "Special Elite", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const words = activeNote.split(' ');
        let line = '';
        let y = height/2 - 100;
        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 360 && n > 0) {
                ctx.fillText(line, width/2, y);
                line = words[n] + ' ';
                y += 30;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width/2, y);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText("[PRESS E or ESC TO CLOSE]", width/2, height/2 + 130);
    }
  };

  const tick = useCallback(() => {
     if (gameState !== 'PLAYING') return;
     
     if (activeNote) {
         const cvs = canvasRef.current;
         if (cvs) {
             const ctx = cvs.getContext('2d');
             if (ctx) render(ctx);
         }
         requestRef.current = requestAnimationFrame(tick);
         return;
     }

     if (deathSequence.current.active) {
         const elapsed = Date.now() - deathSequence.current.startTime;
         if (elapsed > 3000) {
             setGameState('GAME_OVER');
             deathSequence.current.active = false; // Stop rendering death sequence
             return;
         }
         const cvs = canvasRef.current;
         if (cvs) {
            const ctx = cvs.getContext('2d');
            if (ctx) render(ctx);
         }
         requestRef.current = requestAnimationFrame(tick);
         return;
     }

     updateScriptedEvents();
     updatePlayer();
     updateEnemy();
     updateRain();
     handleHorrorEvents();
     
     const cvs = canvasRef.current;
     if (cvs) {
         const ctx = cvs.getContext('2d');
         // We disable smoothing for that crisp retro pixel look
         ctx.imageSmoothingEnabled = false; 
         if (ctx) render(ctx);
     }
     
     onStatsUpdate({
         battery: playerRef.current.battery,
         keysFound: playerRef.current.keys,
         totalKeys: 12,
         soundLevel: playerRef.current.noise,
         message: '' 
     });
     
     requestRef.current = requestAnimationFrame(tick);
  }, [gameState, activeNote, keyBindings]);

  useEffect(() => {
     if (gameState === 'PLAYING') {
         requestRef.current = requestAnimationFrame(tick);
     }
     return () => cancelAnimationFrame(requestRef.current);
  }, [tick, gameState]);

  return <canvas ref={canvasRef} width={1280} height={720} className="block w-full h-full bg-black cursor-none" />;
};
