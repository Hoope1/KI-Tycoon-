// ==================== GAME STATE ====================
const gameState = {
    date: { year: 1956, month: 1 },
    money: 50000,
    reputation: 0,
    ethics: 0,
    isPaused: false,
    gameSpeed: 1, // 0 = paused, 1 = normal, 2 = fast
    compute: { amount: 1, unit: 'KiloFLOPS' },
    data: { amount: 100, unit: 'KB' },
    labName: 'Dein KI Labor'
};

const resources = {
    monthlyExpenses: {
        salaries: 0,
        compute: 500,
        office: 2000,
        data: 0,
        rnd: 500
    },
    monthlyIncome: {
        products: 0,
        grants: 0,
        consulting: 0
    }
};

const team = [];
const researchProjects = {
    active: [],
    completed: []
};
const products = {
    active: [],
    inDevelopment: []
};
const newsHistory = [];
const stats = {
    papersPublished: 0,
    researchCompleted: 0,
    productsLaunched: 0,
    totalHires: 0,
    totalRevenue: 0
};

// ==================== RESEARCH TREE DATA ====================
const researchTree = {
    'Symbolic AI': {
        color: '#f59e0b',
        levels: [
            { name: 'Logic Systems', year: 1956, duration: 6, cost: 20000 },
            { name: 'Expert Systems', year: 1970, duration: 9, cost: 50000 },
            { name: 'Knowledge Graphs', year: 1980, duration: 12, cost: 100000 }
        ]
    },
    'Machine Learning': {
        color: '#10b981',
        levels: [
            { name: 'Decision Trees', year: 1980, duration: 6, cost: 30000 },
            { name: 'Naive Bayes', year: 1985, duration: 6, cost: 40000 },
            { name: 'Support Vector Machines', year: 1995, duration: 8, cost: 80000 },
            { name: 'Random Forests', year: 2001, duration: 10, cost: 150000 }
        ]
    },
    'Neural Networks': {
        color: '#2563eb',
        levels: [
            { name: 'Perceptron', year: 1958, duration: 6, cost: 25000 },
            { name: 'Multi-Layer Perceptron', year: 1986, duration: 12, cost: 60000 },
            { name: 'Backpropagation', year: 1986, duration: 12, cost: 70000 },
            { name: 'CNNs', year: 1998, duration: 15, cost: 200000 },
            { name: 'RNNs/LSTM', year: 2000, duration: 18, cost: 300000 },
            { name: 'Attention Mechanisms', year: 2014, duration: 20, cost: 500000 },
            { name: 'Transformers', year: 2017, duration: 24, cost: 2000000 },
            { name: 'Large Language Models', year: 2019, duration: 30, cost: 10000000 }
        ]
    },
    'Reinforcement Learning': {
        color: '#7c3aed',
        levels: [
            { name: 'Q-Learning', year: 1989, duration: 8, cost: 50000 },
            { name: 'Policy Gradients', year: 2000, duration: 12, cost: 100000 },
            { name: 'Deep Q-Networks', year: 2013, duration: 18, cost: 500000 },
            { name: 'AlphaGo-style', year: 2016, duration: 24, cost: 5000000 }
        ]
    },
    'Computer Vision': {
        color: '#ec4899',
        levels: [
            { name: 'Edge Detection', year: 1986, duration: 6, cost: 30000 },
            { name: 'Feature Extraction', year: 1999, duration: 10, cost: 80000 },
            { name: 'Object Detection', year: 2005, duration: 15, cost: 200000 },
            { name: 'Image Generation (GANs)', year: 2014, duration: 20, cost: 800000 }
        ]
    },
    'AGI Research': {
        color: '#fbbf24',
        levels: [
            { name: 'Multi-Task Learning', year: 2015, duration: 24, cost: 1000000 },
            { name: 'Transfer Learning', year: 2018, duration: 30, cost: 3000000 },
            { name: 'Meta-Learning', year: 2020, duration: 36, cost: 8000000 },
            { name: 'World Models', year: 2022, duration: 48, cost: 20000000 },
            { name: 'AGI', year: 2025, duration: 60, cost: 100000000 }
        ]
    }
};

const unlockedTech = {};

// Initialize unlocked tech
for (const track in researchTree) {
    unlockedTech[track] = [];
}

// ==================== COMPETITORS ====================
const competitors = [
    { name: 'MIT Lab', reputation: 100, focus: 'Symbolic AI' },
    { name: 'Stanford AI', reputation: 120, focus: 'Neural Networks' },
    { name: 'CMU Robotics', reputation: 80, focus: 'Machine Learning' },
    { name: 'DeepMind', reputation: 500, focus: 'Reinforcement Learning', yearFounded: 2010 },
    { name: 'OpenAI', reputation: 600, focus: 'Neural Networks', yearFounded: 2015 },
    { name: 'Google Brain', reputation: 800, focus: 'Neural Networks', yearFounded: 2011 },
    { name: 'Anthropic', reputation: 400, focus: 'AGI Research', yearFounded: 2021 }
];

