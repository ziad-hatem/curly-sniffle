export function isBot(userAgent?: string | null): boolean {
  if (!userAgent) return false;

  const lowerUA = userAgent.toLowerCase();
  const bots = [
    "whatsapp",
    "facebookexternalhit",
    "twitterbot",
    "telegrambot",
    "discordbot",
    "googlebot",
    "bingbot",
    "slackbot",
    "applebot",
    "pinterest",
    "linkedinbot",
    "skypeuripreview",
    "zoom",
    "teams",
  ];

  return bots.some((bot) => lowerUA.includes(bot));
}
