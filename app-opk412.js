// ===== CT COLLEGE BOT - ОПК-412 =====

// ===== GOOGLE OAUTH CONFIG =====
const GOOGLE_CLIENT_ID = '240722205165-alk21d9dfr5n4j8uujm230e7j3k7e2sd.apps.googleusercontent.com';

// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    USER: 'ct_user_opk412',
    SCHEDULE: 'ct_schedule_opk412',
    HOMEWORK: 'ct_homework_opk412',
    THEME: 'ct_theme'
};

// ===== STATE =====
let isLoggedIn = false;
let userData = null;
let scheduleData = {};
let homeworkData = [];
let googleAccessToken = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeTelegramWebApp();
    loadTheme();
    loadStorageData();
    initGoogleSignIn();
    checkAuth();
    initDateSelector();
    loadScheduleForCurrentDay();
});

// ===== TELEGRAM WEB APP =====
function initializeTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        if (tg.colorScheme === 'dark') {
            setTheme('dark');
        }
    }
}

// ===== THEME =====
function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// ===== STORAGE =====
function loadStorageData() {
    const savedSchedule = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (savedSchedule) {
        scheduleData = JSON.parse(savedSchedule);
    } else {
        scheduleData = getDefaultScheduleData();
        saveScheduleData();
    }
    
    const savedHomework = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
    if (savedHomework) {
        homeworkData = JSON.parse(savedHomework);
    } else {
        homeworkData = getDefaultHomeworkData();
        saveHomeworkData();
    }
}

function saveScheduleData() {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(scheduleData));
}

function saveHomeworkData() {
    localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(homeworkData));
}

function getDefaultScheduleData() {
    return {
        'ОПК-412': [
            [
                { time: '08:30 - 10:05', title: 'Програмування', type: 'Лекція', teacher: 'Іваненко О.П.', room: '301', conference: 'https://meet.google.com/xxx-xxxx-xxx' },
                { time: '10:25 - 12:00', title: 'Бази даних', type: 'Практика', teacher: 'Петренко В.І.', room: '205', conference: '' },
                { time: '12:20 - 13:55', title: 'Англійська мова', type: 'Лекція', teacher: 'Сидоренко Л.М.', room: '412', conference: '' }
            ],
            [
                { time: '08:30 - 10:05', title: 'Веб-технології', type: 'Лекція', teacher: 'Коваленко М.А.', room: '210', conference: 'https://meet.google.com/yyy-yyyy-yyy' },
                { time: '10:25 - 12:00', title: 'Математика', type: 'Практика', teacher: 'Мельник Т.В.', room: '115', conference: '' }
            ],
            [
                { time: '08:30 - 10:05', title: 'Програмування', type: 'Практика', teacher: 'Іваненко О.П.', room: '301', conference: '' },
                { time: '10:25 - 12:00', title: 'Операційні системи', type: 'Лекція', teacher: 'Шевченко Д.С.', room: '305', conference: 'https://meet.google.com/zzz-zzzz-zzz' }
            ],
            [
                { time: '08:30 - 10:05', title: 'Комп\'ютерні мережі', type: 'Лекція', teacher: 'Бондаренко А.В.', room: '408', conference: '' },
                { time: '10:25 - 12:00', title: 'Веб-технології', type: 'Практика', teacher: 'Коваленко М.А.', room: '210', conference: '' }
            ],
            [
                { time: '08:30 - 10:05', title: 'Бази даних', type: 'Практика', teacher: 'Петренко В.І.', room: '205', conference: '' },
                { time: '10:25 - 12:00', title: 'Фізична культура', type: 'Практика', teacher: 'Литвиненко С.О.', room: 'Спортзал', conference: '' }
            ]
        ]
    };
}

function getDefaultHomeworkData() {
    return [
        {
            id: 1,
            subject: 'Програмування',
            title: 'Лабораторна робота №3: Масиви та функції',
            deadline: '2025-11-10T23:59:00',
            status: 'pending'
        },
        {
            id: 2,
            subject: 'Веб-технології',
            title: 'Створити адаптивний сайт',
            deadline: '2025-11-15T23:59:00',
            status: 'pending'
        },
        {
            id: 3,
            subject: 'Бази даних',
            title: 'Практична робота №2: SQL запити',
            deadline: '2025-11-05T23:59:00',
            status: 'overdue'
        },
        {
            id: 4,
            subject: 'Англійська мова',
            title: 'Essay: My Future Career',
            deadline: '2025-10-28T23:59:00',
            status: 'completed',
            score: 95
        }
    ];
}

// ===== GOOGLE SIGN-IN =====
function initGoogleSignIn() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false
        });
        
        google.accounts.id.renderButton(
            document.getElementById('googleSignInBtn'),
            {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: 280
            }
        );
    } else {
        console.error('Google Sign-In SDK not loaded');
        // Fallback для демо
        document.getElementById('googleSignInBtn').innerHTML = `
            <button class="btn btn-primary" onclick="demoLogin()" style="padding: 14px 32px;">
                <svg width="20" height="20" viewBox="0 0 20 20" style="margin-right: 8px;">
                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                </svg>
                Увійти через Google (Demo)
            </button>
        `;
    }
}

