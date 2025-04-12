// Основной объект игры
const game = {
    // Состояние игры
    state: {
        day: 1,
        money: 1000000,
        crypto: 0,
        reputation: {
            investors: 50,
            government: 60,
            public: 40
        },
        technologies: {
            software: 3,
            hardware: 2,
            biotech: 1
        },
        staff: [],
        researchProgress: {
            software: 0,
            hardware: 0,
            biotech: 0
        },
        marketDemand: {
            software: 100,
            hardware: 80,
            biotech: 60
        },
        competitors: [],
        loans: [],
        hasOffshore: false,
        hasIPO: false,
        specialTech: {
            quantumComputers: false,
            neuroInterfaces: false,
            agi: false
        },
        events: []
    },

    // Инициализация игры
    init() {
        this.loadGame();
        this.setupEventListeners();
        this.generateCompetitors();
        this.updateUI();
        this.setupCharts();
        
        // Первое событие
        this.addEvent("Добро пожаловать в IT Бизнесмены!", "Вы начинаете свою технологическую империю с $1,000,000. Ваша цель - стать лидером технологической индустрии!");
    },

    // Настройка обработчиков событий
    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.querySelectorAll('.nav-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                document.getElementById(btn.dataset.section).classList.add('active');
            });
        });

        // Вкладки исследований
        document.querySelectorAll('.research-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.research-tab').forEach(t => {
                    t.classList.remove('active');
                });
                tab.classList.add('active');
                this.renderTechTree(tab.dataset.tech);
            });
        });

        // Кнопки действий
        document.getElementById('next-day')?.addEventListener('click', () => this.nextDay());
        document.getElementById('save-game')?.addEventListener('click', () => this.saveGame());
        document.getElementById('load-game')?.addEventListener('click', () => this.loadGame());
        document.getElementById('hire-btn')?.addEventListener('click', () => this.showModal('hire-modal'));
        document.getElementById('bank-loan')?.addEventListener('click', () => this.takeLoan('bank'));
        document.getElementById('crime-loan')?.addEventListener('click', () => this.takeLoan('crime'));
        document.getElementById('ipo-btn')?.addEventListener('click', () => this.launchIPO());
        document.getElementById('offshore-btn')?.addEventListener('click', () => this.openOffshore());

        // Модальные окна
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });

        document.querySelectorAll('.hire-option .hire-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const role = e.target.closest('.hire-option').dataset.role;
                this.hireStaff(role);
                document.getElementById('hire-modal').style.display = 'none';
            });
        });

        document.getElementById('event-ok')?.addEventListener('click', () => {
            document.getElementById('event-modal').style.display = 'none';
        });

        // Закрытие модальных окон при клике вне их
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    },

    // Показать модальное окно
    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'block';
        }
    },

    // Следующий день
    nextDay() {
        this.state.day++;
        
        // Зарплаты сотрудников
        this.paySalaries();
        
        // Прогресс исследований
        this.makeResearchProgress();
        
        // Доходы от технологий
        this.calculateIncome();
        
        // Случайные события
        this.randomEvents();
        
        // Обновление рынка
        this.updateMarket();
        
        // Проверка кредитов
        this.checkLoans();
        
        // Проверка концовок
        this.checkEndings();
        
        this.updateUI();
    },

    // Платить зарплаты
    paySalaries() {
        if (!this.state.staff || !Array.isArray(this.state.staff)) {
            this.state.staff = [];
            return;
        }
        
        let totalSalary = 0;
        this.state.staff.forEach(employee => {
            totalSalary += employee.salary || 0;
        });
        
        this.state.money = (this.state.money || 0) - totalSalary;
        
        if (totalSalary > 0) {
            this.addEvent(`Выплачены зарплаты`, `-$${totalSalary.toLocaleString()}`);
        }
    },

    // Прогресс исследований
    makeResearchProgress() {
        if (!this.state.researchProgress) {
            this.state.researchProgress = {
                software: 0,
                hardware: 0,
                biotech: 0
            };
        }
        
        const researchAreas = ['software', 'hardware', 'biotech'];
        
        researchAreas.forEach(area => {
            if (this.state.researchProgress[area] > 0) {
                // Базовый прогресс
                let progress = 10;
                
                // Бонус от инженеров
                const engineers = this.state.staff?.filter(e => e.role === 'engineer').length || 0;
                progress += engineers * 2;
                
                // Бонус от ученых (шанс удвоить прогресс)
                const scientists = this.state.staff?.filter(e => e.role === 'scientist').length || 0;
                if (scientists > 0 && Math.random() < 0.1 * scientists) {
                    progress *= 2;
                    this.addEvent("Прорыв в исследованиях!", `Прогресс в ${this.getTechName(area)} удвоен благодаря вашим ученым!`);
                }
                
                // Бонус от квантовых компьютеров
                if (this.state.specialTech?.quantumComputers && area === 'software') {
                    progress *= 1.3;
                }
                
                this.state.researchProgress[area] += progress;
                
                // Проверка на завершение исследования
                if (this.state.researchProgress[area] >= 100) {
                    if (!this.state.technologies) {
                        this.state.technologies = {
                            software: 0,
                            hardware: 0,
                            biotech: 0
                        };
                    }
                    this.state.technologies[area] = (this.state.technologies[area] || 0) + 1;
                    this.state.researchProgress[area] = 0;
                    
                    // Проверка на спецтехнологии
                    this.checkSpecialTech(area);
                    
                    this.addEvent("Новый уровень технологии!", `Достигнут уровень ${this.state.technologies[area]} в ${this.getTechName(area)}`);
                }
            }
        });
    },

    // Проверка спецтехнологий
    checkSpecialTech(area) {
        if (!this.state.technologies || !this.state.specialTech) return;
        
        const level = this.state.technologies[area] || 0;
        
        if (area === 'software') {
            if (level === 10 && !this.state.specialTech.quantumComputers) {
                this.state.specialTech.quantumComputers = true;
                this.addEvent("Квантовые компьютеры!", "Ваши исследователи разработали квантовые компьютеры! Все исследования ускоряются на 30%.");
            } else if (level === 15 && !this.state.specialTech.agi) {
                this.state.specialTech.agi = true;
                this.addEvent("ИИ общего назначения!", "Вы создали первый в мире ИИ общего назначения! Это революция в технологиях!");
            }
        } else if (area === 'biotech' && level === 12 && !this.state.specialTech.neuroInterfaces) {
            this.state.specialTech.neuroInterfaces = true;
            this.addEvent("Нейроинтерфейсы!", "Ваша команда разработала работающие нейроинтерфейсы! Эффективность персонала увеличивается на 50%.");
        }
    },

    // Расчет доходов
    calculateIncome() {
        if (!this.state.technologies || !this.state.marketDemand) return;
        
        let income = 0;
        
        // Доход от технологий
        income += (this.state.technologies.software || 0) * 5000;
        income += (this.state.technologies.hardware || 0) * 4000;
        income += (this.state.technologies.biotech || 0) * 6000;
        
        // Модификаторы спроса
        income *= (this.state.marketDemand.software || 100) / 100;
        
        // Бонус от менеджеров
        const managers = this.state.staff?.filter(e => e.role === 'manager').length || 0;
        income *= 1 + (managers * 0.2);
        
        // Бонус от нейроинтерфейсов
        if (this.state.specialTech?.neuroInterfaces) {
            income *= 1.5;
        }
        
        this.state.money = (this.state.money || 0) + income;
        
        if (income > 0) {
            this.addEvent("Доходы компании", `+$${Math.round(income).toLocaleString()} от продаж технологий`);
        }
    },

    // Случайные события
    randomEvents() {
        // Шанс события каждый день - 20%
        if (Math.random() < 0.2) {
            const events = [
                {
                    title: "Кибератака!",
                    text: "Ваши системы подверглись кибератаке. Хакеры украли часть данных.",
                    effect: () => {
                        const hackers = this.state.staff?.filter(e => e.role === 'hacker').length || 0;
                        if (hackers > 0) {
                            this.addEvent("Хакеры защитили вас!", "Ваши хакеры успешно отразили атаку!");
                        } else {
                            const loss = Math.min(50000, (this.state.money || 0) * 0.1);
                            this.state.money -= loss;
                            this.state.reputation.investors = (this.state.reputation.investors || 50) - 10;
                            this.state.reputation.public = (this.state.reputation.public || 40) - 5;
                            this.addEvent("Потери от кибератаки", `-$${loss.toLocaleString()} и урон репутации`);
                        }
                    }
                },
                {
                    title: "Государственная проверка",
                    text: "Государственные органы проводят проверку вашей компании.",
                    effect: () => {
                        const lobbyists = this.state.staff?.filter(e => e.role === 'lobbyist').length || 0;
                        if (lobbyists > 0) {
                            this.addEvent("Лоббисты помогли!", "Ваши лоббисты снизили штрафы от проверки на 30%");
                            this.state.money -= 10000 * (1 - 0.3 * lobbyists);
                        } else {
                            const fine = 20000;
                            this.state.money -= fine;
                            this.addEvent("Штраф", `-$${fine.toLocaleString()} за нарушения`);
                        }
                    }
                },
                {
                    title: "Технологический прорыв",
                    text: "Ваши ученые сделали неожиданное открытие!",
                    effect: () => {
                        const scientists = this.state.staff?.filter(e => e.role === 'scientist').length || 0;
                        if (scientists > 0) {
                            const techAreas = ['software', 'hardware', 'biotech'];
                            const randomTech = techAreas[Math.floor(Math.random() * techAreas.length)];
                            this.state.researchProgress[randomTech] = (this.state.researchProgress[randomTech] || 0) + 50;
                            this.addEvent("Неожиданное открытие!", `+50% прогресса в ${this.getTechName(randomTech)}`);
                        }
                    }
                },
                {
                    title: "Кризис на рынке",
                    text: "Рынок переживает временный спад.",
                    effect: () => {
                        this.state.marketDemand.software = (this.state.marketDemand.software || 100) * 0.8;
                        this.state.marketDemand.hardware = (this.state.marketDemand.hardware || 80) * 0.8;
                        this.state.marketDemand.biotech = (this.state.marketDemand.biotech || 60) * 0.8;
                        this.addEvent("Спад на рынке", "Спрос на все технологии упал на 20%");
                    }
                },
                {
                    title: "Мода на технологии",
                    text: "Новый тренд увеличил спрос на определенные технологии.",
                    effect: () => {
                        const tech = Math.random() > 0.66 ? 'biotech' : (Math.random() > 0.5 ? 'hardware' : 'software');
                        this.state.marketDemand[tech] = (this.state.marketDemand[tech] || 100) * 1.5;
                        this.addEvent("Новый тренд", `Спрос на ${this.getTechName(tech)} вырос на 50%!`);
                    }
                }
            ];
            
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            this.showEventModal(randomEvent.title, randomEvent.text);
            randomEvent.effect();
        }
        
        // Каждые 30 дней - налоги
        if (this.state.day % 30 === 0) {
            this.payTaxes();
        }
        
        // Каждые 60 дней - изменение моды
        if (this.state.day % 60 === 0) {
            this.changeMarketTrend();
        }
    },

    // Показать событие в модальном окне
    showEventModal(title, text) {
        const titleEl = document.getElementById('event-title');
        const textEl = document.getElementById('event-text');
        const modal = document.getElementById('event-modal');
        
        if (titleEl && textEl && modal) {
            titleEl.textContent = title;
            textEl.textContent = text;
            modal.style.display = 'block';
        }
    },

    // Уплата налогов
    payTaxes() {
        let taxRate = 0.1;
        
        // Бонус от лоббистов
        const lobbyists = this.state.staff?.filter(e => e.role === 'lobbyist').length || 0;
        taxRate *= 1 - (0.25 * lobbyists);
        
        // Бонус от офшора
        if (this.state.hasOffshore) {
            taxRate *= 0.5;
        }
        
        const tax = Math.floor((this.state.money || 0) * taxRate);
        this.state.money -= tax;
        
        this.addEvent("Уплата налогов", `-$${tax.toLocaleString()} (ставка ${Math.round(taxRate * 100)}%)`);
    },

    // Изменение рыночных трендов
    changeMarketTrend() {
        if (!this.state.marketDemand) {
            this.state.marketDemand = {
                software: 100,
                hardware: 80,
                biotech: 60
            };
        }
        
        // Сброс всех модификаторов
        this.state.marketDemand.software = 100;
        this.state.marketDemand.hardware = 100;
        this.state.marketDemand.biotech = 100;
        
        // Новый тренд
        const trend = Math.random() > 0.66 ? 'biotech' : (Math.random() > 0.5 ? 'hardware' : 'software');
        this.state.marketDemand[trend] = 200;
        
        this.addEvent("Новый рыночный тренд", `Отрасль ${this.getTechName(trend)} теперь в тренде!`);
    },

    // Обновление рынка
    updateMarket() {
        if (!this.state.marketDemand) {
            this.state.marketDemand = {
                software: 100,
                hardware: 80,
                biotech: 60
            };
            return;
        }
        
        // Небольшие случайные колебания
        const fluctuate = (value) => {
            return value * (0.95 + Math.random() * 0.1);
        };
        
        this.state.marketDemand.software = Math.max(50, Math.min(200, fluctuate(this.state.marketDemand.software || 100)));
        this.state.marketDemand.hardware = Math.max(50, Math.min(200, fluctuate(this.state.marketDemand.hardware || 80)));
        this.state.marketDemand.biotech = Math.max(50, Math.min(200, fluctuate(this.state.marketDemand.biotech || 60)));
    },

    // Проверка кредитов
    checkLoans() {
        if (!this.state.loans || !Array.isArray(this.state.loans)) {
            this.state.loans = [];
            return;
        }
        
        this.state.loans.forEach(loan => {
            if (this.state.day % 30 === 0) { // Ежемесячные платежи
                const payment = (loan.amount || 0) * (loan.rate || 0) / 12;
                this.state.money -= payment;
                
                this.addEvent(`Платеж по кредиту`, `-$${payment.toLocaleString()}`);
                
                if (loan.type === 'crime' && Math.random() < 0.1) {
                    this.addEvent("Проблемы с криминальным кредитом", "Криминальные структуры требуют дополнительных выплат!");
                    this.state.money -= payment * 2;
                }
            }
        });
    },

    // Проверка концовок
    checkEndings() {
        // Галактическая Империя
        if ((this.state.technologies?.hardware || 0) >= 10 && 
            (this.state.technologies?.biotech || 0) >= 12 && 
            (this.state.money || 0) >= 1000000000) {
            this.showEnding("Галактическая Империя", "Вы достигли космической экспансии и основали колонию на Марсе! Теперь ваша империя простирается за пределы Земли.", "Бесконечный режим 'Космос' разблокирован!");
            return;
        }
        
        // Нобелевская премия
        if (this.state.specialTech?.quantumComputers && 
            this.state.specialTech?.neuroInterfaces && 
            this.state.specialTech?.agi) {
            this.showEnding("Нобелевская премия", "Ваши прорывные технологии изменили мир! Вы получили Нобелевскую премию.", "Персональный музей в игре разблокирован!");
            return;
        }
        
        // Тюремный срок
        const violations = (this.state.loans?.filter(l => l.type === 'crime').length || 0) +
                         (this.state.hasOffshore ? 1 : 0);
        if (violations >= 5) {
            this.showEnding("Тюремный срок", "Ваши незаконные действия были раскрыты. Вы получили 10 лет тюрьмы.", "Игра начинается заново с -$10M");
            this.resetGame(-10000000);
            return;
        }
        
        // ИИ-бунт
        if (this.state.specialTech?.agi && (this.state.reputation?.public || 40) < 30) {
            this.showEnding("ИИ-бунт", "Созданный вами ИИ общего назначения восстал против человечества!", "Катастрофа с анимацией");
            return;
        }
        
        // Золотой парашют
        if ((this.state.money || 0) >= 2000000000) {
            this.showEnding("Золотой парашют", "Вы продали свою компанию за $2 миллиарда и ушли на покой!", "Финал с кастомным дизайном яхты");
            return;
        }
    },

    // Показать концовку
    showEnding(title, text, effect) {
        this.showEventModal(title, `${text}\n\n${effect}`);
    },

    // Сброс игры (для некоторых концовок)
    resetGame(initialMoney = 1000000) {
        this.state = {
            day: 1,
            money: initialMoney,
            crypto: 0,
            reputation: {
                investors: 50,
                government: 60,
                public: 40
            },
            technologies: {
                software: 3,
                hardware: 2,
                biotech: 1
            },
            staff: [],
            researchProgress: {
                software: 0,
                hardware: 0,
                biotech: 0
            },
            marketDemand: {
                software: 100,
                hardware: 80,
                biotech: 60
            },
            competitors: [],
            loans: [],
            hasOffshore: false,
            hasIPO: false,
            specialTech: {
                quantumComputers: false,
                neuroInterfaces: false,
                agi: false
            },
            events: []
        };
        
        this.generateCompetitors();
        this.addEvent("Новая игра", initialMoney < 0 ? 
            "Вы начинаете с долгом, но с опытом прошлых ошибок." : 
            "Вы начинаете новую технологическую империю!");
    },

    // Добавить событие в лог
    addEvent(title, text) {
        if (!this.state.events || !Array.isArray(this.state.events)) {
            this.state.events = [];
        }
        
        this.state.events.unshift({
            day: this.state.day || 1,
            title: title || "Событие",
            text: text || ""
        });
        
        // Ограничить количество событий
        if (this.state.events.length > 50) {
            this.state.events.pop();
        }
    },

    // Генерация конкурентов
    generateCompetitors() {
        const competitorTypes = [
            { name: "Стартап", aggression: 8, techSteal: 0.3 },
            { name: "Корпорация", aggression: 5, lobbying: 0.4 },
            { name: "Госструктура", aggression: 3, nationalization: 0.1 },
            { name: "Криминал", aggression: 7, extortion: 0.5 },
            { name: "ИИ-компания", aggression: 6, unpredictability: 0.7 }
        ];
        
        this.state.competitors = [];
        
        for (let i = 0; i < 5; i++) {
            const type = competitorTypes[i];
            this.state.competitors.push({
                id: i + 1,
                name: `${type.name} ${this.generateCompanyName()}`,
                type: type.name.toLowerCase(),
                aggression: type.aggression,
                techLevel: Math.floor(Math.random() * 5) + 1,
                ...type
            });
        }
    },

    // Генерация названия компании
    generateCompanyName() {
        const prefixes = ["Квант", "Нейро", "Техно", "Био", "Кибер", "Нано"];
        const suffixes = ["Лабс", "Тех", "Корп", "Инк", "Системс", "Груп"];
        
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    },

    // Генерация имени сотрудника
    generateStaffName() {
        const firstNames = ["Алекс", "Макс", "Джеймс", "Джон", "Роберт", "Майкл", "Уильям", "Дэвид", "Ричард", "Джозеф"];
        const lastNames = ["Смит", "Джонсон", "Уильямс", "Браун", "Джонс", "Миллер", "Дэвис", "Гарсия", "Родригес", "Уилсон"];
        
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    },

    // Нанять сотрудника
    hireStaff(role) {
        const roles = {
            engineer: { name: "Инженер", salary: 500, bonus: "+10% к исследованиям" },
            manager: { name: "Менеджер", salary: 1000, bonus: "+20% к доходам" },
            scientist: { name: "Ученый", salary: 2000, bonus: "Прорывные технологии" },
            hacker: { name: "Хакер", salary: 3000, bonus: "Защита от атак" },
            lobbyist: { name: "Лоббист", salary: 5000, bonus: "-25% налоги" }
        };
        
        if (!this.state.staff || !Array.isArray(this.state.staff)) {
            this.state.staff = [];
        }
        
        const roleInfo = roles[role];
        if (!roleInfo) return;
        
        if ((this.state.money || 0) >= roleInfo.salary) {
            this.state.staff.push({
                id: Date.now(),
                role,
                name: this.generateStaffName(),
                salary: roleInfo.salary
            });
            
            this.state.money -= roleInfo.salary;
            this.addEvent("Новый сотрудник", `Вы наняли ${roleInfo.name} - ${roleInfo.bonus}`);
        } else {
            this.addEvent("Недостаточно средств", `Для найма ${roleInfo.name} нужно $${roleInfo.salary} в день`);
        }
    },

    // Взять кредит
    takeLoan(type) {
        const loanTypes = {
            bank: { amount: 1000000, rate: 0.15, text: "Банковский кредит" },
            crime: { amount: 500000, rate: 0.5, text: "Криминальный кредит" }
        };
        
        const loan = loanTypes[type];
        if (!loan) return;
        
        if (!this.state.loans || !Array.isArray(this.state.loans)) {
            this.state.loans = [];
        }
        
        this.state.money += loan.amount;
        this.state.loans.push({
            type,
            amount: loan.amount,
            rate: loan.rate,
            dayTaken: this.state.day
        });
        
        this.addEvent(loan.text, `+$${loan.amount.toLocaleString()} под ${loan.rate * 100}% годовых`);
    },

    // Провести IPO
    launchIPO() {
        if ((this.state.technologies?.software || 0) >= 10 && (this.state.money || 0) >= 5000000) {
            this.state.hasIPO = true;
            this.state.money += 5000000;
            this.state.reputation.investors = (this.state.reputation?.investors || 50) + 30;
            
            this.addEvent("Успешное IPO!", "Ваша компания вышла на биржу! +$5,000,000 и +30 к репутации у инвесторов");
        } else {
            this.addEvent("Нельзя провести IPO", "Для IPO нужен 10 уровень софта и $5,000,000");
        }
    },

    // Открыть офшор
    openOffshore() {
        if (!this.state.hasOffshore && (this.state.money || 0) >= 1000000) {
            this.state.hasOffshore = true;
            this.state.money -= 1000000;
            this.state.reputation.government = (this.state.reputation?.government || 60) - 20;
            
            this.addEvent("Офшор открыт", "Теперь вы можете уклоняться от налогов, но репутация у государства упала");
        } else if (this.state.hasOffshore) {
            this.addEvent("Офшор уже открыт", "У вас уже есть офшорная компания");
        } else {
            this.addEvent("Недостаточно средств", "Для открытия офшора нужно $1,000,000");
        }
    },

    // Настройка графиков
    setupCharts() {
        const ctx = document.getElementById('demand-chart')?.getContext('2d');
        if (!ctx) return;
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Софт', 'Железо', 'Биотех'],
                datasets: [{
                    label: 'Спрос на технологии',
                    data: [
                        this.state.marketDemand?.software || 100,
                        this.state.marketDemand?.hardware || 80,
                        this.state.marketDemand?.biotech || 60
                    ],
                    backgroundColor: [
                        'rgba(79, 195, 247, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(79, 195, 247, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 200
                    }
                }
            }
        });
    },

    // Обновление графика
    updateChart() {
        if (!this.chart || !this.state.marketDemand) return;
        
        this.chart.data.datasets[0].data = [
            this.state.marketDemand.software || 100,
            this.state.marketDemand.hardware || 80,
            this.state.marketDemand.biotech || 60
        ];
        this.chart.update();
    },

    // Получить название технологии
    getTechName(tech) {
        const names = {
            software: "Софт",
            hardware: "Железо",
            biotech: "Биотех"
        };
        return names[tech] || tech;
    },

    // Рендер дерева технологий
    renderTechTree(techArea) {
        const treeContainer = document.querySelector('.tech-tree');
        if (!treeContainer) return;
        
        treeContainer.innerHTML = '';
        
        if (!this.state.technologies) {
            this.state.technologies = {
                software: 0,
                hardware: 0,
                biotech: 0
            };
        }
        
        if (!this.state.researchProgress) {
            this.state.researchProgress = {
                software: 0,
                hardware: 0,
                biotech: 0
            };
        }
        
        for (let level = 1; level <= 20; level++) {
            const techNode = document.createElement('div');
            techNode.className = 'tech-node';
            
            if (level <= (this.state.technologies[techArea] || 0)) {
                techNode.classList.add('unlocked');
                
                if ((techArea === 'software' && (level === 10 || level === 15)) || 
                    (techArea === 'biotech' && level === 12)) {
                    techNode.classList.add('special');
                }
            } else if (level === (this.state.technologies[techArea] || 0) + 1 && 
                      (this.state.researchProgress[techArea] || 0) > 0) {
                techNode.textContent = `Исследуется... ${this.state.researchProgress[techArea]}%`;
            } else {
                techNode.classList.add('locked');
            }
            
            techNode.textContent = techNode.textContent || `Уровень ${level}`;
            
            if (level === (this.state.technologies[techArea] || 0) + 1 && 
                !techNode.textContent.includes('Исследуется')) {
                const researchBtn = document.createElement('button');
                researchBtn.textContent = 'Исследовать';
                researchBtn.className = 'action-btn';
                researchBtn.addEventListener('click', () => {
                    this.startResearch(techArea);
                    this.renderTechTree(techArea);
                });
                techNode.appendChild(researchBtn);
            }
            
            treeContainer.appendChild(techNode);
        }
    },

    // Начать исследование
    startResearch(techArea) {
        if (!this.state.researchProgress) {
            this.state.researchProgress = {
                software: 0,
                hardware: 0,
                biotech: 0
            };
        }
        
        if ((this.state.researchProgress[techArea] || 0) === 0) {
            this.state.researchProgress[techArea] = 1;
            this.addEvent("Начато исследование", `Начат новый проект в области ${this.getTechName(techArea)}`);
        }
    },

    // Рендер персонала
    renderStaff() {
        const staffList = document.getElementById('staff-list');
        if (!staffList) return;
        
        staffList.innerHTML = '';
        
        const filter = document.getElementById('staff-filter')?.value || 'all';
        
        if (!this.state.staff || !Array.isArray(this.state.staff)) {
            this.state.staff = [];
            return;
        }
        
        const roles = {
            engineer: "Инженер",
            manager: "Менеджер",
            scientist: "Ученый",
            hacker: "Хакер",
            lobbyist: "Лоббист"
        };
        
        this.state.staff.forEach(employee => {
            if (filter === 'all' || employee.role === filter) {
                const staffCard = document.createElement('div');
                staffCard.className = 'staff-card';
                
                staffCard.innerHTML = `
                    <h3>${employee.name || 'Безымянный'}</h3>
                    <p>Должность: ${roles[employee.role] || employee.role}</p>
                    <p>Зарплата: $${employee.salary || 0}/день</p>
                `;
                
                staffList.appendChild(staffCard);
            }
        });
    },

    // Рендер конкурентов
    renderCompetitors() {
        const competitorsList = document.getElementById('competitors-list');
        if (!competitorsList) return;
        
        competitorsList.innerHTML = '';
        
        if (!this.state.competitors || !Array.isArray(this.state.competitors)) {
            this.state.competitors = [];
            return;
        }
        
        this.state.competitors.forEach(competitor => {
            const competitorEl = document.createElement('div');
            competitorEl.className = 'competitor';
            
            competitorEl.innerHTML = `
                <h4>${competitor.name || 'Конкурент'}</h4>
                <p>Тип: ${competitor.type || 'неизвестен'}</p>
                <p>Уровень технологий: ${competitor.techLevel || 1}</p>
                <p>Агрессия: ${competitor.aggression || 5}/10</p>
            `;
            
            competitorsList.appendChild(competitorEl);
        });
    },

    // Обновление интерфейса
    updateUI() {
        if (!this.state) {
            this.state = this.getDefaultState();
        }
        
        // Основные показатели
        if (document.getElementById('money')) {
            document.getElementById('money').textContent = `$${(this.state.money || 0).toLocaleString()}`;
        }
        if (document.getElementById('crypto')) {
            document.getElementById('crypto').textContent = `${(this.state.crypto || 0).toLocaleString()} BTC`;
        }
        if (document.getElementById('day')) {
            document.getElementById('day').textContent = this.state.day || 1;
        }
        
        // Репутация
        if (this.state.reputation) {
            if (document.getElementById('investors-rep')) {
                document.getElementById('investors-rep').value = this.state.reputation.investors || 50;
            }
            if (document.getElementById('government-rep')) {
                document.getElementById('government-rep').value = this.state.reputation.government || 60;
            }
            if (document.getElementById('public-rep')) {
                document.getElementById('public-rep').value = this.state.reputation.public || 40;
            }
        }
        
        // Технологии
        if (this.state.technologies) {
            if (document.getElementById('software-tech')) {
                document.getElementById('software-tech').value = this.state.technologies.software || 0;
            }
            if (document.getElementById('hardware-tech')) {
                document.getElementById('hardware-tech').value = this.state.technologies.hardware || 0;
            }
            if (document.getElementById('biotech-tech')) {
                document.getElementById('biotech-tech').value = this.state.technologies.biotech || 0;
            }
        }
        
        // События
        const eventsLog = document.getElementById('events-log');
        if (eventsLog) {
            eventsLog.innerHTML = '';
            
            if (this.state.events && Array.isArray(this.state.events)) {
                this.state.events.forEach(event => {
                    const eventEl = document.createElement('div');
                    eventEl.className = 'event';
                    eventEl.innerHTML = `<strong>День ${event.day || 1}: ${event.title || 'Событие'}</strong><br>${event.text || ''}`;
                    eventsLog.appendChild(eventEl);
                });
            }
        }
        
        // Дерево технологий (если открыто)
        if (document.querySelector('.research-tab.active')) {
            const activeTech = document.querySelector('.research-tab.active').dataset.tech;
            this.renderTechTree(activeTech);
        }
        
        // Персонал
        this.renderStaff();
        
        // Конкуренты
        this.renderCompetitors();
        
        // График
        if (this.chart) {
            this.updateChart();
        }
        
        // Кнопка IPO
        if (document.getElementById('ipo-btn')) {
            document.getElementById('ipo-btn').disabled = !((this.state.technologies?.software || 0) >= 10 && (this.state.money || 0) >= 5000000);
        }
    },

    // Сохранение игры
    saveGame() {
        try {
            localStorage.setItem('techTycoonSave', JSON.stringify(this.state));
            this.addEvent("Игра сохранена", "Ваш прогресс был сохранен в локальном хранилище.");
        } catch (e) {
            this.addEvent("Ошибка сохранения", "Не удалось сохранить игру: " + e.message);
        }
    },

    // Загрузка игры
    loadGame() {
        try {
            const savedGame = localStorage.getItem('techTycoonSave');
            if (savedGame) {
                this.state = JSON.parse(savedGame);
                this.addEvent("Игра загружена", "Ваш прогресс был восстановлен из сохранения.");
            }
        } catch (e) {
            this.addEvent("Ошибка загрузки", "Не удалось загрузить игру: " + e.message);
            this.state = this.getDefaultState();
        }
    },

    // Получить состояние по умолчанию
    getDefaultState() {
        return {
            day: 1,
            money: 1000000,
            crypto: 0,
            reputation: {
                investors: 50,
                government: 60,
                public: 40
            },
            technologies: {
                software: 3,
                hardware: 2,
                biotech: 1
            },
            staff: [],
            researchProgress: {
                software: 0,
                hardware: 0,
                biotech: 0
            },
            marketDemand: {
                software: 100,
                hardware: 80,
                biotech: 60
            },
            competitors: [],
            loans: [],
            hasOffshore: false,
            hasIPO: false,
            specialTech: {
                quantumComputers: false,
                neuroInterfaces: false,
                agi: false
            },
            events: []
        };
    }
};

// Инициализация игры при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});