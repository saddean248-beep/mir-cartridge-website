// netlify/functions/cartridges.js
const { google } = require('googleapis');

exports.handler = async function(event, context) {
  // Настройки для CORS (разрешаем запросы)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Если браузер проверяет доступность
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { service } = event.queryStringParameters;
    
    console.log('Запрос на услугу:', service);
    
    if (!service) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Не указан параметр service' })
      };
    }

    // Определяем какой лист использовать
    let sheetName = 'Лист1'; // по умолчанию Заправка
    
    if (service.toLowerCase() === 'заправка') sheetName = 'Лист1';
    else if (service.toLowerCase() === 'обмен') sheetName = 'Лист2';
    
    console.log('Используем лист:', sheetName);

    // ID вашей Google таблицы
    const SPREADSHEET_ID = '1SjNsRu6gIXA8f2CWpm_lQN5RS-m_cmQVJsfrMPUmZF0';
    
    // Аутентификация
    const auth = new google.auth.GoogleAuth({
      keyFile: false,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Читаем данные из таблицы - 4 КОЛОНКИ!
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:D`, // Колонки A, B, C, D
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log('Нет данных в листе:', sheetName);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    // Преобразуем данные в нужный формат
    const cartridgesData = [];
    
    // Пропускаем заголовок (первую строку) и обрабатываем данные
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Проверяем, что строка содержит все 4 колонки
      if (row && row.length >= 4) {
        const rowService = (row[0] || '').trim().toLowerCase();
        const requestedService = service.toLowerCase();
        
        // Фильтруем только нужную услугу (двойная проверка)
        if (rowService === requestedService) {
          cartridgesData.push({
            service: row[0] || '',
            brand: (row[1] || '').trim(),
            model: (row[2] || '').trim(),
            price: (row[3] || '').trim()
          });
        }
      }
    }

    console.log(`Для услуги "${service}" найдено ${cartridgesData.length} записей`);
    
    // Если данных для этой услуги нет, возвращаем тестовые
    if (cartridgesData.length === 0) {
      console.log('Нет данных для этой услуги, возвращаем тестовые данные');
      const testData = getTestData(service);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(testData)
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(cartridgesData)
    };

  } catch (error) {
    console.error('Ошибка при загрузке из Google Sheets:', error);
    
    // При ошибке возвращаем тестовые данные
    const testData = getTestData(event.queryStringParameters.service);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(testData)
    };
  }
};

// Функция с тестовыми данными на случай ошибки
function getTestData(service) {
  const serviceLower = service?.toLowerCase();
  
  if (serviceLower === 'заправка') {
    return [
      { service: "Заправка", brand: "Xerox", model: "013R00625 для Xerox WC 3119", price: "790" },
      { service: "Заправка", brand: "HP", model: "HP CF400X", price: "1200" },
      { service: "Заправка", brand: "Canon", model: "Canon 725", price: "950" },
      { service: "Заправка", brand: "Samsung", model: "Samsung MLT-D101S", price: "800" }
    ];
  } else if (serviceLower === 'обмен') {
    return [
      { service: "Обмен", brand: "Xerox", model: "013R00625 для Xerox WC 3119", price: "1000" },
      { service: "Обмен", brand: "HP", model: "HP CF400X", price: "1500" },
      { service: "Обмен", brand: "Canon", model: "Canon 725", price: "1100" }
    ];
  }
  
  return [
    { service: service, brand: "Test", model: "Тестовый картридж", price: "1000" }
  ];
}
