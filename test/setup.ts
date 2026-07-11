import '@testing-library/jest-dom';

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.vibrate for tests
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn(),
});

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  currentTime = 0;
  createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: { value: 0 },
    connect: vi.fn(() => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), gain: { value: 0 } })),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }));
  createBiquadFilter = vi.fn(() => ({
    type: 'lowpass',
    frequency: { value: 0 },
    connect: vi.fn(),
  }));
  destination = {} as AudioDestinationNode;
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});
