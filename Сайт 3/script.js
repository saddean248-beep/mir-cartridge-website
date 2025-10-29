// === ЗАЩИТА САЙТА ===
// Запрет открытия в iframe (защита от клонирования)
if (window.top !== window.self) {
    window.top.location = window.self.location;
}

// Защита от простых ботов
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    // Блокировка F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
    if (e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
        (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
        (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
    }
});

// Функции для открытия мессенджеров
function openWhatsApp() {
    const phoneNumber = '79110102301';
    const message = 'Здравствуйте! У меня вопрос по поводу картриджей.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function openTelegram() {
    const phoneNumber = '79110102301';
    const message = 'Здравствуйте! У меня вопрос по поводу картриджей.';
    const url = `https://t.me/+${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Плавная прокрутка к якорям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Карусель брендов
function initBrandsCarousel() {
    const track = document.querySelector('.brands-track');
    if (track) {
        const items = track.querySelectorAll('.brand-item');
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
    }
}

// Карусель статей
let currentArticlePosition = 0;

function initArticlesCarousel() {
    currentArticlePosition = 0;
    updateArticleCarouselPosition();
    
    window.addEventListener('resize', function() {
        updateArticleCarouselPosition();
    });
}

function updateArticleCarouselPosition() {
    const track = document.querySelector('.articles-track');
    const cards = document.querySelectorAll('.article-card');
    
    if (!track || cards.length === 0) return;
    
    const cardStyle = getComputedStyle(cards[0]);
    const trackStyle = getComputedStyle(track);
    const cardWidth = cards[0].offsetWidth + parseInt(trackStyle.gap);
    
    track.style.transform = `translateX(-${currentArticlePosition * cardWidth}px)`;
}

function scrollArticles(direction) {
    const cards = document.querySelectorAll('.article-card');
    const track = document.querySelector('.articles-track');
    
    if (!cards.length || !track) return;
    
    // ВСЕГДА прокручиваем на 1 карточку
    currentArticlePosition += direction;
    
    // Ограничиваем позицию (нельзя уйти в минус)
    if (currentArticlePosition < 0) {
        currentArticlePosition = 0;
    }
    
    // Рассчитываем максимальную позицию в зависимости от размера экрана
    let cardsPerView = 3;
    if (window.innerWidth < 1024) cardsPerView = 2;
    if (window.innerWidth < 768) cardsPerView = 1;
    
    // Максимальная позиция = общее кол-во карточек - видимые на экране
    const maxPosition = Math.max(0, cards.length - cardsPerView);
    if (currentArticlePosition > maxPosition) {
        currentArticlePosition = maxPosition;
    }
    
    updateArticleCarouselPosition();
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initBrandsCarousel();
    initArticlesCarousel();
    initScrollToTop();
    initSpecificImageModal(); 
    
    // Обработчики для кнопок карусели статей
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => scrollArticles(-1));
        nextBtn.addEventListener('click', () => scrollArticles(1));
    }
});

// Модальное окно для конкретного изображения
function initSpecificImageModal() {
    const specificImage = document.querySelector('img[src="../Фото/длястатьи5.1.jpg"]');
    
    if (!specificImage) return;
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '10000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.flexDirection = 'column';
    
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '35px';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '40px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.zIndex = '10001';
    closeBtn.className = 'close-modal';
    
    const modalImg = document.createElement('img');
    modalImg.id = 'modalImage';
    modalImg.style.maxWidth = '80%';
    modalImg.style.maxHeight = '80%';
    modalImg.style.width = 'auto';
    modalImg.style.height = 'auto';
    modalImg.style.borderRadius = '10px';
    modalImg.style.transform = 'scale(1.5)'; // Увеличение в 1.5 раза
    modalImg.style.transition = 'transform 0.3s ease';
    
    // Контейнер для изображения с прокруткой если нужно
    const imageContainer = document.createElement('div');
    imageContainer.style.display = 'flex';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.alignItems = 'center';
    imageContainer.style.width = '100%';
    imageContainer.style.height = '100%';
    imageContainer.style.overflow = 'auto';
    imageContainer.style.padding = '20px';
    
    imageContainer.appendChild(modalImg);
    modal.appendChild(closeBtn);
    modal.appendChild(imageContainer);
    document.body.appendChild(modal);

    // Делаем изображение кликабельным
    specificImage.style.cursor = 'zoom-in';
    specificImage.title = 'Нажмите для увеличения';
    
    specificImage.addEventListener('click', function() {
        modal.style.display = 'flex';
        modalImg.src = this.src;
        modalImg.alt = this.alt;
        
        // Сбрасываем трансформацию и потом применяем с анимацией
        modalImg.style.transform = 'scale(1)';
        setTimeout(() => {
            modalImg.style.transform = 'scale(1.5)';
        }, 10);
    });

    // Закрытие модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            modal.style.display = 'none';
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}