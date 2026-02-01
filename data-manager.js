// Менеджер данных для работы с JSON файлом
class DataManager {
  constructor() {
    this.dataFile = 'data.json';
    this.data = null;
  }

  // Загрузить данные из JSON
  async load() {
    try {
      const response = await fetch(this.dataFile);
      if (response.ok) {
        this.data = await response.json();
        console.log('✅ Данные загружены из data.json');
        return this.data;
      } else {
        console.warn('⚠️ Не удалось загрузить data.json, используем localStorage');
        this.loadFromLocalStorage();
        return this.data;
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки data.json:', error);
      this.loadFromLocalStorage();
      return this.data;
    }
  }

  // Загрузить из localStorage (резервный вариант)
  loadFromLocalStorage() {
    this.data = {
      users: JSON.parse(localStorage.getItem('users') || '{}'),
      cards: JSON.parse(localStorage.getItem('cards') || '[]'),
      tests: JSON.parse(localStorage.getItem('tests') || '[]'),
      chatMessages: JSON.parse(localStorage.getItem('chatMessages') || '[]'),
      systemStatus: JSON.parse(localStorage.getItem('systemStatus') || '{"teachers":true,"students":true}'),
      logs: JSON.parse(localStorage.getItem('logs') || '[]')
    };
  }

  // Сохранить данные (в localStorage, т.к. GitHub Pages не поддерживает запись)
  save() {
    if (!this.data) return;
    
    localStorage.setItem('users', JSON.stringify(this.data.users));
    localStorage.setItem('cards', JSON.stringify(this.data.cards));
    localStorage.setItem('tests', JSON.stringify(this.data.tests));
    localStorage.setItem('chatMessages', JSON.stringify(this.data.chatMessages));
    localStorage.setItem('systemStatus', JSON.stringify(this.data.systemStatus));
    localStorage.setItem('logs', JSON.stringify(this.data.logs));
    
    console.log('💾 Данные сохранены в localStorage');
  }

  // Экспортировать данные в JSON для скачивания
  export() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('📥 Данные экспортированы');
  }

  // Импортировать данные из JSON файла
  async import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          this.data = JSON.parse(e.target.result);
          this.save();
          console.log('📤 Данные импортированы');
          resolve(this.data);
        } catch (error) {
          console.error('❌ Ошибка импорта:', error);
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Получить пользователей
  getUsers() {
    return this.data?.users || {};
  }

  // Добавить/обновить пользователя
  setUser(login, userData) {
    if (!this.data.users) this.data.users = {};
    this.data.users[login] = userData;
    this.save();
  }

  // Получить карточки
  getCards() {
    return this.data?.cards || [];
  }

  // Добавить карточку
  addCard(card) {
    if (!this.data.cards) this.data.cards = [];
    this.data.cards.push(card);
    this.save();
  }

  // Удалить карточку
  deleteCard(cardId) {
    if (!this.data.cards) return;
    this.data.cards = this.data.cards.filter(c => c.id !== cardId);
    this.save();
  }

  // Получить тесты
  getTests() {
    return this.data?.tests || [];
  }

  // Добавить тест
  addTest(test) {
    if (!this.data.tests) this.data.tests = [];
    this.data.tests.push(test);
    this.save();
  }

  // Получить сообщения чата
  getChatMessages() {
    return this.data?.chatMessages || [];
  }

  // Добавить сообщение
  addChatMessage(message) {
    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(message);
    this.save();
  }

  // Получить статус системы
  getSystemStatus() {
    return this.data?.systemStatus || { teachers: true, students: true };
  }

  // Обновить статус системы
  setSystemStatus(status) {
    this.data.systemStatus = status;
    this.save();
  }

  // Получить логи
  getLogs() {
    return this.data?.logs || [];
  }

  // Добавить лог
  addLog(log) {
    if (!this.data.logs) this.data.logs = [];
    this.data.logs.push(log);
    this.save();
  }
}

// Глобальный экземпляр
const dataManager = new DataManager();
