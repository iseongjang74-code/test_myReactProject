let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

const playTone = (freq: number, type: OscillatorType, duration: number) => {
  initAudioContext();
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  
  // Click reduction (envelope)
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + duration);
};

export const audioService = {
  playSuccess: () => {
    // Major chord for success
    const now = 0;
    setTimeout(() => playTone(523.25, 'sine', 0.15), now);       // C5
    setTimeout(() => playTone(659.25, 'sine', 0.15), now + 80);  // E5
    setTimeout(() => playTone(783.99, 'sine', 0.3), now + 160);  // G5
  },
  playError: () => {
    // Dissonant buzz
    playTone(150, 'sawtooth', 0.3);
    setTimeout(() => playTone(140, 'sawtooth', 0.3), 50);
  },
  playClick: () => {
    // Sharp tick
    playTone(800, 'triangle', 0.05);
  },
  playTick: () => {
    // Wooden block style tick
    playTone(1200, 'sine', 0.03);
  },
  speak: (text: string, rate: number = 1) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Interrupt previous speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      
      // Try to find a better voice (Google US English or similar)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Google US English') || 
        (v.lang === 'en-US' && v.name.includes('Samantha'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }
};