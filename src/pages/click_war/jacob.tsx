
import React, { useState, useEffect, useCallback } from 'react';
import { Country, LeaderboardData, TimeLeft, AutoClickTier } from '../../../types';
import { EVENT_DURATION_MS, COUNTRIES, MAX_LEVEL } from './constants';
import CountrySelector from './components/CountrySelector';
import MainGame from './components/MainGame';
import EventEnd from './components/EventEnd';

const App: React.FC = () => {
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [userClicks, setUserClicks] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({});
  const [eventEndTime, setEventEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEventOver, setIsEventOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoClickTier, setAutoClickTier] = useState<AutoClickTier | null>(null);
  const [isGodModeActive, setIsGodModeActive] = useState<boolean>(false);
  const [isAutoClickEnabled, setIsAutoClickEnabled] = useState<boolean>(true);

  const calculateTimeLeft = useCallback((endTime: number): TimeLeft | null => {
    const difference = endTime - new Date().getTime();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  }, []);

  // Initialize persistence layer
  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem('popcat_user_country');
      const savedClicks = localStorage.getItem('popcat_user_clicks');
      const savedLeaderboard = localStorage.getItem('popcat_global_leaderboard');
      let savedEndTime = localStorage.getItem('popcat_event_end_time');
      const savedAutoClickTier = localStorage.getItem('popcat_autoclick_tier');
      const savedGodMode = localStorage.getItem('popcat_god_mode');
      const savedAutoClickEnabled = localStorage.getItem('popcat_autoclick_enabled');

      if (savedCountry) setUserCountry(JSON.parse(savedCountry));
      if (savedClicks) setUserClicks(JSON.parse(savedClicks));
      if (savedAutoClickTier) setAutoClickTier(JSON.parse(savedAutoClickTier));
      if (savedGodMode) setIsGodModeActive(JSON.parse(savedGodMode));
      if (savedAutoClickEnabled) setIsAutoClickEnabled(JSON.parse(savedAutoClickEnabled));
      
      let currentLeaderboard = savedLeaderboard ? JSON.parse(savedLeaderboard) : {};
      COUNTRIES.forEach(country => {
        if (currentLeaderboard[country.name] === undefined) {
          currentLeaderboard[country.name] = 0;
        }
      });
      setLeaderboard(currentLeaderboard);

      if (!savedEndTime) {
        const newEndTime = new Date().getTime() + EVENT_DURATION_MS;
        savedEndTime = String(newEndTime);
        localStorage.setItem('popcat_event_end_time', savedEndTime);
      }
      const endTime = parseInt(savedEndTime, 10);
      setEventEndTime(endTime);

      if (new Date().getTime() >= endTime) {
        setIsEventOver(true);
      } else {
        const initialRemaining = calculateTimeLeft(endTime);
        if (initialRemaining) setTimeLeft(initialRemaining);
      }
    } catch (error) {
      console.warn("Storage sync failed, using defaults", error);
    } finally {
      // Artificial delay for high-end feel
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [calculateTimeLeft]);

  // Global event countdown
  useEffect(() => {
    if (!eventEndTime || isEventOver) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(eventEndTime);
      if (remaining) {
        setTimeLeft(remaining);
      } else {
        setIsEventOver(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventEndTime, isEventOver, calculateTimeLeft]);

  const handleSelectCountry = (country: Country) => {
    setUserCountry(country.name);
    localStorage.setItem('popcat_user_country', JSON.stringify(country.name));
    setLeaderboard(prev => {
      const next = { ...prev };
      if (next[country.name] === undefined) next[country.name] = 0;
      localStorage.setItem('popcat_global_leaderboard', JSON.stringify(next));
      return next;
    });
  };

  const handleIncrement = useCallback(() => {
    if (isEventOver || !userCountry) return;
  
    setUserClicks(prevClicks => {
      const currentLevel = Math.min(MAX_LEVEL, Math.floor(Math.sqrt(prevClicks / 10)) + 1);
      const clickValue = 1 + (currentLevel - 1) * 0.05;
      const newClicks = prevClicks + clickValue;
  
      setLeaderboard(prevLeaderboard => {
        const updated = {
          ...prevLeaderboard,
          [userCountry]: (prevLeaderboard[userCountry] || 0) + clickValue,
        };
        localStorage.setItem('popcat_global_leaderboard', JSON.stringify(updated));
        return updated;
      });
  
      localStorage.setItem('popcat_user_clicks', JSON.stringify(newClicks));
      return newClicks;
    });
  }, [userCountry, isEventOver]);
  
  const handlePurchaseTier = (tier: AutoClickTier) => {
    setAutoClickTier(tier);
    localStorage.setItem('popcat_autoclick_tier', JSON.stringify(tier));
  };

  const handleToggleGodMode = () => {
    const next = !isGodModeActive;
    setIsGodModeActive(next);
    localStorage.setItem('popcat_god_mode', JSON.stringify(next));
  };

  const handleToggleAutoClick = () => {
    const next = !isAutoClickEnabled;
    setIsAutoClickEnabled(next);
    localStorage.setItem('popcat_autoclick_enabled', JSON.stringify(next));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        </div>
        <p className="mt-8 text-sm font-black tracking-[0.4em] uppercase text-gray-400 animate-pulse">Syncing Intel...</p>
      </div>
    );
  }

  if (isEventOver && userCountry) {
    return <EventEnd leaderboard={leaderboard} userCountry={userCountry} />;
  }

  if (!userCountry) {
    return <CountrySelector onSelectCountry={handleSelectCountry} />;
  }

  return (
    <MainGame
      userCountry={userCountry}
      userClicks={userClicks}
      leaderboard={leaderboard}
      timeLeft={timeLeft}
      onIncrement={handleIncrement}
      autoClickTier={autoClickTier}
      onPurchaseTier={handlePurchaseTier}
      isGodModeActive={isGodModeActive}
      onToggleGodMode={handleToggleGodMode}
      isAutoClickEnabled={isAutoClickEnabled}
      onToggleAutoClick={handleToggleAutoClick}
    />
  );
};

export default App;
