// service-script.js - Универсальный скрипт для всех услуг

// Определяем тип услуги по URL страницы
function getServiceType() {
    const path = window.location.pathname;
    console.log('Текущий путь:', path); // ДЛЯ ОТЛАДКИ
    
    if (path.includes('zapravka-kartridzhey')) {
        return { sheet: 'Лист1', service: 'Заправка', message: 'заправки картриджей' };
    } else if (path.includes('obmen-kartridzhey')) {
        return { sheet: 'Лист2', service: 'Обмен', message: 'обмена картриджей' };
    } else if (path.includes('remont-orgtehniki')) {
        return { sheet: 'Лист3', service: 'Ремонт', message: 'ремонта оргтехники' };
    } else if (path.includes('dostavka')) {
        return { sheet: 'Лист4', service: 'Доставка', message: 'доставки' };
    }
    return { sheet: 'Лист1', service: 'Заправка', message: 'услуги' };
}

let cartridgesData = [];

// ЗАГРУЗКА ДАННЫХ ИЗ GOOGLE SHEETS
async function loadDataFromSheets() {
    const serviceInfo = getServiceType();
    console.log('Загружаем данные для услуги:', serviceInfo.service); // ДЛЯ ОТЛАДКИ
    
    try {
        // Пытаемся загрузить с Netlify функции
        const serviceParam = serviceInfo.service.toLowerCase();
        const response = await fetch(`/.netlify/functions/sheets?service=${serviceParam}`);
        
        console.log('Ответ от функции:', response); // ДЛЯ ОТЛАДКИ
        
        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены данные:', data); // ДЛЯ ОТЛАДКИ
        
        cartridgesData = [];
        
        // Обрабатываем данные из нашей API
        data.forEach(item => {
            if (item.brand && item.model && item.price) {
                cartridgesData.push({
                    brand: item.brand.toLowerCase(),
                    model: item.model,
                    price: item.price + ' руб', // ДОБАВЛЯЕМ "руб"
                    service: item.service
                });
            }
        });
        
        console.log(`Данные ${serviceInfo.service.toLowerCase()} загружены:`, cartridgesData.length, 'позиций');
        
        // Если данных нет, показываем тестовые
        if (cartridgesData.length === 0) {
            showTestData(serviceInfo.service);
        } else {
            displayCartridges();
        }
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Показываем тестовые данные при ошибке
        showTestData(serviceInfo.service);
    }
}

// ТЕСТОВЫЕ ДАННЫЕ ЕСЛИ ОСНОВНАЯ ЗАГРУЗКА НЕ РАБОТАЕТ
function showTestData(serviceType) {
    console.log('Показываем тестовые данные для:', serviceType);
    
    if (serviceType === 'Заправка') {
        cartridgesData = [
            { brand: "xerox", model: "Xerox 106R01159", price: "850 руб", service: "Заправка" },
            { brand: "hp", model: "HP CF400X", price: "1200 руб", service: "Заправка" },
            { brand: "canon", model: "Canon 725", price: "950 руб", service: "Заправка" },
            { brand: "samsung", model: "Samsung MLT-D101S", price: "800 руб", service: "Заправка" },
            { brand: "brother", model: "Brother TN-2312", price: "750 руб", service: "Заправка" }
        ];
    } else if (serviceType === 'Обмен') {
        cartridgesData = [
            { brand: "xerox", model: "Xerox 106R01159", price: "1000 руб", service: "Обмен" },
            { brand: "hp", model: "HP CF400X", price: "1500 руб", service: "Обмен" },
            { brand: "canon", model: "Canon 725", price: "1100 руб", service: "Обмен" }
        ];
    } else {
        cartridgesData = [
            { brand: "test", model: "Тестовый картридж", price: "1000 руб", service: serviceType }
        ];
    }
    
    displayCartridges();
}

// Функции отображения
function displayCartridges(filteredData = cartridgesData) {
    console.log('Отображаем данные:', filteredData); // ДЛЯ ОТЛАДКИ
    
    const table = document.getElementById('refillTable');
    
    if (!table) {
        console.error('Элемент refillTable не найден!');
        return;
    }

    if (filteredData.length === 0) {
        table.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        return;
    }

    const groupedByBrand = {};
    filteredData.forEach(item => {
        if (!groupedByBrand[item.brand]) {
            groupedByBrand[item.brand] = [];
        }
        groupedByBrand[item.brand].push(item);
    });

    let html = '';
    
    Object.keys(groupedByBrand).forEach(brand => {
        const brandName = getBrandName(brand);
        html += `
            <div class="brand-section">
                <h3 class="brand-title">${brandName}</h3>
                <div class="cartridges-list">
        `;
        
        groupedByBrand[brand].forEach(cartridge => {
            html += `
                <div class="cartridge-item">
                    <span class="cartridge-model">${cartridge.model}</span>
                    <span class="cartridge-price">${cartridge.price}</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    table.innerHTML = html;
    console.log('HTML сгенерирован'); // ДЛЯ ОТЛАДКИ
}

function getBrandName(brandKey) {
    const brandNames = {
        'xerox': 'Xerox', 'canon': 'Canon', 'hp': 'HP', 'samsung': 'Samsung',
        'pantum': 'Pantum', 'ricoh': 'Ricoh', 'kyocera': 'Kyocera', 'brother': 'Brother',
        'test': 'Тестовые'
    };
    return brandNames[brandKey] || brandKey;
}

function searchCartridges() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        displayCartridges();
        return;
    }
    
    const filteredData = cartridgesData.filter(item => 
        item.model.toLowerCase().includes(searchTerm) || 
        item.brand.toLowerCase().includes(searchTerm)
    );
    
    displayCartridges(filteredData);
}

// Функции мессенджеров
function openWhatsApp() {
    const serviceInfo = getServiceType();
    const phoneNumber = '79110102301';
    const message = `Здравствуйте! У меня вопрос по поводу ${serviceInfo.message}.`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function openTelegram() {
    const serviceInfo = getServiceType();
    const phoneNumber = '79110102301';
    const message = `Здравствуйте! У меня вопрос по поводу ${serviceInfo.message}.`;
    const url = `https://t.me/+${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Кнопка "Наверх"
function initScrollToTop() {
    const scrollButton = document.getElementById('scrollToTop');
    if (!scrollButton) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollButton.classList.add('show');
        } else {
            scrollButton.classList.remove('show');
        }
    });
    
    scrollButton.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, начинаем загрузку данных...'); // ДЛЯ ОТЛАДКИ
    loadDataFromSheets();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchCartridges);
    } else {
        console.error('Поле поиска не найдено!');
    }
    
    initScrollToTop();
});
