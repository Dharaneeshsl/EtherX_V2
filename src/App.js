import React, { useState, useEffect, useRef } from 'react';
import { apiHealth } from './api';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';

// --- Puzzle Data ---
const finalPhrase = "POWERHOUSE";
const puzzles = [
  { id: 1, riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", solution: "MAP" },
  { id: 2, riddle: "What has an eye, but cannot see?", solution: "NEEDLE" },
  { id: 3, riddle: "What is so fragile that saying its name breaks it?", solution: "SILENCE" },
  { id: 4, riddle: "What comes once in a minute, twice in a moment, but never in a thousand years?", solution: "M" },
  { id: 5, riddle: "I’m tall when I’m young, and I’m short when I’m old. What am I?", solution: "CANDLE" },
  { id: 6, riddle: "What has many keys but can't open a single lock?", solution: "PIANO" },
  { id: 7, riddle: "What can you hold in your left hand but not in your right?", solution: "RIGHT ELBOW" },
  { id: 8, riddle: "What is always in front of you but can’t be seen?", solution: "FUTURE" },
];
const uniqueLetters = [...new Set(finalPhrase.replace(/\s/g, '').split(''))];

// --- State Management Hooks ---
const useGameState = () => {
  const [teamName, setTeamName] = useState(sessionStorage.getItem('teamName') || '');
  const [solvedPuzzles, setSolvedPuzzles] = useState(JSON.parse(sessionStorage.getItem('solvedPuzzles')) || []);
  const [revealedLetters, setRevealedLetters] = useState(JSON.parse(sessionStorage.getItem('revealedLetters')) || []);
  const [guessesLeft, setGuessesLeft] = useState(JSON.parse(sessionStorage.getItem('guessesLeft')) || 3);
  const [hasWonByGuess, setHasWonByGuess] = useState(JSON.parse(sessionStorage.getItem('hasWonByGuess')) || false);

  useEffect(() => {
    sessionStorage.setItem('teamName', teamName);
    sessionStorage.setItem('solvedPuzzles', JSON.stringify(solvedPuzzles));
    sessionStorage.setItem('revealedLetters', JSON.stringify(revealedLetters));
    sessionStorage.setItem('guessesLeft', JSON.stringify(guessesLeft));
    sessionStorage.setItem('hasWonByGuess', JSON.stringify(hasWonByGuess));
  }, [teamName, solvedPuzzles, revealedLetters, guessesLeft, hasWonByGuess]);

  const restart = () => {
    sessionStorage.clear();
    setTeamName('');
    setSolvedPuzzles([]);
    setRevealedLetters([]);
    setGuessesLeft(3);
    setHasWonByGuess(false);
  };

  const login = (name) => {
    // Clear old state completely for a fresh start
    restart();

    if (name.toLowerCase() === 'test') { // Pre-populate for testing
      setTeamName('Test');
      setSolvedPuzzles([1,2,3]);
      setRevealedLetters(['P', 'O', 'W']);
    } else {
      setTeamName(name);
    }
  };

  const solvePuzzle = (puzzleId, letter) => {
    if (!solvedPuzzles.includes(puzzleId)) {
      setSolvedPuzzles(prev => [...prev, puzzleId]);
    }
    if (!revealedLetters.includes(letter)) {
      setRevealedLetters(prev => [...prev, letter]);
    }
  };
  
  const submitFinalGuess = (guess) => {
    if (guess.toUpperCase() === finalPhrase) {
      setHasWonByGuess(true);
      return true;
    } else {
      setGuessesLeft(prev => prev - 1); // Decrement guess count directly
      return false;
    }
  };

  const currentPuzzleId = solvedPuzzles.length + 1;
  const gameWon = finalPhrase.replace(/\s/g, '').split('').every(char => revealedLetters.includes(char)) || hasWonByGuess;
  const gameOver = guessesLeft <= 0 && !gameWon;

  return { teamName, login, solvedPuzzles, solvePuzzle, revealedLetters, guessesLeft, submitFinalGuess, currentPuzzleId, gameWon, gameOver, restart };
};


// --- UI Components ---
const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let dots = [];
    const dotCount = Math.floor((canvas.width * canvas.height) / 3000); // Increased dot density

    for (let i = 0; i < dotCount; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7, // Increased speed
        vy: (Math.random() - 0.5) * 0.7, // Increased speed
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2); // Increased dot size
        ctx.fillStyle = `rgba(200, 200, 200, ${dot.opacity})`;
        ctx.fill();
      });
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

const Layout = ({ children }) => (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center animate-fade-in z-10 p-4 min-h-screen">
      <div className="w-full bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl p-6 sm:p-10 text-center">
        {children}
      </div>
    </div>
);