// ==================== HELPER FUNCTIONS ====================
function formatMoney(amount) {
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${Math.floor(amount).toLocaleString()}`;
}

function formatDate(date) {
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    return `${months[date.month - 1]} ${date.year}`;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function addNews(message, type = 'normal') {
    newsHistory.unshift({ message, date: {...gameState.date}, type });
    if (newsHistory.length > 50) newsHistory.pop();
    updateNewsFeed();
}

function updateNewsFeed() {
    const feed = document.getElementById('newsFeed');
    feed.innerHTML = newsHistory.slice(0, 10).map(news => 
        `<div class="news-item ${news.type}">
            <strong>${formatDate(news.date)}:</strong> ${news.message}
        </div>`
    ).join('');
}

// ==================== TIME MANAGEMENT ====================
function advanceTime() {
    gameState.date.month++;
    if (gameState.date.month > 12) {
        gameState.date.month = 1;
        gameState.date.year++;
        processYearEnd();
    }
    processMonthlyUpdate();
    updateUI();
}

function processMonthlyUpdate() {
    // Calculate expenses
    const totalExpenses = Object.values(resources.monthlyExpenses).reduce((a, b) => a + b, 0);
    const totalIncome = Object.values(resources.monthlyIncome).reduce((a, b) => a + b, 0);
    
    gameState.money += totalIncome - totalExpenses;
    stats.totalRevenue += totalIncome;
    
    // Update research projects
    updateResearchProgress();
    
    // Update team morale
    updateTeamMorale();
    
    // Check for random events
    checkRandomEvents();
    
    // Competitor actions (every quarter)
    if (gameState.date.month % 3 === 0) {
        processCompetitorActions();
    }
    
    // Check win/lose conditions
    checkGameConditions();
}

function processYearEnd() {
    addNews(`🎆 ${gameState.date.year} beginnt! Dein Labor macht weiter Fortschritte.`, 'positive');
    
    // Adjust compute costs based on era
    if (gameState.date.year >= 2010) {
        resources.monthlyExpenses.compute = Math.max(500, resources.monthlyExpenses.compute * 0.95);
    }
}

function updateResearchProgress() {
    researchProjects.active.forEach(project => {
        project.progress += (100 / project.duration);
        
        if (project.progress >= 100) {
            completeResearch(project);
        }
    });
}

function completeResearch(project) {
    // Remove from active
    researchProjects.active = researchProjects.active.filter(p => p !== project);
    
    // Add to completed
    researchProjects.completed.push(project);
    unlockedTech[project.track].push(project.level);
    
    // Update stats
    stats.researchCompleted++;
    gameState.reputation += 50;
    
    // Notifications
    showToast(`✅ Forschung abgeschlossen: ${project.name}!`, 'success');
    addNews(`🔬 Durchbruch: ${project.name} erfolgreich entwickelt! +50 Reputation`, 'positive');
    
    // Offer to publish paper
    setTimeout(() => offerPaperPublication(project), 1000);
    
    updateUI();
}

function offerPaperPublication(project) {
    const publish = confirm(`Möchtest du ein Paper über "${project.name}" veröffentlichen?\n\nKosten: $10,000\nReputation: +100`);
    if (publish && gameState.money >= 10000) {
        gameState.money -= 10000;
        gameState.reputation += 100;
        stats.papersPublished++;
        showToast('📄 Paper veröffentlicht!', 'success');
        addNews(`📄 Paper über ${project.name} auf Top-Conference akzeptiert! +100 Reputation`, 'positive');
    }
}

function updateTeamMorale() {
    team.forEach(member => {
        // Random morale changes
        const change = (Math.random() - 0.5) * 5;
        member.morale = Math.max(0, Math.min(100, member.morale + change));
        
        // Check for quit
        if (member.morale < 30 && Math.random() < 0.1) {
            handleEmployeeQuit(member);
        }
    });
}

function handleEmployeeQuit(member) {
    const index = team.indexOf(member);
    if (index > -1) {
        team.splice(index, 1);
        showToast(`${member.name} hat gekündigt! 😢`, 'error');
        addNews(`👋 ${member.name} hat das Team verlassen (niedrige Moral).`, 'negative');
        updateFinancials();
    }
}

// ==================== RANDOM EVENTS ====================
function checkRandomEvents() {
    const rand = Math.random();
    
    if (rand < 0.05) { // 5% chance per month
        triggerRandomEvent();
    }
}

function triggerRandomEvent() {
    const events = [
        {
            title: '💡 Durchbruch!',
            description: 'Ein Teammitglied hat eine wichtige Entdeckung gemacht!',
            choices: [
                { text: 'Großartig!', effect: () => { gameState.reputation += 50; } }
            ]
        },
        {
            title: '🎓 Grant-Angebot',
            description: 'Eine Universität bietet dir $50,000 für ein gemeinsames Projekt.',
            choices: [
                { 
                    text: 'Annehmen', 
                    effect: () => { 
                        gameState.money += 50000;
                        showToast('Grant erhalten!', 'success');
                    } 
                },
                { text: 'Ablehnen', effect: () => {} }
            ]
        },
        {
            title: '⚠️ Hardware-Ausfall',
            description: 'Deine Server sind ausgefallen! Reparaturkosten: $20,000',
            choices: [
                { 
                    text: 'Reparieren', 
                    effect: () => { 
                        if (gameState.money >= 20000) {
                            gameState.money -= 20000;
                            showToast('Hardware repariert', 'warning');
                        } else {
                            showToast('Nicht genug Geld!', 'error');
                        }
                    } 
                }
            ]
        },
        {
            title: '🌟 Talentierter Bewerber',
            description: 'Ein hochqualifizierter Forscher möchte für dich arbeiten - für 20% unter Marktpreis!',
            choices: [
                { 
                    text: 'Einstellen', 
                    effect: () => { 
                        hireTalentedEmployee();
                    } 
                },
                { text: 'Ablehnen', effect: () => {} }
            ]
        }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    showEventModal(event);
}

function showEventModal(event) {
    const modal = document.getElementById('eventModal');
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventDescription').textContent = event.description;
    
    const choicesDiv = document.getElementById('eventChoices');
    choicesDiv.innerHTML = event.choices.map((choice, index) => 
        `<button class="choice-btn" onclick="handleEventChoice(${index})">${choice.text}</button>`
    ).join('');
    
    // Store current event
    window.currentEvent = event;
    modal.classList.add('active');
}

function handleEventChoice(index) {
    const event = window.currentEvent;
    event.choices[index].effect();
    document.getElementById('eventModal').classList.remove('active');
    updateUI();
}

// ==================== COMPETITOR ACTIONS ====================
function processCompetitorActions() {
    const activeCompetitors = competitors.filter(c => 
        !c.yearFounded || gameState.date.year >= c.yearFounded
    );
    
    activeCompetitors.forEach(comp => {
        if (Math.random() < 0.3) { // 30% chance to do something
            const action = Math.random();
            if (action < 0.5) {
                // Publish paper
                addNews(`📰 ${comp.name} veröffentlicht bahnbrechendes Paper über ${comp.focus}`, 'important');
            } else {
                // Launch product
                addNews(`💼 ${comp.name} launcht neues ${comp.focus} Produkt`, 'important');
            }
        }
    });
}

// ==================== TEAM MANAGEMENT ====================
function generateEmployee(role, skillLevel) {
    const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Irene', 'Jack'];
    const lastNames = ['Smith', 'Johnson', 'Chen', 'Kumar', 'Garcia', 'Brown', 'Lee', 'Wang', 'Martinez', 'Anderson'];
    
    const salaries = {
        'Researcher': [60000, 150000, 350000],
        'Engineer': [80000, 180000, 400000],
        'Data Scientist': [70000, 140000, 300000]
    };
    
    const tier = skillLevel <= 3 ? 0 : skillLevel <= 7 ? 1 : 2;
    
    return {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        role: role,
        skill: skillLevel,
        salary: salaries[role][tier],
        morale: 70 + Math.random() * 20,
        assignedTo: null,
        experience: 0
    };
}

function hireEmployee(employee) {
    team.push(employee);
    stats.totalHires++;
    updateFinancials();
    showToast(`${employee.name} wurde eingestellt!`, 'success');
    addNews(`👤 ${employee.name} (${employee.role}, Skill ${employee.skill}) tritt dem Team bei!`, 'positive');
    updateUI();
}

function hireTalentedEmployee() {
    const employee = generateEmployee('Researcher', 8 + Math.floor(Math.random() * 3));
    employee.salary *= 0.8; // 20% discount
    hireEmployee(employee);
}

function showHiringModal() {
    const modal = document.getElementById('hiringModal');
    const candidatesList = document.getElementById('candidatesList');
    
    // Generate 5 random candidates
    const candidates = [];
    for (let i = 0; i < 5; i++) {
        const roles = ['Researcher', 'Engineer', 'Data Scientist'];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const skill = 1 + Math.floor(Math.random() * 10);
        candidates.push(generateEmployee(role, skill));
    }
    
    candidatesList.innerHTML = candidates.map((candidate, index) => `
        <div class="team-member">
            <div class="member-header">
                <div class="member-info">
                    <h4>👤 ${candidate.name}</h4>
                    <div class="member-role">${candidate.role}</div>
                    <div class="skill-bar">
                        ${Array(10).fill(0).map((_, i) => 
                            `<span class="skill-dot ${i < candidate.skill ? 'filled' : ''}"></span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            <div class="member-stats">
                <div class="stat-item">Skill: ${candidate.skill}/10</div>
                <div class="stat-item">Gehalt: ${formatMoney(candidate.salary)}/Jahr</div>
            </div>
            <button class="btn-primary" onclick="hireCandidate(${index})">Einstellen</button>
        </div>
    `).join('');
    
    window.currentCandidates = candidates;
    modal.style.display = 'block';
}

function hireCandidate(index) {
    const candidate = window.currentCandidates[index];
    if (gameState.money >= candidate.salary) {
        hireEmployee(candidate);
        document.getElementById('hiringModal').style.display = 'none';
    } else {
        showToast('Nicht genug Geld!', 'error');
    }
}

// ==================== RESEARCH MANAGEMENT ====================
function startResearch(track, level) {
    const tech = researchTree[track].levels[level];
    
    if (!tech) {
        showToast('Ungültiges Research Level', 'error');
        return;
    }
    
    // Check requirements
    if (gameState.date.year < tech.year) {
        showToast(`Nicht verfügbar bis ${tech.year}!`, 'error');
        return;
    }
    
    if (gameState.money < tech.cost) {
        showToast('Nicht genug Geld!', 'error');
        return;
    }
    
    // Check if previous level is unlocked (except for level 0)
    if (level > 0 && !unlockedTech[track].includes(level - 1)) {
        showToast('Vorheriges Level muss erst abgeschlossen werden!', 'error');
        return;
    }
    
    // Deduct cost
    gameState.money -= tech.cost;
    
    // Create project
    const project = {
        track: track,
        level: level,
        name: tech.name,
        duration: tech.duration,
        progress: 0,
        assignedTeam: team.filter(m => m.assignedTo === null).slice(0, 2),
        startDate: {...gameState.date}
    };
    
    // Assign team
    project.assignedTeam.forEach(member => {
        member.assignedTo = project.name;
    });
    
    researchProjects.active.push(project);
    
    showToast(`Forschung gestartet: ${tech.name}`, 'success');
    addNews(`🚀 Neues Forschungsprojekt: ${tech.name}`, 'positive');
    updateUI();
}

// ==================== PRODUCT MANAGEMENT ====================
function createProduct(name, type, basedOnTech) {
    const product = {
        name: name,
        type: type,
        basedOnTech: basedOnTech,
        status: 'development',
        progress: 0,
        duration: 6 + Math.floor(Math.random() * 12),
        revenue: 0
    };
    
    products.inDevelopment.push(product);
    showToast(`Produkt in Entwicklung: ${name}`, 'success');
    updateUI();
}

function updateProductProgress() {
    products.inDevelopment.forEach(product => {
        product.progress += (100 / product.duration);
        
        if (product.progress >= 100) {
            launchProduct(product);
        }
    });
}

function launchProduct(product) {
    products.inDevelopment = products.inDevelopment.filter(p => p !== product);
    product.status = 'active';
    product.revenue = 10000 + Math.floor(Math.random() * 100000);
    products.active.push(product);
    
    resources.monthlyIncome.products += product.revenue;
    stats.productsLaunched++;
    
    showToast(`🚀 Produkt gelauncht: ${product.name}!`, 'success');
    addNews(`💼 ${product.name} ist jetzt live! Monatlicher Umsatz: ${formatMoney(product.revenue)}`, 'positive');
    updateUI();
}

// ==================== FINANCIAL MANAGEMENT ====================
function updateFinancials() {
    // Calculate salaries
    resources.monthlyExpenses.salaries = team.reduce((sum, member) => 
        sum + (member.salary / 12), 0
    );
    
    updateUI();
}

function applyForGrant() {
    const baseAmount = 10000;
    const repMultiplier = 1 + (gameState.reputation / 1000);
    const grantAmount = Math.floor(baseAmount * repMultiplier * (1 + Math.random()));
    
    const success = Math.random() < (0.5 + gameState.reputation / 2000);
    
    if (success) {
        gameState.money += grantAmount;
        gameState.reputation += 10;
        showToast(`Grant gewonnen: ${formatMoney(grantAmount)}!`, 'success');
        addNews(`🎓 Grant in Höhe von ${formatMoney(grantAmount)} erhalten!`, 'positive');
    } else {
        showToast('Grant-Antrag abgelehnt', 'error');
        addNews('Grant-Antrag wurde leider abgelehnt.', 'negative');
    }
    
    updateUI();
}

function seekVCFunding() {
    if (gameState.date.year < 1990) {
        showToast('VC-Funding erst ab 1990 verfügbar!', 'error');
        return;
    }
    
    const baseAmount = 100000;
    const repMultiplier = 1 + (gameState.reputation / 500);
    const vcAmount = Math.floor(baseAmount * repMultiplier * (5 + Math.random() * 10));
    
    const confirm = window.confirm(`VC bietet ${formatMoney(vcAmount)} für 20% Equity.\n\nAnnehmen?`);
    
    if (confirm) {
        gameState.money += vcAmount;
        gameState.reputation += 50;
        showToast(`VC-Funding: ${formatMoney(vcAmount)}!`, 'success');
        addNews(`💰 ${formatMoney(vcAmount)} VC-Funding erhalten (20% Equity abgegeben)`, 'important');
    }
    
    updateUI();
}

function takeLoan() {
    const loanAmount = 100000;
    const confirm = window.confirm(`Kredit von ${formatMoney(loanAmount)} aufnehmen?\n\nZinsen: $10,000/Monat für 12 Monate`);
    
    if (confirm) {
        gameState.money += loanAmount;
        resources.monthlyExpenses.office += 10000; // Temporary increase for loan payment
        showToast('Kredit aufgenommen', 'warning');
        addNews(`🏦 ${formatMoney(loanAmount)} Kredit aufgenommen`, 'important');
    }
    
    updateUI();
}

// ==================== GAME CONDITIONS ====================
function checkGameConditions() {
    // Check for bankruptcy
    if (gameState.money < -50000) {
        gameOver('Bankrott! Dein Labor musste schließen. 💔');
    }
    
    // Check for AGI win
    if (unlockedTech['AGI Research'] && unlockedTech['AGI Research'].includes(4)) {
        gameWin();
    }
    
    // Warning if low on money
    if (gameState.money < 10000 && gameState.money > 0) {
        showToast('⚠️ Warnung: Geld wird knapp!', 'warning');
    }
}

function gameOver(message) {
    gameState.isPaused = true;
    alert(message + '\n\nSpiel vorbei!');
    // Could add proper game over screen here
}

function gameWin() {
    gameState.isPaused = true;
    const score = calculateScore();
    alert(`🎉 GLÜCKWUNSCH! Du hast AGI erreicht!\n\nEndpunktzahl: ${score}\nZeit: ${gameState.date.year - 1956} Jahre\nReputation: ${gameState.reputation}\nEthik: ${gameState.ethics}`);
}

function calculateScore() {
    const timeBonus = (50 - (gameState.date.year - 1956)) * 5000;
    const repBonus = gameState.reputation * 10;
    const ethicsMultiplier = gameState.ethics > 200 ? 1.5 : gameState.ethics > 0 ? 1.0 : 0.5;
    
    return Math.floor((100000 + timeBonus + repBonus) * ethicsMultiplier);
}

// ==================== UI UPDATES ====================
function updateUI() {
    // Update header
    document.getElementById('dateDisplay').textContent = formatDate(gameState.date);
    document.getElementById('moneyDisplay').textContent = formatMoney(gameState.money);
    document.getElementById('reputationDisplay').textContent = gameState.reputation;
    document.getElementById('ethicsDisplay').textContent = gameState.ethics > 0 ? `+${gameState.ethics}` : gameState.ethics;
    
    // Update dashboard
    updateDashboard();
    
    // Update active view
    const activeView = document.querySelector('.view.active');
    if (activeView) {
        const viewId = activeView.id;
        if (viewId === 'researchView') updateResearchView();
        if (viewId === 'teamView') updateTeamView();
        if (viewId === 'financeView') updateFinanceView();
        if (viewId === 'statsView') updateStatsView();
        if (viewId === 'productsView') updateProductsView();
    }
}

function updateDashboard() {
    // Resources
    const totalExpenses = Object.values(resources.monthlyExpenses).reduce((a, b) => a + b, 0);
    const totalIncome = Object.values(resources.monthlyIncome).reduce((a, b) => a + b, 0);
    const runway = gameState.money / (totalExpenses - totalIncome);
    
    document.getElementById('budgetValue').textContent = formatMoney(gameState.money);
    document.getElementById('monthlyBurn').textContent = '-' + formatMoney(totalExpenses);
    document.getElementById('monthlyIncome').textContent = '+' + formatMoney(totalIncome);
    document.getElementById('runway').textContent = runway > 0 ? 
        (runway < 100 ? `${Math.floor(runway)} Monate` : '♾️ Profitabel!') : 
        '♾️ Profitabel!';
    document.getElementById('computeValue').textContent = `${gameState.compute.amount} ${gameState.compute.unit}`;
    document.getElementById('dataValue').textContent = `${gameState.data.amount} ${gameState.data.unit}`;
    
    // Active projects
    const projectsList = document.getElementById('activeProjectsList');
    if (researchProjects.active.length === 0) {
        projectsList.innerHTML = '<p class="empty-state">Keine aktiven Projekte</p>';
    } else {
        projectsList.innerHTML = researchProjects.active.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-title">${project.name}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <div class="project-info">
                    Fortschritt: ${Math.floor(project.progress)}% | 
                    Team: ${project.assignedTeam.length} Personen
                </div>
            </div>
        `).join('');
    }
    
    // Team status
    const teamList = document.getElementById('teamStatusList');
    if (team.length === 0) {
        teamList.innerHTML = '<p class="empty-state">Noch keine Mitarbeiter</p>';
    } else {
        teamList.innerHTML = team.slice(0, 3).map(member => `
            <div class="project-card">
                <div class="project-title">${member.name}</div>
                <div class="project-info">
                    ${member.role} (Skill ${member.skill}) | 
                    Moral: ${Math.floor(member.morale)}%
                </div>
            </div>
        `).join('');
        if (team.length > 3) {
            teamList.innerHTML += `<p style="text-align: center; color: #64748b; margin-top: 0.5rem;">... und ${team.length - 3} weitere</p>`;
        }
    }
    
    // Reputation & Ethics
    document.getElementById('repValue').textContent = gameState.reputation;
    document.getElementById('worldRank').textContent = `#${Math.max(1, 999 - Math.floor(gameState.reputation / 10))}`;
    document.getElementById('ethicsValue').textContent = gameState.ethics;
    document.getElementById('publicPerception').textContent = 
        gameState.ethics > 300 ? 'Sehr positiv' :
        gameState.ethics > 100 ? 'Positiv' :
        gameState.ethics > -100 ? 'Neutral' :
        gameState.ethics > -300 ? 'Negativ' : 'Sehr negativ';
    
    // Products
    const productsList = document.getElementById('productsList');
    if (products.active.length === 0) {
        productsList.innerHTML = '<p class="empty-state">Keine Produkte</p>';
    } else {
        productsList.innerHTML = products.active.map(product => `
            <div class="project-card">
                <div class="project-title">${product.name}</div>
                <div class="project-info">
                    Umsatz: ${formatMoney(product.revenue)}/Monat
                </div>
            </div>
        `).join('');
    }
}

function updateResearchView() {
    const treeDiv = document.getElementById('researchTree');
    
    treeDiv.innerHTML = Object.entries(researchTree).map(([track, data]) => {
        const levels = data.levels.map((level, index) => {
            const isUnlocked = unlockedTech[track].includes(index);
            const isActive = researchProjects.active.some(p => p.track === track && p.level === index);
            const isAvailable = gameState.date.year >= level.year && 
                                (index === 0 || unlockedTech[track].includes(index - 1));
            
            let status = 'locked';
            if (isUnlocked) status = 'completed';
            else if (isActive) status = 'active';
            else if (isAvailable) status = 'available';
            
            return `<span class="level-badge ${status}">${level.name}</span>`;
        }).join('');
        
        return `
            <div class="research-track">
                <div class="track-header">${track}</div>
                <div class="track-levels">${levels}</div>
            </div>
        `;
    }).join('');
    
    // Populate selects
    const trackSelect = document.getElementById('researchTrackSelect');
    trackSelect.innerHTML = Object.keys(researchTree).map(track => 
        `<option value="${track}">${track}</option>`
    ).join('');
    
    updateResearchLevelSelect();
}

function updateResearchLevelSelect() {
    const trackSelect = document.getElementById('researchTrackSelect');
    const levelSelect = document.getElementById('researchLevelSelect');
    const selectedTrack = trackSelect.value;
    
    if (!selectedTrack) return;
    
    const levels = researchTree[selectedTrack].levels;
    levelSelect.innerHTML = levels.map((level, index) => 
        `<option value="${index}">Level ${index + 1}: ${level.name}</option>`
    ).join('');
    
    updateResearchRequirements();
}

function updateResearchRequirements() {
    const trackSelect = document.getElementById('researchTrackSelect');
    const levelSelect = document.getElementById('researchLevelSelect');
    const reqBox = document.getElementById('researchRequirements');
    const estBox = document.getElementById('researchEstimates');
    
    const track = trackSelect.value;
    const level = parseInt(levelSelect.value);
    
    if (!track || isNaN(level)) return;
    
    const tech = researchTree[track].levels[level];
    
    const yearMet = gameState.date.year >= tech.year;
    const moneyMet = gameState.money >= tech.cost;
    const prevMet = level === 0 || unlockedTech[track].includes(level - 1);
    
    reqBox.innerHTML = `
        <div class="requirement-item">
            <span>Jahr verfügbar:</span>
            <span class="${yearMet ? 'requirement-met' : 'requirement-not-met'}">${tech.year} ${yearMet ? '✓' : '✗'}</span>
        </div>
        <div class="requirement-item">
            <span>Kosten:</span>
            <span class="${moneyMet ? 'requirement-met' : 'requirement-not-met'}">${formatMoney(tech.cost)} ${moneyMet ? '✓' : '✗'}</span>
        </div>
        <div class="requirement-item">
            <span>Vorheriges Level:</span>
            <span class="${prevMet ? 'requirement-met' : 'requirement-not-met'}">${prevMet ? 'Abgeschlossen ✓' : 'Nicht abgeschlossen ✗'}</span>
        </div>
    `;
    
    const availableTeam = team.filter(m => !m.assignedTo);
    estBox.innerHTML = `
        <div class="estimate-item">
            <span>Geschätzte Dauer:</span>
            <span>${tech.duration} Monate</span>
        </div>
        <div class="estimate-item">
            <span>Verfügbares Team:</span>
            <span>${availableTeam.length} Personen</span>
        </div>
    `;
    
    const startBtn = document.getElementById('startResearchBtn');
    startBtn.disabled = !yearMet || !moneyMet || !prevMet;
}

function updateTeamView() {
    const teamList = document.getElementById('teamList');
    
    if (team.length === 0) {
        teamList.innerHTML = '<p class="empty-state">Noch keine Mitarbeiter. Klicke "Neues Mitglied einstellen"!</p>';
        return;
    }
    
    teamList.innerHTML = team.map(member => `
        <div class="team-member">
            <div class="member-header">
                <div class="member-info">
                    <h4>👤 ${member.name}</h4>
                    <div class="member-role">${member.role}</div>
                    <div class="skill-bar">
                        ${Array(10).fill(0).map((_, i) => 
                            `<span class="skill-dot ${i < member.skill ? 'filled' : ''}"></span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            <div class="member-stats">
                <div class="stat-item">Skill: ${member.skill}/10</div>
                <div class="stat-item">Gehalt: ${formatMoney(member.salary)}/Jahr</div>
                <div class="stat-item">Moral: ${Math.floor(member.morale)}%</div>
                <div class="stat-item">Status: ${member.assignedTo || 'Verfügbar'}</div>
            </div>
        </div>
    `).join('');
}

function updateFinanceView() {
    const totalExpenses = Object.values(resources.monthlyExpenses).reduce((a, b) => a + b, 0);
    const totalIncome = Object.values(resources.monthlyIncome).reduce((a, b) => a + b, 0);
    const net = totalIncome - totalExpenses;
    const runway = net < 0 ? gameState.money / Math.abs(net) : Infinity;
    
    document.getElementById('financeBalance').textContent = formatMoney(gameState.money);
    document.getElementById('financeBurn').textContent = '-' + formatMoney(totalExpenses);
    document.getElementById('financeRevenue').textContent = '+' + formatMoney(totalIncome);
    document.getElementById('financeNet').textContent = formatMoney(net);
    document.getElementById('financeNet').className = 'value ' + (net >= 0 ? 'positive' : 'negative');
    document.getElementById('financeRunway').textContent = runway === Infinity ? '♾️ Profitabel!' : `${Math.floor(runway)} Monate`;
    
    // Expenses breakdown
    document.getElementById('expenseSalaries').textContent = formatMoney(resources.monthlyExpenses.salaries);
    document.getElementById('expenseCompute').textContent = formatMoney(resources.monthlyExpenses.compute);
    document.getElementById('expenseOffice').textContent = formatMoney(resources.monthlyExpenses.office);
    document.getElementById('expenseData').textContent = formatMoney(resources.monthlyExpenses.data);
    document.getElementById('expenseRnD').textContent = formatMoney(resources.monthlyExpenses.rnd);
    
    // Income breakdown
    document.getElementById('incomeProducts').textContent = formatMoney(resources.monthlyIncome.products);
    document.getElementById('incomeGrants').textContent = formatMoney(resources.monthlyIncome.grants);
    document.getElementById('incomeConsulting').textContent = formatMoney(resources.monthlyIncome.consulting);
}

function updateStatsView() {
    document.getElementById('statPapers').textContent = stats.papersPublished;
    document.getElementById('statResearch').textContent = stats.researchCompleted;
    document.getElementById('statProducts').textContent = stats.productsLaunched;
    document.getElementById('statHires').textContent = stats.totalHires;
    document.getElementById('statRevenue').textContent = formatMoney(stats.totalRevenue);
    
    // Leaderboard
    const leaderboard = document.getElementById('leaderboard');
    const allLabs = [...competitors.filter(c => !c.yearFounded || gameState.date.year >= c.yearFounded), 
                     { name: gameState.labName, reputation: gameState.reputation, isPlayer: true }]
        .sort((a, b) => b.reputation - a.reputation);
    
    leaderboard.innerHTML = allLabs.slice(0, 10).map((lab, index) => `
        <div class="leaderboard-item ${lab.isPlayer ? 'player' : ''}">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span>${lab.name}</span>
            <span>${lab.reputation} Rep</span>
        </div>
    `).join('');
    
    // Timeline
    const timeline = document.getElementById('timeline');
    const recentEvents = newsHistory.slice(0, 10).filter(n => n.type === 'positive' || n.type === 'important');
    timeline.innerHTML = recentEvents.map(event => `
        <div class="timeline-item">
            <div class="timeline-date">${formatDate(event.date)}</div>
            <div class="timeline-event">${event.message}</div>
        </div>
    `).join('');
}

function updateProductsView() {
    const activeList = document.getElementById('activeProductsList');
    const inDevList = document.getElementById('inDevProductsList');
    
    if (products.active.length === 0) {
        activeList.innerHTML = '<p class="empty-state">Keine aktiven Produkte</p>';
    } else {
        activeList.innerHTML = products.active.map(product => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-title">💼 ${product.name}</div>
                </div>
                <div class="project-info">
                    Typ: ${product.type}<br>
                    Monatlicher Umsatz: ${formatMoney(product.revenue)}
                </div>
            </div>
        `).join('');
    }
    
    if (products.inDevelopment.length === 0) {
        inDevList.innerHTML = '<p class="empty-state">Keine Produkte in Entwicklung</p>';
    } else {
        inDevList.innerHTML = products.inDevelopment.map(product => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-title">🔨 ${product.name}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${product.progress}%"></div>
                </div>
                <div class="project-info">
                    Fortschritt: ${Math.floor(product.progress)}%
                </div>
            </div>
        `).join('');
    }
}

// ==================== SAVE/LOAD ====================
function saveGame() {
    const saveData = {
        gameState,
        resources,
        team,
        researchProjects,
        products,
        newsHistory,
        stats,
        unlockedTech
    };
    
    localStorage.setItem('kidevtycoon_save', JSON.stringify(saveData));
    showToast('💾 Spiel gespeichert!', 'success');
}

function loadGame() {
    const saveData = localStorage.getItem('kidevtycoon_save');
    
    if (!saveData) {
        showToast('Kein Spielstand gefunden!', 'error');
        return;
    }
    
    const data = JSON.parse(saveData);
    
    Object.assign(gameState, data.gameState);
    Object.assign(resources, data.resources);
    team.length = 0;
    team.push(...data.team);
    Object.assign(researchProjects, data.researchProjects);
    Object.assign(products, data.products);
    newsHistory.length = 0;
    newsHistory.push(...data.newsHistory);
    Object.assign(stats, data.stats);
    Object.assign(unlockedTech, data.unlockedTech);
    
    showToast('📁 Spiel geladen!', 'success');
    updateUI();
}

function newGame() {
    if (confirm('Neues Spiel starten? Der aktuelle Fortschritt geht verloren!')) {
        location.reload();
    }
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Time controls
    document.getElementById('pauseBtn').addEventListener('click', () => {
        gameState.isPaused = true;
        gameState.gameSpeed = 0;
        document.querySelectorAll('.btn-icon').forEach(b => b.classList.remove('active'));
        document.getElementById('pauseBtn').classList.add('active');
    });
    
    document.getElementById('normalSpeedBtn').addEventListener('click', () => {
        gameState.isPaused = false;
        gameState.gameSpeed = 1;
        document.querySelectorAll('.btn-icon').forEach(b => b.classList.remove('active'));
        document.getElementById('normalSpeedBtn').classList.add('active');
    });
    
    document.getElementById('fastSpeedBtn').addEventListener('click', () => {
        gameState.isPaused = false;
        gameState.gameSpeed = 2;
        document.querySelectorAll('.btn-icon').forEach(b => b.classList.remove('active'));
        document.getElementById('fastSpeedBtn').classList.add('active');
    });
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(view + 'View').classList.add('active');
            
            updateUI();
        });
    });
    
    // Save/Load
    document.getElementById('saveBtn').addEventListener('click', saveGame);
    document.getElementById('loadBtn').addEventListener('click', loadGame);
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    
    // Research
    document.getElementById('researchTrackSelect').addEventListener('change', updateResearchLevelSelect);
    document.getElementById('researchLevelSelect').addEventListener('change', updateResearchRequirements);
    
    document.getElementById('startResearchBtn').addEventListener('click', () => {
        const track = document.getElementById('researchTrackSelect').value;
        const level = parseInt(document.getElementById('researchLevelSelect').value);
        startResearch(track, level);
    });
    
    // Team
    document.getElementById('hireBtn').addEventListener('click', showHiringModal);
    
    // Close modal
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Finance
    document.getElementById('applyGrantBtn').addEventListener('click', applyForGrant);
    document.getElementById('seekVCBtn').addEventListener('click', seekVCFunding);
    document.getElementById('takeLoanBtn').addEventListener('click', takeLoan);
    
    // Products
    document.getElementById('newProductBtn').addEventListener('click', () => {
        const name = prompt('Produktname:');
        if (name) {
            createProduct(name, 'Consumer App', 'Neural Networks');
        }
    });
    
    // Initial setup
    addNews('🎮 Willkommen bei KI Dev Tycoon! Dein Ziel: AGI erreichen!', 'positive');
    addNews('💡 Tipp: Starte mit Forschung in Symbolic AI oder Neural Networks', 'important');
    updateUI();
    
    // Auto-save every 60 seconds
    setInterval(() => {
        if (!gameState.isPaused) {
            saveGame();
        }
    }, 60000);
});

// ==================== GAME LOOP ====================
let lastTick = Date.now();

function gameLoop() {
    const now = Date.now();
    const delta = now - lastTick;
    
    if (!gameState.isPaused) {
        const tickRate = gameState.gameSpeed === 1 ? 1000 : 500; // Fast = 2x speed
        
        if (delta >= tickRate) {
            advanceTime();
            lastTick = now;
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
