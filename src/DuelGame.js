import React, { useRef, useEffect, useState } from 'react';
import GameMenu from './GameMenu';

const canvasWidth = 800;
const canvasHeight = 500;

const DuelGame = () => {
  const canvasRef = useRef(null);
  const [heroes, setHeroes] = useState([
    { id: 1, x: 50, y: canvasHeight / 2, radius: 30, color: 'blue', speed: 0.2, direction: -1, spellColor: '#FF0000', frequency: 500 },
    { id: 2, x: canvasWidth - 50, y: canvasHeight / 2, radius: 30, color: 'purple', speed: 0.2, direction: 1, spellColor: '#FFA500', frequency: 500 },
  ]);
  const [spells, setSpells] = useState([]);
  const [selectedHero, setSelectedHero] = useState(null);
  const [scores, setScores] = useState({hero1: 0, hero2: 0});
  const [waitingForBounce, setWaitingForBounce] = useState(false);
  
  const heroesRef = useRef(heroes);
  const spellsRef = useRef(spells);

  useEffect(() => {
    heroesRef.current = heroes;
  }, [heroes]);

  useEffect(() => {
    spellsRef.current = spells;
  }, [spells]);

  useEffect(() => {
    const gameLoop = () => {
      heroesRef.current = heroesRef.current.map(hero => {
        const maxMovement = 1;
        let newY = hero.y + hero.speed * hero.direction;

        if (Math.abs(newY - hero.y) > maxMovement) {
          newY = hero.y + (hero.speed * hero.direction > 0 ? maxMovement : -maxMovement);
        }

        if (newY - hero.radius < 0 || newY + hero.radius > canvasHeight) {
          hero.direction *= -1;
        }
        return { ...hero, y: newY };
      });

      const hitHeroIds = new Set();

      spellsRef.current = spellsRef.current.filter(spell => {
        spell.x += spell.speedX;
        
        const hero = heroesRef.current.find(h => h.id === spell.heroId);
        if (hero) {
            spell.y = hero.y; 
        }

        const hit = heroesRef.current.some(hero => {
          const distance = Math.hypot(hero.x - spell.x, hero.y - spell.y);
          if (distance < hero.radius && hero.id !== spell.heroId) {
            hitHeroIds.add(hero.id);
            return true;
          }
          return false;
        });
          
        return spell.x > 0 && spell.x < canvasWidth && !hit;
      });

      if (hitHeroIds.size > 0) {
        setScores(scores => {
          const newScores = { ...scores };
          hitHeroIds.forEach(id => {
            newScores[`hero${id}`] += 1; 
          });
          return newScores;
        });
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      heroesRef.current.forEach(hero => {
        ctx.beginPath();
        ctx.arc(hero.x, hero.y, hero.radius, 0, 2 * Math.PI);
        ctx.fillStyle = hero.color;
        ctx.fill();
        ctx.closePath();
      });

      spellsRef.current.forEach(spell => {
        ctx.beginPath();
        ctx.arc(spell.x, spell.y, spell.radius, 0, 2 * Math.PI);
        ctx.fillStyle = spell.color;
        ctx.fill();
        ctx.closePath();
      });

      requestAnimationFrame(gameLoop);
    };

    const animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [scores]);

  const handleMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  
    setHeroes(heroes => heroes.map(hero => {
      const distance = Math.hypot(mouseX - hero.x, mouseY - hero.y);
      
      if (distance < hero.radius) {
        if (!waitingForBounce) {
          setWaitingForBounce(true);
          setTimeout(() => {
            hero.direction *= -1; 
            setWaitingForBounce(false); 
          }, 2000); 
        }
      }
  
      return hero;
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fireSpell = (hero) => {
    const targetHero = heroes.find(h => h.id !== hero.id); 
    const angle = Math.atan2(targetHero.y - hero.y, targetHero.x - hero.x);
    const spell = {
      x: hero.x,
      y: hero.y,
      radius: 5,
      color: hero.spellColor,
      speedX: Math.cos(angle) * 1.1,
      speedY: Math.sin(angle) * 1.1,
      heroId: hero.id, 
    };
    setSpells(spells => [...spells, spell]);
  };

  useEffect(() => {
    const intervals = heroes.map((hero) => {
      return setInterval(() => {
        fireSpell(hero);
      }, hero.frequency);
    });

    return () => intervals.forEach(clearInterval);
  }, [heroes]);

  const handleHeroClick = (index) => {
    setSelectedHero(index);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      heroes.forEach((hero, index) => {
        const distance = Math.hypot(mouseX - hero.x, mouseY - hero.y);
        const buffer = hero.radius + 10;
        if (distance < buffer) {
          handleHeroClick(index);
        }
      });
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [heroes]);

  const updateHeroProperty = (property, value) => {
    setHeroes(heroes => heroes.map((hero, index) => 
      index === selectedHero ? { ...hero, [property]: value } : hero
    ));
  };

  return (
    <>
      <div className="canvas-container">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
      <div className="scoreboard">
        <div className="scoreboard-item">
          <div className="hero-title">Hero 1</div>
          <div className="hero-score">{scores.hero1}</div>
        </div>
        <div className="scoreboard-item">
          <div className="hero-title">Hero 2</div>
          <div className="hero-score">{scores.hero2}</div>
        </div>
      </div>
    </div>
    {selectedHero !== null && (
      <GameMenu
        hero={heroes[selectedHero]}
        onUpdate={updateHeroProperty}
        onClose={() => setSelectedHero(null)}
        className="game-menu"
      />
    )}
    </>
  );
};

export default DuelGame;
