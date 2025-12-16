import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Состояния
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [history, setHistory] = useState([]);
  const [copyMessage, setCopyMessage] = useState('');

  // Генерация пароля
  const generatePassword = () => {
    const charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*'
    };
    
    // Собираем доступные символы
    let chars = '';
    if (options.uppercase) chars += charSets.uppercase;
    if (options.lowercase) chars += charSets.lowercase;
    if (options.numbers) chars += charSets.numbers;
    if (options.symbols) chars += charSets.symbols;
    
    // Если ничего не выбрано - используем все
    if (!chars) chars = Object.values(charSets).join('');
    
    // Генерируем пароль
    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += chars[Math.floor(Math.random() * chars.length)];
    }
    
    setPassword(newPassword);
    
    // Добавляем в историю
    const newItem = {
      password: newPassword,
      date: new Date().toLocaleTimeString()
    };
    setHistory(prev => [newItem, ...prev.slice(0, 4)]); // Храним только 5 последних
  };

  // Копирование пароля
  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopyMessage('✓ Скопировано!');
    setTimeout(() => setCopyMessage(''), 2000);
  };

  // Расчет надежности
  const calculateStrength = (pass) => {
    if (!pass) return 0;
    
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    
    return score;
  };

  // Удаление из истории
  const removeFromHistory = (index) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  // Загружаем историю при старте
  useEffect(() => {
    const saved = localStorage.getItem('passwordHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Сохраняем историю
  useEffect(() => {
    localStorage.setItem('passwordHistory', JSON.stringify(history));
  }, [history]);

  // Генерируем первый пароль при загрузке
  useEffect(() => {
    generatePassword();
  }, []);

  return (
    <div className="app">
      <header>
        <h1>🔐 Генератор паролей</h1>
        <p>Создавайте безопасные пароли за секунды</p>
      </header>

      <main>
        {/* Отображение пароля */}
        <div className="password-section">
          <div className="password-display">
            <input
              type="text"
              value={password}
              readOnly
              placeholder="Ваш пароль появится здесь"
            />
            <div className="password-actions">
              <button onClick={generatePassword} className="generate-btn">
                🔄 Сгенерировать
              </button>
              <button 
                onClick={copyToClipboard} 
                className="copy-btn"
                disabled={!password}
              >
                📋 Копировать
              </button>
            </div>
            {copyMessage && <span className="copy-message">{copyMessage}</span>}
          </div>

          {/* Индикатор надежности */}
          <div className="strength-meter">
            <div className="strength-label">
              Надёжность: 
              <span className={`strength-text strength-${Math.floor(calculateStrength(password)/25)}`}>
                {calculateStrength(password) < 50 ? 'Слабый' : 
                 calculateStrength(password) < 75 ? 'Средний' : 'Сильный'}
              </span>
            </div>
            <div className="strength-bar">
              <div 
                className="strength-fill"
                style={{ width: `${calculateStrength(password)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Настройки */}
        <div className="settings">
          <h3>Настройки пароля</h3>
          
          <div className="length-control">
            <label>Длина пароля: <strong>{length}</strong></label>
            <input
              type="range"
              min="6"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
            />
          </div>

          <div className="options">
            {['uppercase', 'lowercase', 'numbers', 'symbols'].map((option) => (
              <label key={option} className="option">
                <input
                  type="checkbox"
                  checked={options[option]}
                  onChange={() => setOptions(prev => ({
                    ...prev,
                    [option]: !prev[option]
                  }))}
                />
                <span>
                  {option === 'uppercase' && 'Заглавные буквы (A-Z)'}
                  {option === 'lowercase' && 'Строчные буквы (a-z)'}
                  {option === 'numbers' && 'Цифры (0-9)'}
                  {option === 'symbols' && 'Спецсимволы (!@#$%^&*)'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* История */}
        {history.length > 0 && (
          <div className="history">
            <h3>История паролей</h3>
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-password">
                    <span className="password-preview">
                      {'•'.repeat(Math.min(15, item.password.length))}
                    </span>
                    <span className="password-meta">
                      {item.password.length} симв. | {item.date}
                    </span>
                  </div>
                  <div className="history-actions">
                    <button 
                      onClick={() => {
                        setPassword(item.password);
                        setCopyMessage('✓ Загружен!');
                      }}
                      className="use-btn"
                    >
                      Использовать
                    </button>
                    <button 
                      onClick={() => removeFromHistory(index)}
                      className="delete-btn"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setHistory([])}
              className="clear-history"
            >
              Очистить историю
            </button>
          </div>
        )}
      </main>

      <footer>
        <p>Генератор создает уникальные пароли на основе ваших настроек</p>
        <p className="tip">💡 Совет: используйте пароли длиной от 12 символов</p>
      </footer>
    </div>
  );
}

export default App;