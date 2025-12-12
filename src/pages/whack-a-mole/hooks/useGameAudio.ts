import { useEffect, useRef, useState } from "react";

interface UseGameAudioProps {
  isNightmareMode: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isOnHomeScreen?: boolean; // New prop to detect if on home screen
}

export const useGameAudio = ({
  isNightmareMode,
  isPlaying,
  isPaused,
  isOnHomeScreen = false,
}: UseGameAudioProps) => {
  const normalAudioRef = useRef<HTMLAudioElement | null>(null);
  const nightmareAudioRef = useRef<HTMLAudioElement | null>(null);
  const interfaceNormalRef = useRef<HTMLAudioElement | null>(null);
  const interfaceNightmareRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    // Game music
    normalAudioRef.current = new Audio("/audio/normal-mode.mp3");
    nightmareAudioRef.current = new Audio("/audio/nighmare-mode.mp3");

    // Interface music
    interfaceNormalRef.current = new Audio("/audio/interface_normalmode.mp3");
    interfaceNightmareRef.current = new Audio(
      "/audio/interface_nightmaremode.mp3",
    );

    // Set audio properties for game music
    if (normalAudioRef.current) {
      normalAudioRef.current.loop = true;
      normalAudioRef.current.volume = 0.3;
    }
    if (nightmareAudioRef.current) {
      nightmareAudioRef.current.loop = true;
      nightmareAudioRef.current.volume = 0.3;
    }

    // Set audio properties for interface music
    if (interfaceNormalRef.current) {
      interfaceNormalRef.current.loop = true;
      interfaceNormalRef.current.volume = 0.3;
    }
    if (interfaceNightmareRef.current) {
      interfaceNightmareRef.current.loop = true;
      interfaceNightmareRef.current.volume = 0.3;
    }

    setIsAudioReady(true);

    // Cleanup on unmount
    return () => {
      if (normalAudioRef.current) {
        normalAudioRef.current.pause();
        normalAudioRef.current = null;
      }
      if (nightmareAudioRef.current) {
        nightmareAudioRef.current.pause();
        nightmareAudioRef.current = null;
      }
      if (interfaceNormalRef.current) {
        interfaceNormalRef.current.pause();
        interfaceNormalRef.current = null;
      }
      if (interfaceNightmareRef.current) {
        interfaceNightmareRef.current.pause();
        interfaceNightmareRef.current = null;
      }
    };
  }, []);

  // Handle interface music on home screen and game music when playing
  useEffect(() => {
    if (!isAudioReady) return;

    if (isPlaying) {
      // Game started - stop all interface music and start game music
      if (interfaceNormalRef.current && !interfaceNormalRef.current.paused) {
        interfaceNormalRef.current.pause();
        interfaceNormalRef.current.currentTime = 0;
      }
      if (
        interfaceNightmareRef.current &&
        !interfaceNightmareRef.current.paused
      ) {
        interfaceNightmareRef.current.pause();
        interfaceNightmareRef.current.currentTime = 0;
      }

      // Start game music
      const gameAudio = isNightmareMode
        ? nightmareAudioRef.current
        : normalAudioRef.current;
      if (gameAudio && !isMuted) {
        gameAudio.volume = 0.3;
        gameAudio.play().catch(() => {
          // Silent fail - autoplay might be blocked by browser
        });
      }
    } else if (isOnHomeScreen) {
      // On home screen - play interface music
      const currentInterface = isNightmareMode
        ? interfaceNightmareRef.current
        : interfaceNormalRef.current;
      const otherInterface = isNightmareMode
        ? interfaceNormalRef.current
        : interfaceNightmareRef.current;

      // Stop other interface music
      if (otherInterface && !otherInterface.paused) {
        otherInterface.pause();
        otherInterface.currentTime = 0;
      }

      // Play current interface music - restart if already playing
      if (currentInterface && !isMuted) {
        currentInterface.pause();
        currentInterface.currentTime = 0;
        currentInterface.volume = 0.3;
        currentInterface.play().catch(() => {
          // Silent fail - autoplay might be blocked by browser
        });
      }
    }
  }, [isNightmareMode, isAudioReady, isMuted, isOnHomeScreen, isPlaying]);

  // Handle music switching when mode changes during gameplay
  useEffect(() => {
    if (!isAudioReady || !isPlaying) return;

    const currentAudio = isNightmareMode
      ? nightmareAudioRef.current
      : normalAudioRef.current;
    const otherAudio = isNightmareMode
      ? normalAudioRef.current
      : nightmareAudioRef.current;

    // Stop other audio
    if (otherAudio && !otherAudio.paused) {
      otherAudio.pause();
      otherAudio.currentTime = 0;
    }

    // Play current audio
    if (currentAudio && !isMuted && !isPaused) {
      if (currentAudio.paused) {
        currentAudio.volume = 0.3;
        currentAudio.play().catch(() => {
          // Silent fail - autoplay might be blocked by browser
        });
      }
    }
  }, [isNightmareMode, isPlaying, isAudioReady, isMuted, isPaused]);

  // Handle pause/resume
  useEffect(() => {
    if (!isAudioReady) return;

    const currentAudio = isNightmareMode
      ? nightmareAudioRef.current
      : normalAudioRef.current;

    if (currentAudio) {
      if (isPaused) {
        currentAudio.pause();
      } else if (isPlaying && !isMuted) {
        currentAudio.play().catch(() => {
          // Silent fail - autoplay might be blocked by browser
        });
      }
    }
  }, [isPaused, isPlaying, isNightmareMode, isAudioReady, isMuted]);

  // Stop music when game stops
  useEffect(() => {
    if (!isPlaying && isAudioReady) {
      if (normalAudioRef.current) {
        normalAudioRef.current.pause();
        normalAudioRef.current.currentTime = 0;
      }
      if (nightmareAudioRef.current) {
        nightmareAudioRef.current.pause();
        nightmareAudioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying, isAudioReady]);

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;

      // Mute/unmute game music
      if (normalAudioRef.current) {
        normalAudioRef.current.muted = newMuted;
      }
      if (nightmareAudioRef.current) {
        nightmareAudioRef.current.muted = newMuted;
      }

      // Mute/unmute interface music
      if (interfaceNormalRef.current) {
        interfaceNormalRef.current.muted = newMuted;
      }
      if (interfaceNightmareRef.current) {
        interfaceNightmareRef.current.muted = newMuted;
      }

      return newMuted;
    });
  };

  return {
    isMuted,
    toggleMute,
  };
};
