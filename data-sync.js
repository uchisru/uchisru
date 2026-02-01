// Синхронизация данных через JSONBin.io
class DataSync {
  constructor() {
    // Создай бесплатный аккаунт на https://jsonbin.io
    // Получи API ключ и вставь сюда
    this.apiKey = '$2a$10$G6Vsch/tVngpvbvaVrDiVO04VEtq/xYv0we2sE7FsYlooPBg1GJlO'; // ЗАМЕНИ НА СВОЙ!
    this.binId = null; // ID хранилища (создастся автоматически)
    this.apiUrl = 'https://api.jsonbin.io/v3/b';
    this.data = null;
  }

  // Загрузить данные из облака
  async load() {
    console.log('📥 Загрузка данных из облака...');
    
    // Проверяем, есть ли сохранённый ID хранилища
    this.binId = localStorage.getItem('binId');
    
    if (this.binId) {
      try {
        const response = await fetch(`${this.apiUrl}/${this.binId}/latest`, {
          headers: {
            'X-Master-Key': this.apiKey
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          this.data = result.record;
          console.log('✅ Данные загружены из облака');
          return this.data;
        }
      } catch (error) {
        console.warn('⚠️ Ошибка загрузки из облака:', error);
      }
    }
    
    // Если не удалось загрузить - создаём новые данные
    this.data = {
      users: {
        "admin": {
          "password": "admin123",
          "name": "Администратор",
          "role": "admin",
          "email": "admin@uchis.ru"
        }
      },
      cards: [],
      tests: [],
      chatMessages: [],
      systemStatus: { teachers: true, students: true },
      logs: []
    };
    
    await this.save();
    console.log('✅ Созданы новые данные');
    return this.data;
  }

  // Сохранить данные в облако
  async save() {
    if (!this.data) return;
    
    console.log('💾 Сохранение в облако...');
    
    try {
      if (this.binId) {
        // Обновляем существующее хранилище
        const response = await fetch(`${this.apiUrl}/${this.binId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': this.apiKey
          },
          body: JSON.stringify(this.data)
        });
        
        if (response.ok) {
          console.log('✅ Данные сохранены в облако');
        }
      } else {
        // Создаём новое хранилище
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': this.apiKey,
            'X-Bin-Name': 'uchis-ru-data'
          },
          body: JSON.stringify(this.data)
        });
        
        if (response.ok) {
          const result = await response.json();
          this.binId = result.metadata.id;
          localStorage.setItem('binId', this.binId);
          console.log('✅ Создано новое хранилище:', this.binId);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
    }
  }

  // Автосохранение каждые 30 секунд
  startAutoSync() {
    setInterval(() => {
      this.save();
    }, 30000); // 30 секунд
  }

  // Методы для работы с данными
  getUsers() { return this.data?.users || {}; }
  setUser(login, userData) {
    if (!this.data.users) this.data.users = {};
    this.data.users[login] = userData;
    this.save();
  }

  getCards() { return this.data?.cards || []; }
  addCard(card) {
    if (!this.data.cards) this.data.cards = [];
    this.data.cards.push(card);
    this.save();
  }

  deleteCard(cardId) {
    if (!this.data.cards) return;
    this.data.cards = this.data.cards.filter(c => c.id !== cardId);
    this.save();
  }

  getTests() { return this.data?.tests || []; }
  addTest(test) {
    if (!this.data.tests) this.data.tests = [];
    this.data.tests.push(test);
    this.save();
  }

  getChatMessages() { return this.data?.chatMessages || []; }
  addChatMessage(message) {
    if (!this.data.chatMessages) this.data.chatMessages = [];
    this.data.chatMessages.push(message);
    this.save();
  }

  getSystemStatus() {
    return this.data?.systemStatus || { teachers: true, students: true };
  }
  setSystemStatus(status) {
    this.data.systemStatus = status;
    this.save();
  }

  getLogs() { return this.data?.logs || []; }
  addLog(log) {
    if (!this.data.logs) this.data.logs = [];
    this.data.logs.push(log);
    this.save();
  }

  export() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          this.data = JSON.parse(e.target.result);
          await this.save();
          resolve(this.data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

const dataManager = new DataSync();