function handleGoogleSignIn(response) {
    // Decode JWT token
    const userObject = parseJwt(response.credential);
    
    userData = {
        name: userObject.name,
        email: userObject.email,
        picture: userObject.picture,
        group: 'ОПК-412',
        role: userObject.email.endsWith('@kpi.edu.ua') ? 'admin' : 'student',
        googleId: userObject.sub
    };
    
    googleAccessToken = response.credential;
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    isLoggedIn = true;
    
    updateProfileView();
    loadHomework();
    showNotification('Успішно авторизовано!', 'success');
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return {};
    }
}

// Demo login (fallback)
function demoLogin() {
    userData = {
        name: 'Іван Петренко',
        email: 'ivan.petrenko@kpi.edu.ua',
        picture: null,
        group: 'ОПК-412',
        role: 'admin', // Змініть на 'student' якщо потрібно
        googleId: 'demo123'
    };
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    isLoggedIn = true;
    
    updateProfileView();
    loadHomework();
    showNotification('Демо-авторизація успішна!', 'success');
}

// ===== AUTH =====
function checkAuth() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
        userData = JSON.parse(savedUser);
        isLoggedIn = true;
        updateProfileView();
        loadHomework();
    }
}

function updateProfileView() {
    const loggedIn = document.getElementById('loggedInProfile');
    const login = document.getElementById('loginProfile');
    
    if (isLoggedIn && userData) {
        loggedIn.style.display = 'block';
        login.style.display = 'none';
        
        document.getElementById('profileName').textContent = userData.name;
        document.getElementById('profileEmail').textContent = userData.email;
        
        // Set avatar
        const avatarEl = document.getElementById('userAvatar');
        if (userData.picture) {
            avatarEl.innerHTML = `<img src="${userData.picture}" alt="Avatar">`;
        } else {
            const initials = userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            document.getElementById('avatarInitials').textContent = initials;
        }
        
        // Show admin panel if admin
        if (userData.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
        }
    } else {
        loggedIn.style.display = 'none';
        login.style.display = 'block';
    }
}

