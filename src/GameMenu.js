import React from 'react';

const GameMenu = ({ hero, onUpdate, onClose }) => {
  return (
    <div className="game-menu">
      <h3>Настройки героя</h3>
      <label>
        Цвет заклинания:
        <input
          type="color"
          value={hero.spellColor}
          onChange={(e) => onUpdate('spellColor', e.target.value)}
        />
      </label>
      <label>
        Частота стрельбы:
        <input
          type="range"
          id="frequency"
          min="100"
          max="500"
          step="100"
          value={600 - hero.frequency}
          onChange={(e) => {
            const newFrequency = 600 - e.target.value;
            onUpdate('frequency', newFrequency);
          }}
        />
      </label>
      <label>
        Скорость движения:
        <input
          type="range"
          id="speed"
          min="0"
          max="1"
          step="0.1"
          value={hero.speed}
          onChange={(e) => onUpdate('speed', e.target.value)}
        />
      </label>
      <button className='btn-close' onClick={onClose}>Закрыть</button>
    </div>
  );
};

export default GameMenu;