const Header = ({ teamName, healthStatus }) => (
  <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
    <div className="font-pixel text-2xl text-white">
      <Link to="/">THE EYE</Link>
    </div>
    <div className="flex items-center gap-4">
      <span className={`text-sm ${healthStatus === 'healthy' ? 'text-green-400' : 'text-yellow-400'}`}>API: {healthStatus || 'checking…'}</span>
      {teamName && <div className="text-gray-400">Team: <span className="font-bold text-white">{teamName}</span></div>}
    </div>
  </header>
);

const PhraseDisplay = ({ phrase, revealed }) => {
  const words = phrase.split(' ');
  return (
    <div className="flex flex-col items-center gap-4 my-6">
      {words.map((word, wordIndex) => (
        <div key={wordIndex} className="flex gap-2 flex-wrap justify-center">
          {word.split('').map((char, charIndex) => (
            <div key={charIndex} className="w-8 h-10 sm:w-10 sm:h-12 bg-gray-900 border border-gray-600 rounded-md flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {revealed.includes(char) ? char : ''}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// --- Page Components ---
const LoginPage = ({ onLogin }) => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
      navigate('/dashboard');
    }
  };

  return (
    <Layout>
      <h1 className="font-pixel text-4xl sm:text-5xl text-white mb-4">EtherX</h1>
      <h2 className="text-2xl text-gray-300 mb-6">Team Login</h2>
      <p className="text-gray-400 mb-8">Enter your team name to begin the hunt (or just click Start to Test).</p>
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Team Name"
          className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
        />
        <button type="submit" className="w-full mt-6 bg-white text-black font-bold py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 font-pixel">
          START
        </button>
      </form>
    </Layout>
  );
};

const DashboardPage = ({ teamName, solvedPuzzles, revealedLetters, currentPuzzleId, guessesLeft, onSubmitGuess }) => {
  const [guess, setGuess] = useState('');
  const navigate = useNavigate();

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if(guess.trim()){
      onSubmitGuess(guess);
      setGuess('');
    }
  };
  
  return (
    <Layout>
      <h1 className="font-pixel text-3xl text-white mb-4">Welcome, Team {teamName}</h1>
      <p className="text-gray-400 mb-6">This is your central dashboard. The phrase is being revealed below.</p>
      <PhraseDisplay phrase={finalPhrase} revealed={revealedLetters} />
      
      <div className="w-full border-t border-gray-700 my-8"></div>

      <h2 className="text-2xl font-bold text-white mb-4">Current Task</h2>
      <p className="text-gray-400 mb-6">
        {currentPuzzleId > puzzles.length 
          ? "All puzzles solved! Now guess the final phrase."
          : `Proceed to the next puzzle. Good luck.`
        }
      </p>
      {currentPuzzleId <= puzzles.length && (
         <Link to={`/puzzle/${currentPuzzleId}`} className="inline-block bg-white text-black font-bold py-3 px-6 rounded-md hover:bg-gray-300 transition-colors duration-300 font-pixel">
          GO TO PUZZLE {currentPuzzleId}
        </Link>
      )}

      <div className="w-full border-t border-gray-700 my-8"></div>

      <h2 className="text-2xl font-bold text-white mb-4">Guess the Final Phrase</h2>
      <p className="text-gray-400 mb-6">You have {guessesLeft} guesses left.</p>
      <form onSubmit={handleGuessSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Enter final phrase"
          className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
        />
        <button type="submit" className="w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-md hover:bg-white hover:text-black transition-colors duration-300 font-pixel">
          MAKE A GUESS
        </button>
      </form>
    </Layout>
  );
};

const PuzzlePage = ({ onSolve }) => {
  const { id } = useParams();
  const puzzleId = parseInt(id, 10);
  const puzzle = puzzles.find(p => p.id === puzzleId);
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate(`/puzzle/${puzzleId}/guess`);
  };

  if (!puzzle) {
    return <Layout><h2>Puzzle not found!</h2></Layout>;
  }

  return (
    <Layout>
      <h1 className="font-pixel text-4xl text-white mb-6">Puzzle {puzzle.id}</h1>
      <p className="text-xl text-gray-300 leading-relaxed mb-8">{puzzle.riddle}</p>
      <p className="text-gray-500 mb-8">(Once you have the answer, click here to submit)</p>
      <button onClick={handleSubmit} className="bg-white text-black font-bold py-3 px-6 rounded-md hover:bg-gray-300 transition-colors duration-300 font-pixel">
        SUBMIT SOLUTION FOR PUZZLE {puzzle.id}
      </button>
    </Layout>
  );
};

const LetterGuessPage = ({ onSolve }) => {
    const { id } = useParams();
    const puzzleId = parseInt(id, 10);
    const puzzle = puzzles.find(p => p.id === puzzleId);
    const [solution, setSolution] = useState('');
    const [guess, setGuess] = useState('');
    const navigate = useNavigate();

    const handleSolutionSubmit = (e) => {
        e.preventDefault();
        if (solution.toUpperCase() === puzzle.solution) {
            alert('Correct! Now guess a letter for the final phrase.');
            // This is just a UI state change, not submitting the letter yet
        } else {
            alert('Incorrect solution. Try again.');
            setSolution('');
        }
    };
    
    const handleGuessSubmit = (e) => {
        e.preventDefault();
        const letter = guess.toUpperCase();
        if (letter.length === 1 && uniqueLetters.includes(letter)) {
            onSolve(puzzleId, letter);
            navigate('/dashboard');
        } else {
            alert(`Sorry, '${letter}' is not one of the unique letters in the final phrase or is an invalid input.`);
        }
        setGuess('');
    };

    return (
        <Layout>
            <h1 className="font-pixel text-3xl text-white mb-4">Puzzle {puzzleId} Solved!</h1>
            <p className="text-gray-400 mb-6">You get to guess one of the {uniqueLetters.length} unique letters.</p>
            <form onSubmit={handleGuessSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    maxLength="1"
                    placeholder="Y"
                    className="w-full text-center text-4xl font-bold p-4 bg-gray-900 border-2 border-gray-600 rounded-md text-white focus:outline-none focus:border-white transition-colors"
                />
                <button type="submit" className="w-full mt-4 bg-white text-black font-bold py-3 px-6 rounded-md hover:bg-gray-300 transition-colors duration-300 font-pixel">
                    SUBMIT GUESS
                </button>
            </form>
        </Layout>
    );
};


const WinPage = ({ onRestart }) => (
    <Layout>
      <h1 className="font-pixel text-5xl text-green-400 mb-6">YOU WON!</h1>
      <p className="text-xl text-gray-300 mb-8">Congratulations, you've uncovered the unseen and solved the final phrase.</p>
      <button onClick={onRestart} className="bg-green-500 text-black font-bold py-3 px-8 rounded-md hover:bg-green-400 transition-colors duration-300 font-pixel">
        PLAY AGAIN
      </button>
    </Layout>
);

const GameOverPage = ({ onRestart }) => (
    <Layout>
      <h1 className="font-pixel text-5xl text-red-500 mb-6">GAME OVER</h1>
      <p className="text-xl text-gray-300 mb-8">You've run out of guesses. The EYE remains unseen... for now.</p>
      <button onClick={onRestart} className="bg-red-500 text-black font-bold py-3 px-8 rounded-md hover:bg-red-400 transition-colors duration-300 font-pixel">
        RESTART
      </button>
    </Layout>
);


// --- Main App Component ---
function App() {
  const gameState = useGameState();
  const [healthStatus, setHealthStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiHealth()
      .then((res) => { if (!cancelled) setHealthStatus(res.status); })
      .catch(() => { if (!cancelled) setHealthStatus('unreachable'); });
    return () => { cancelled = true; };
  }, []);
  
  return (
    <>
      <AnimatedBackground />
      <BrowserRouter>
        <AppContent {...gameState} healthStatus={healthStatus} />
      </BrowserRouter>
    </>
  );
}

// Separate component to use hooks from react-router-dom
const AppContent = ({ teamName, login, solvedPuzzles, solvePuzzle, revealedLetters, guessesLeft, submitFinalGuess, currentPuzzleId, gameWon, gameOver, restart, healthStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect logic
    if (gameWon) {
      navigate('/win');
    } else if (gameOver) {
      navigate('/game-over');
    } else if (!teamName && location.pathname !== '/') {
      navigate('/');
    }
  }, [teamName, gameWon, gameOver, navigate, location.pathname]);

  const handleRestart = () => {
    restart();
    navigate('/');
  };

  const handleSubmitFinalGuess = (guess) => {
    submitFinalGuess(guess);
    // The useEffect above will handle navigation on state change
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Header teamName={teamName} healthStatus={healthStatus} />
      <Routes>
        <Route path="/" element={<LoginPage onLogin={login} />} />
        <Route path="/dashboard" element={<DashboardPage teamName={teamName} solvedPuzzles={solvedPuzzles} revealedLetters={revealedLetters} currentPuzzleId={currentPuzzleId} guessesLeft={guessesLeft} onSubmitGuess={handleSubmitFinalGuess}/>} />
        <Route path="/puzzle/:id" element={<PuzzlePage />} />
        <Route path="/puzzle/:id/guess" element={<LetterGuessPage onSolve={solvePuzzle} />} />
        <Route path="/win" element={<WinPage onRestart={handleRestart} />} />
        <Route path="/game-over" element={<GameOverPage onRestart={handleRestart}/>} />
      </Routes>
    </div>
  );
};

export default App;