function logout() {
    if (confirm('Ви впевнені, що хочете вийти?')) {
        localStorage.removeItem(STORAGE_KEYS.USER);
        isLoggedIn = false;
        userData = null;
        googleAccessToken = null;
        
        // Google Sign Out
        if (typeof google !== 'undefined') {
            google.accounts.id.disableAutoSelect();
        }
        
        document.getElementById('adminPanel').style.display = 'none';
        updateProfileView();
        document.getElementById('homeworkContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔐</div>
                <p>Увійдіть для перегляду завдань</p>
            </div>
        `;
        
        showNotification('Ви вийшли з системи', 'info');
    }
}

function syncClassroom() {
    showNotification('Синхронізація...', 'info');
    // TODO: Implement Google Classroom API sync
    setTimeout(() => {
        loadHomework();
        showNotification('Синхронізація завершена!', 'success');
    }, 1500);
}

// ===== EXCEL PARSER =====
function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Парсимо перший аркуш
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            parseScheduleFromExcel(jsonData);
            
            showNotification('Розклад успішно завантажено!', 'success');
        } catch (error) {
            console.error('Error parsing Excel:', error);
            showNotification('Помилка при читанні файлу', 'error');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function parseScheduleFromExcel(data) {
    // Очікуваний формат Excel:
    // | День тижня | Час | Предмет | Тип | Викладач | Аудиторія | Посилання |
    
    const schedule = [[], [], [], [], []]; // 5 днів тижня
    const dayMap = {
        'понеділок': 0,
        'понедельник': 0,
        'вівторок': 1,
        'вторник': 1,
        'середа': 2,
        'среда': 2,
        'четвер': 3,
        'четверг': 3,
        'п\'ятниця': 4,
        'пятница': 4
    };
    
    // Пропускаємо заголовок (перший рядок)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        if (!row || row.length < 6) continue;
        
        const dayName = row[0]?.toString().toLowerCase().trim();
        const dayIndex = dayMap[dayName];
        
        if (dayIndex === undefined) continue;
        
        const lesson = {
            time: formatTime(row[1]),
            title: row[2] || 'Без назви',
            type: row[3] || 'Лекція',
            teacher: row[4] || 'Не вказано',
            room: row[5]?.toString() || 'Не вказано',
            conference: row[6] || ''
        };
        
        schedule[dayIndex].push(lesson);
    }
    
    // Сортуємо за часом
    schedule.forEach(day => {
        day.sort((a, b) => a.time.localeCompare(b.time));
    });
    
    scheduleData['ОПК-412'] = schedule;
    saveScheduleData();
    loadScheduleForCurrentDay();
}

function formatTime(timeStr) {
    if (!timeStr) return '00:00 - 00:00';
    
    const str = timeStr.toString().trim();
    
    // Якщо вже у форматі "08:30 - 10:05"
    if (str.includes(' - ')) return str;
    
    // Якщо у форматі "08:30-10:05" (без пробілів)
    if (str.includes('-')) {
        const parts = str.split('-');
        return `${parts[0].trim()} - ${parts[1].trim()}`;
    }
    
    // Якщо тільки початковий час
    return `${str} - ${str}`;
}

function viewParsedSchedule() {
    const schedule = scheduleData['ОПК-412'];
    if (!schedule || schedule.every(day => day.length === 0)) {
        showNotification('Розклад порожній', 'info');
        return;
    }
    
    const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця'];
    let message = 'Завантажений розклад:\n\n';
    
    schedule.forEach((day, index) => {
        message += `${days[index]}: ${day.length} пар\n`;
    });
    
    alert(message);
}

function exportSchedule() {
    const schedule = scheduleData['ОПК-412'];
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule-opk412.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Розклад експортовано!', 'success');
}

// ===== DATE SELECTOR =====
function initDateSelector() {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
    const dates = getCurrentWeekDates();
    const container = document.getElementById('dateSelector');
    
    container.innerHTML = '';
    days.forEach((day, index) => {
        const btn = document.createElement('div');
        btn.className = 'date-btn' + (index === 0 ? ' active' : '');
        btn.innerHTML = `
            <div class="day">${day}</div>
            <div class="date">${dates[index]}</div>
        `;
        btn.onclick = function() {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadScheduleForDay(index);
        };
        container.appendChild(btn);
    });
}

function getCurrentWeekDates() {
    const dates = [];
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(formatDate(date));
    }
    
    return dates;
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
}

function loadScheduleForCurrentDay() {
    loadScheduleForDay(0);
}

// ===== SCHEDULE DISPLAY =====
function loadScheduleForDay(dayIndex) {
    const lessons = scheduleData['ОПК-412']?.[dayIndex] || [];
    
    if (lessons.length === 0) {
        document.getElementById('scheduleContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p>Немає занять на цей день</p>
            </div>
        `;
        return;
    }

    let html = '';
    lessons.forEach(lesson => {
        html += `
            <div class="lesson-card">
                <div class="lesson-header">
                    <span class="lesson-time">${lesson.time}</span>
                    <span class="lesson-type">${lesson.type}</span>
                </div>
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-details">
                    <span class="lesson-detail-item">
                        <span class="lesson-detail-icon">👤</span>
                        ${lesson.teacher}
                    </span>
                    <span class="lesson-detail-item">
                        <span class="lesson-detail-icon">🚪</span>
                        ${lesson.room}
                    </span>
                </div>
                ${lesson.conference ? `
                    <div class="conference-link">
                        <a href="${lesson.conference}" class="conference-btn" target="_blank">
                            Приєднатися до конференції
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    });

    document.getElementById('scheduleContent').innerHTML = html;
}

// ===== HOMEWORK =====
function loadHomework() {
    if (!isLoggedIn) {
        document.getElementById('homeworkContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔐</div>
                <p>Увійдіть для перегляду завдань</p>
            </div>
        `;
        return;
    }

    document.getElementById('homeworkContent').innerHTML = '<div class="loading"><div class="spinner"></div><p>Завантаження...</p></div>';

    setTimeout(() => {
        if (homeworkData.length === 0) {
            document.getElementById('homeworkContent').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <p>Немає завдань</p>
                </div>
            `;
            return;
        }

        let html = '';
        homeworkData.forEach(hw => {
            const deadline = new Date(hw.deadline);
            const formattedDeadline = deadline.toLocaleDateString('uk-UA', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="homework-card status-${hw.status}">
                    <div class="homework-header">
                        <div class="homework-subject">${hw.subject}</div>
                        <div class="homework-status status-${hw.status}">
                            ${hw.status === 'pending' ? 'В процесі' : 
                              hw.status === 'completed' ? 'Виконано' : 'Прострочено'}
                        </div>
                    </div>
                    <div class="homework-title">${hw.title}</div>
                    <div class="homework-deadline">
                        ${hw.status === 'completed' ? 'Здано: ' : 'Здати до: '}
                        ${formattedDeadline}
                    </div>
                    <div class="homework-actions">
                        ${hw.status === 'completed' ? `
                            <button class="btn btn-secondary">Переглянути</button>
                            <button class="btn btn-secondary">Оцінка: ${hw.score || 0}</button>
                        ` : `
                            <button class="btn btn-secondary">Матеріали</button>
                            <button class="btn btn-primary">Здати</button>
                        `}
                    </div>
                </div>
            `;
        });

        document.getElementById('homeworkContent').innerHTML = html;
    }, 800);
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    if (tab === 'schedule') {
        document.getElementById('scheduleTab').classList.add('active');
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (tab === 'homework') {
        document.getElementById('homeworkTab').classList.add('active');
        document.querySelectorAll('.nav-item')[1].classList.add('active');
        if (isLoggedIn && document.getElementById('homeworkContent').innerHTML.includes('Завантаження')) {
            loadHomework();
        }
    } else if (tab === 'profile') {
        document.getElementById('profileTab').classList.add('active');
        document.querySelectorAll('.nav-item')[2].classList.add('active');
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}
