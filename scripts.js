let gameLog = document.getElementById('game-log');
let inventoryItems = document.getElementById('inventory-items');
let equipmentItems = document.getElementById('equipment-items');
let currencyDisplay = document.getElementById('currency');
let healthBarFill = document.getElementById('health-bar-fill');
let xpBarFill = document.getElementById('xp-bar-fill');
let xpText = document.getElementById('xp-text');
let actionVisual = document.getElementById('action-visual');

let player = {
    health: 100,
    maxHealth: 100,
    inventory: [],
    equipment: {},
    currency: 100,
    attack: 10,
    defense: 5,
    level: 1,
    experience: 0,
    specialAbilities: ['Power Strike']
};

const items = {
    herb: { name: 'Herbs', type: 'item', value: 5, sellValue: 15 },
    sword: { name: 'Sword', type: 'weapon', value: 50, attack: 10 },
    shield: { name: 'Shield', type: 'armor', value: 30, defense: 5 },
    healthPotion: { name: 'Health Potion', type: 'item', value: 15, heal: 0.75 }
};

const monsters = [
    { name: 'Goblin', health: 30, attack: 5, defense: 2, experience: 10, gold: 10 },
    { name: 'Orc', health: 50, attack: 10, defense: 5, experience: 20, gold: 20 },
    { name: 'Troll', health: 80, attack: 15, defense: 8, experience: 30, gold: 30 },
    { name: 'Dragon', health: 150, attack: 25, defense: 15, experience: 50, gold: 50 }
];

let currentMonster = null;

function updateStats() {
    healthBarFill.style.width = (player.health / player.maxHealth) * 100 + '%';
    xpBarFill.style.width = (player.experience / (player.level * 100)) * 100 + '%';
    xpText.textContent = `${player.experience} / ${player.level * 100} XP`;
    currencyDisplay.textContent = player.currency;
    inventoryItems.textContent = player.inventory.length > 0 ? player.inventory.map(item => item.name).join(', ') : 'None';
    equipmentItems.textContent = Object.keys(player.equipment).length > 0 ? Object.values(player.equipment).map(item => item.name).join(', ') : 'None';
}

function log(message) {
    let p = document.createElement('p');
    p.innerHTML = message;
    gameLog.appendChild(p);
    gameLog.scrollTop = gameLog.scrollHeight;
}

function goToTown() {
    log("You enter the town. You see a market, a blacksmith, and a tavern.");
    log("Type <span class='npc' onclick='buyItem(\"herb\")'>buy herb</span> to purchase herbs for 10 gold.");
    log("Type <span class='npc' onclick='sellItem(\"Herbs\")'>sell herb</span> to sell herbs for 15 gold.");
    log("Type <span class='npc' onclick='buyItem(\"sword\")'>buy sword</span> to purchase a sword for 50 gold.");
    log("Type <span class='npc' onclick='buyItem(\"shield\")'>buy shield</span> to purchase a shield for 30 gold.");
    log("Type <span class='npc' onclick='buyItem(\"healthPotion\")'>buy health potion</span> to purchase a health potion for 15 gold.");
    actionVisual.src = 'images/town.webp';
}

function explore() {
    log("You venture into the wilderness.");
    actionVisual.src = 'images/explore.webp';
    if (Math.random() > 0.5) {
        encounterMonster();
    } else {
        findItem();
    }
}

function enterDungeon() {
    log("You enter a dark dungeon.");
    actionVisual.src = 'images/dungeon.webp';
    encounterMonster();
}

function findItem() {
    let item = items.herb;
    log(`You find some ${item.name}.`);
    player.inventory.push(item);
    updateStats();
}

function encounterMonster() {
    currentMonster = monsters[Math.floor(Math.random() * monsters.length)];
    log(`You encounter a ${currentMonster.name}! Prepare for battle.`);
    actionVisual.src = 'images/fight.webp';
    playerTurn();
}

