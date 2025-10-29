// netlify/functions/sheets.js
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { service } = event.queryStringParameters;
    
    if (!service) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Не указан параметр service' })
      };
    }

    // Тестовые данные
    const testData = [
      { service: "Обмен", brand: "Xerox", model: "Тестовый картридж 1", price: "1000" },
      { service: "Обмен", brand: "HP", model: "Тестовый картридж 2", price: "1500" }
    ];

    console.log('Функция вызвана с service:', service);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(testData)
    };

  } catch (error) {
    console.error('Ошибка:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Ошибка сервера' })
    };
  }
};