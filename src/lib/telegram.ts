type TelegramPayload = {
  name: string;
  phone: string;
  productType: string;
  profile: string;
  width: number;
  height: number;
  estimateMin: number;
  estimateMax: number;
  locale: string;
  comment?: string;
};

export async function sendTelegramLeadNotification(payload: TelegramPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { sent: false, reason: "missing_credentials" as const };
  }

  const message = [
    "Новая заявка с калькулятора",
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
    `Тип: ${payload.productType}`,
    `Профиль: ${payload.profile}`,
    `Размер: ${payload.width}x${payload.height} мм`,
    `Оценка: ${payload.estimateMin} - ${payload.estimateMax} грн`,
    `Язык: ${payload.locale}`,
    payload.comment ? `Комментарий: ${payload.comment}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: "telegram_error" as const };
  }

  return { sent: true as const };
}