function playerTurn() {
    log("Your turn. Choose an action: <span class='npc' onclick='attack()'>Attack</span>, <span class='npc' onclick='defend()'>Defend</span>, <span class='npc' onclick='useItem()'>Use Item</span>, <span class='npc' onclick='useSpecial()'>Use Special</span>");
}

function attack() {
    const damage = Math.max(Math.floor(Math.random() * player.attack / 2) + Math.floor(player.attack / 2), 1);
    currentMonster.health -= damage;
    log(`You hit the ${currentMonster.name} for ${damage} damage.`);
    checkCombatOutcome();
}

function defend() {
    const reducedDamage = Math.max(Math.floor(Math.random() * currentMonster.attack / 2) + Math.floor(currentMonster.attack / 2) - player.defense * 2, 0);
    player.health -= reducedDamage;
    log(`You defend against the ${currentMonster.name}'s attack, receiving ${reducedDamage} damage.`);
    checkCombatOutcome();
}

function useItem() {
    const potionIndex = player.inventory.findIndex(item => item.name === 'Health Potion');
    if (potionIndex !== -1) {
        player.health = Math.min(player.maxHealth, player.health + player.maxHealth * items.healthPotion.heal);
        player.inventory.splice(potionIndex, 1);
        log("You use a Health Potion and restore some health.");
        updateStats();
    } else {
        log("You have no Health Potions left.");
    }
    enemyTurn();
}

function useSpecial() {
    if (player.specialAbilities.includes('Power Strike')) {
        const damage = Math.max(Math.floor(Math.random() * player.attack) + player.attack, 1);
        currentMonster.health -= damage;
        log(`You use Power Strike and hit the ${currentMonster.name} for ${damage} damage.`);
        checkCombatOutcome();
    } else {
        log("You have no special abilities to use.");
    }
}

function checkCombatOutcome() {
    if (currentMonster.health <= 0) {
        log(`You defeated the ${currentMonster.name}!`);
        player.experience += currentMonster.experience;
        player.currency += currentMonster.gold;
        actionVisual.src = 'images/idle.webp';
        checkLevelUp();
        updateStats();
    } else if (player.health <= 0) {
        log("You have been defeated...");
        actionVisual.src = 'images/defeated.webp';
    } else {
        enemyTurn();
    }
}

function enemyTurn() {
    const damage = Math.max(Math.floor(Math.random() * currentMonster.attack / 2) + Math.floor(currentMonster.attack / 2), 1);
    player.health -= damage;
    log(`The ${currentMonster.name} hits you for ${damage} damage.`);
    updateStats();
    if (player.health > 0) {
        playerTurn();
    } else {
        log("You have been defeated...");
        actionVisual.src = 'images/defeated.webp';
    }
}

function buyItem(itemName) {
    let item = items[itemName];
    if (player.currency >= item.value) {
        player.currency -= item.value;
        if (item.type === 'item') {
            player.inventory.push(item);
        } else {
            player.equipment[item.type] = item;
            updatePlayerStats();
        }
        log(`You bought ${item.name} for ${item.value} gold.`);
    } else {
        log(`You do not have enough gold to buy ${item.name}.`);
    }
    updateStats();
}

function sellItem(itemName) {
    let itemIndex = player.inventory.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (itemIndex !== -1) {
        let item = player.inventory.splice(itemIndex, 1)[0];
        player.currency += item.sellValue;
        log(`You sold ${item.name} for ${item.sellValue} gold.`);
    } else {
        log(`You do not have any ${itemName} to sell.`);
    }
    updateStats();
}

function updatePlayerStats() {
    player.attack = 10;
    player.defense = 5;
    if (player.equipment.weapon) {
        player.attack += player.equipment.weapon.attack;
    }
    if (player.equipment.armor) {
        player.defense += player.equipment.armor.defense;
    }
}

function checkLevelUp() {
    const experienceNeeded = player.level * 100;
    if (player.experience >= experienceNeeded) {
        player.level++;
        player.experience -= experienceNeeded;
        player.maxHealth += 20;
        player.health = player.maxHealth;
        log(`Congratulations! You leveled up to level ${player.level}.`);
        updateStats();
    }
}

updateStats();
