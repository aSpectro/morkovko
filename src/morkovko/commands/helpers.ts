import { EmbedBuilder } from 'discord.js';

export function noUserEmbed(user) {
  const embedError = new EmbedBuilder()
    .setColor('#f97a50')
    .setAuthor({
      name: user.username,
      iconURL: user.avatarURL(),
    })
    .setDescription(
      `Похоже, что ты еще не открыл свою ферму! Используй команду ниже.`,
    )
    .addFields({ name: '!начать', value: 'Участвовать в игре', inline: true });
  return embedError;
}

export function setEmbedAuthor(embed, user) {
  embed.setAuthor({
    name: user.username,
    iconURL: user.avatarURL(),
  });
  return embed;
}

export function getRelLevelName(level: number) {
  if (level >= 10 && level < 20) {
    return 'Приятные знакомые';
  } else if (level >= 20 && level < 30) {
    return 'Потенциальные друзья';
  } else if (level >= 30 && level < 40) {
    return 'Развивающаяся дружба';
  } else if (level >= 40 && level < 50) {
    return 'Просто друзья';
  } else if (level >= 50 && level < 60) {
    return 'Близкие друзья';
  } else if (level >= 60 && level < 70) {
    return 'Лучшие друзья';
  } else if (level >= 70 && level < 80) {
    return 'Неразлучные союзники';
  } else if (level >= 90 && level < 100) {
    return 'Крепкая семья';
  } else if (level >= 100 && level < 110) {
    return 'Прекрасные партнеры';
  } else if (level >= 110) {
    return 'Ачбко порву';
  }
  return 'Знакомые';
}

export function getTimeFromMins(mins: number) {
  const hours = Math.trunc(mins / 60);
  const minutes = mins % 60;
  return hours + 'ч. ' + minutes + 'м.';
}

export function calcTime(n, f, t, p) {
  let r = n;
  let count = 0;
  const len = 100 / t;
  const pBonus = p.progressBonus === 1 ? 0 : p.progressBonus;
  const speedBonus =
    p.config.slotSpeedUpdate === 1 ? 0 : p.config.slotSpeedUpdate;
  for (let i = 0; i < len; i++) {
    const factor = f === 0 ? 1 : f;
    let hourProgressFinal = t;
    hourProgressFinal += (hourProgressFinal / 100) * pBonus;
    hourProgressFinal += (hourProgressFinal / 100) * speedBonus;
    hourProgressFinal += (hourProgressFinal / 100) * factor;
    const newProgress = r + hourProgressFinal;
    r = newProgress;
    if (r >= 100 && count == 0) count = i + 1;
  }
  return count;
}

export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function calcPrice(factor, price) {
  return Math.round((factor / 50) * price + price);
}

export function getCarrotLevel(carrotSize) {
  const level = Math.floor(carrotSize / 5);
  return level === 0 ? 1 : level;
}

export function getMaxSlots(carrotLevel) {
  return 5 * carrotLevel;
}

export function getChance() {
  return Math.random() * 100;
}

export function calcProgress(
  slots,
  progressBonus,
  factorSpeed,
  slotSpeedUpdate,
) {
  const pBonus = progressBonus === 1 ? 0 : progressBonus;
  const speedBonus = slotSpeedUpdate === 1 ? 0 : slotSpeedUpdate;
  const factor = factorSpeed === 0 ? 1 : factorSpeed;
  let progress = slots;
  progress += (progress / 100) * pBonus;
  progress += (progress / 100) * speedBonus;
  progress += (progress / 100) * factor;
  return Math.floor(progress);
}

export function calcNumberWithPercentBoost(number, boost) {
  return number - (number / 100) * boost;
}
