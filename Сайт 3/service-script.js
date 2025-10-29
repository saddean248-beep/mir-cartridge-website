// service-script.js - Универсальный скрипт для всех услуг

const SHEET_ID = '1SjNsRu6gIXA8f2CWpm_lQN5RS-m_cmQVJsfrMPUmZF0';

// Определяем тип услуги по URL страницы
function getServiceType() {
    const path = window.location.pathname;
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

// Загрузка данных из Google Sheets через нашу серверную функцию
async function loadDataFromSheets() {
    const serviceInfo = getServiceType();
    
    try {
        // Используем нашу серверную функцию вместо прямого доступа к Google Sheets
        const serviceParam = serviceInfo.service.toLowerCase();
        const response = await fetch(`/.netlify/functions/sheets?service=${serviceParam}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }
        
        const data = await response.json();
        
        cartridgesData = [];
        
        // Обрабатываем данные из нашей API
        data.forEach(item => {
            if (item.brand && item.model && item.price) {
                cartridgesData.push({
                    brand: item.brand.toLowerCase(),
                    model: item.model,
                    price: item.price,
                    service: item.service
                });
            }
        });
        
        console.log(`Данные ${serviceInfo.service.toLowerCase()} загружены:`, cartridgesData.length, 'позиций');
        displayCartridges();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        document.getElementById('refillTable').innerHTML = 
            '<div class="no-results">Ошибка загрузки данных. Попробуйте позже.</div>';
    }
}

// Функции отображения
function displayCartridges(filteredData = cartridgesData) {
    const table = document.getElementById('refillTable');
    
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
                    <span class="cartridge-price">${cartridge.price} руб</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    table.innerHTML = html;
}

function getBrandName(brandKey) {
    const brandNames = {
        'xerox': 'Xerox', 'canon': 'Canon', 'hp': 'HP', 'samsung': 'Samsung',
        'pantum': 'Pantum', 'ricoh': 'Ricoh', 'kyocera': 'Kyocera', 'brother': 'Brother'
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
    loadDataFromSheets();
    document.getElementById('searchInput').addEventListener('input', searchCartridges);
    initScrollToTop();
});