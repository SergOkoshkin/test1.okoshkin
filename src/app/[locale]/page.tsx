import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingAnimator } from "@/components/landing-animator";
import { LandingGalleryPreview } from "@/components/landing-gallery-preview";
import { HeroServicePanel } from "@/components/hero-service-panel";
import { ReviewForm } from "@/components/review-form";
import { ReviewsShowcase } from "@/components/reviews-showcase";
import { Locale, isLocale } from "@/lib/i18n";
import { hasValidDatabaseUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

type SolutionCard = {
  title: string;
  description: string;
  points: string[];
  tone: string;
};

type ComfortCard = {
  title: string;
  description: string;
  source: string;
};

type StepCard = {
  title: string;
  description: string;
};

type FaqCard = {
  question: string;
  answer: string;
};

type LandingCopy = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimary: string;
  heroSecondary: string;
  heroHighlights: string[];
  heroStats: { value: string; label: string }[];
  showcaseTitle: string;
  showcaseBody: string;
  showcaseItems: string[];
  solutionsKicker: string;
  solutionsTitle: string;
  solutionsBody: string;
  solutions: SolutionCard[];
  comfortKicker: string;
  comfortTitle: string;
  comfortBody: string;
  comfortCards: ComfortCard[];
  processTitle: string;
  processBody: string;
  processSteps: StepCard[];
  calculatorTitle: string;
  calculatorBody: string;
  calculatorPoints: string[];
  calculatorCta: string;
  galleryKicker: string;
  galleryTitle: string;
  galleryBody: string;
  galleryViewAll: string;
  galleryOpen: string;
  reviewsKicker: string;
  reviewsTitle: string;
  reviewsBody: string;
  reviewsEmpty: string;
  reviewsLeadTitle: string;
  reviewsLeadBody: string;
  contactsKicker: string;
  contactsTitle: string;
  contactsBody: string;
  coverageTitle: string;
  coverage: string[];
  contactCardTitle: string;
  contactCardBody: string;
  officeHours: string;
  primaryCall: string;
  secondaryCall: string;
  openMap: string;
  faqKicker: string;
  faqTitle: string;
  faqBody: string;
  faqItems: FaqCard[];
  sourceNote: string;
};

const OFFICE_LAT = 46.853518;
const OFFICE_LNG = 30.07053;
const OFFICE_BBOX = "30.0585%2C46.8465%2C30.0825%2C46.8605";
const PHONE_PRIMARY = "+38 (050) 549 61 32";
const PHONE_SECONDARY = "+38 (067) 896 54 00";
const PHONE_PRIMARY_LINK = "+380505496132";
const PHONE_SECONDARY_LINK = "+380678965400";
const TELEGRAM_LINK = "https://t.me/+380505496132";
const VIBER_LINK = "viber://chat?number=%2B380505496132";

const LANDING_COPY: Record<Locale, LandingCopy> = {
  ru: {
    heroBadge: "Раздельная • район • Одесская область",
    heroTitle: "Тёплые окна, двери и солнцезащита, которые выглядят современно и работают каждый день.",
    heroSubtitle:
      "Подбираем пластиковые окна, дверные системы, роллеты и жалюзи под дом, квартиру, офис или объект. Сохраняем понятный маршрут: замер, комплектация, предварительный расчёт, монтаж и поддержка после установки.",
    heroPrimary: "Открыть калькулятор",
    heroSecondary: "Смотреть работы",
    heroHighlights: [
      "ПВХ-окна и двери",
      "Роллеты на окна и входные группы",
      "Жалюзи и контроль дневного света",
      "Подбор решения под фасад и интерьер",
    ],
    heroStats: [
      { value: "Раздельная", label: "офис и очная консультация" },
      { value: "Район + область", label: "выезд на объект по заявке" },
      { value: "09:00–13:00", label: "время работы офиса" },
    ],
    showcaseTitle: "Что входит в проект",
    showcaseBody:
      "Помогаем не просто заказать изделие, а собрать рабочую комплектацию: профиль, стеклопакет, фурнитуру, солнцезащиту и монтаж под конкретный сценарий помещения.",
    showcaseItems: [
      "подбор профиля и стеклопакета по теплу и свету",
      "согласование цвета, формата открывания и фурнитуры",
      "монтаж с ориентацией на аккуратный фасад и интерьер",
    ],
    solutionsKicker: "Основные направления",
    solutionsTitle: "Четыре продуктовые зоны, чтобы клиенту было понятно, с чем можно прийти.",
    solutionsBody:
      "Главная страница теперь объясняет не только что вы продаёте, но и зачем это нужно человеку: от тепла и тишины до приватности и солнцезащиты.",
    solutions: [
      {
        title: "Пластиковые окна",
        description:
          "Решения для квартиры, частного дома и офиса: от базовой комплектации до более тёплых систем с акцентом на герметичность и комфорт у окна.",
        points: ["Профиль и стеклопакет", "Фурнитура и микропроветривание", "Аккуратный монтаж"],
        tone: "from-[#fdfefe] via-[#edf5f0] to-[#dbe8de]",
      },
      {
        title: "Дверные системы",
        description:
          "Входные и межкомнатные решения для объекта, где важны стабильная геометрия, внешний вид и понятная эксплуатация каждый день.",
        points: ["Входные блоки", "Межкомнатные решения", "Подбор под фасад и интерьер"],
        tone: "from-[#fffdf9] via-[#f4ede4] to-[#e7ddd1]",
      },
      {
        title: "Роллеты",
        description:
          "Подходят для приватности, защиты проёмов, управления солнцем и более собранного фасада на окнах и дверях.",
        points: ["Приватность", "Солнцезащита", "Защита проёмов"],
        tone: "from-[#fbfcfd] via-[#e9eff3] to-[#d8e2e9]",
      },
      {
        title: "Жалюзи и солнцезащита",
        description:
          "Для жилых и рабочих помещений, где важно убрать блики, тонко управлять светом и сохранить лёгкость интерьера.",
        points: ["Контроль света", "Комфорт в течение дня", "Чистая геометрия интерьера"],
        tone: "from-[#fdfcf8] via-[#f4f1e8] to-[#e9e2d2]",
      },
    ],
    comfortKicker: "Технологии комфорта",
    comfortTitle: "На тепло, тишину и ощущение качества влияют не слова в рекламе, а конкретные элементы комплектации.",
    comfortBody:
      "Контент этого блока собран по открытым материалам производителей профильных систем, стекла, роллет и солнцезащиты. Поэтому акцент сделан на практических вещах, которые реально ощущаются в помещении.",
    comfortCards: [
      {
        title: "Low-E стекло и энергосбережение",
        description:
          "Низкоэмиссионное покрытие применяют, когда нужно уменьшить теплопотери зимой и снизить риск перегрева помещения в солнечный период.",
        source: "Энергоэффективное стекло",
      },
      {
        title: "Многокамерный профиль и уплотнение",
        description:
          "Более продуманная геометрия профиля и несколько контуров уплотнения помогают повысить герметичность, стабильность и общий комфорт рядом с окном.",
        source: "Профильная система",
      },
      {
        title: "Роллеты как дополнительный слой защиты",
        description:
          "Роллетные системы используют не только ради внешнего вида: они помогают с приватностью, контролем света и дополнительной защитой проёмов.",
        source: "Роллетные системы",
      },
      {
        title: "Жалюзи и управление дневным светом",
        description:
          "Сценарии с жалюзи удобны там, где важно снизить блики, отстроить мягкость света и сохранить рабочий или домашний комфорт в течение дня.",
        source: "Солнцезащита и свет",
      },
    ],
    processTitle: "Маршрут заказа без перегруза",
    processBody:
      "Мы не перегружаем клиента техническими деталями на старте: сначала помогаем понять задачу, затем считаем ориентир и только после этого углубляемся в конфигурацию.",
    processSteps: [
      {
        title: "1. Заявка или звонок",
        description: "Получаем вводные по объекту, бюджету, срокам и типу изделия.",
      },
      {
        title: "2. Предварительный ориентир",
        description: "Через калькулятор или консультацию даём направление по цене и комплектации.",
      },
      {
        title: "3. Замер и уточнение",
        description: "Проверяем размеры, особенности проёма, сценарий открывания и монтажные детали.",
      },
      {
        title: "4. Изготовление и монтаж",
        description: "Согласовываем поставку, установку и финальную сдачу результата клиенту.",
      },
    ],
    calculatorTitle: "Нужен ориентир по бюджету до выезда на объект?",
    calculatorBody:
      "Калькулятор оставляем как рабочую точку входа: клиент указывает тип изделия и размеры, а дальше вы связываетесь и докручиваете конфигурацию уже предметно.",
    calculatorPoints: [
      "для окон, дверей, роллет и жалюзи",
      "подходит для первого контакта и оценки возможностей",
      "после заявки можно продолжить общение в Telegram или Viber",
    ],
    calculatorCta: "Перейти к расчёту",
    galleryKicker: "Портфолио",
    galleryTitle: "Главная теперь показывает свежие работы, а не просто пустую сетку.",
    galleryBody:
      "Последние фотографии работают как доказательство результата: клиент видит объекты, стиль исполнения и может открыть полную галерею с дополнительными материалами.",
    galleryViewAll: "Открыть полную галерею",
    galleryOpen: "Открыть",
    reviewsKicker: "Отзывы",
    reviewsTitle: "Показываем только подтверждённые отзывы после модерации.",
    reviewsBody:
      "Блок отзывов оформлен как живая лента: тексты можно прокручивать, а клиентам оставлена отдельная форма для нового отзыва и фото готовой работы.",
    reviewsEmpty: "Отзывов пока нет. Оставьте первый отклик после установки.",
    reviewsLeadTitle: "После монтажа можно добавить текст, оценку и фото результата.",
    reviewsLeadBody:
      "Это помогает следующему клиенту увидеть реальный объект, а вам — показать качество работы без лишней рекламы.",
    contactsKicker: "Контакты и география",
    contactsTitle: "Офис в Раздельной, выезд по району и проектам в Одесской области.",
    contactsBody:
      "Сайт теперь усиливает локальную привязку: указываем точку на карте, рабочее время офиса и отдельно подчёркиваем, что заявки принимаются по городу, району и области.",
    coverageTitle: "Где можно заказать замер и консультацию",
    coverage: ["г. Раздельная", "Раздельнянский район", "Одесская область"],
    contactCardTitle: "Связаться напрямую",
    contactCardBody:
      "Можно позвонить, написать в мессенджер или открыть точку офиса на карте. Основной номер оставили как главную точку входа для Telegram и Viber.",
    officeHours: "Офис: 09:00–13:00",
    primaryCall: "Основной номер",
    secondaryCall: "Дополнительный номер",
    openMap: "Открыть точку на карте",
    faqKicker: "Частые вопросы",
    faqTitle: "На главной появились ответы на типовые вопросы до замера.",
    faqBody:
      "Это добавляет полезный SEO-контент и снимает часть повторяющихся вопросов ещё до звонка или сообщения.",
    faqItems: [
      {
        question: "Что сильнее всего влияет на стоимость окна?",
        answer:
          "Обычно стоимость меняется из-за размеров, типа профиля, стеклопакета, фурнитуры, цвета, ламинации и сложности самого монтажа.",
      },
      {
        question: "Можно ли заказать только роллеты или только жалюзи?",
        answer:
          "Да. Сайт теперь явно показывает отдельные направления, поэтому клиенту не нужно догадываться, что вы работаете не только с окнами.",
      },
      {
        question: "Калькулятор показывает точную цену?",
        answer:
          "Нет, это предварительный ориентир. Финальная сумма уточняется после замера, конфигурации и согласования монтажа.",
      },
      {
        question: "Работаете только по Раздельной?",
        answer:
          "Основной фокус — Раздельная, Раздельнянский район и объекты по Одесской области. Это уже вынесено в контент и блок контактов.",
      },
    ],
    sourceNote:
      "Технологические тезисы страницы ориентированы на открытые материалы по энергоэффективному стеклу, ПВХ-профилям, роллетным системам и солнцезащите.",
  },
  uk: {
    heroBadge: "Роздільна • район • Одеська область",
    heroTitle: "Теплі вікна, двері та сонцезахист, які виглядають сучасно і працюють щодня.",
    heroSubtitle:
      "Підбираємо пластикові вікна, дверні системи, ролети та жалюзі під будинок, квартиру, офіс або об'єкт. Залишаємо зрозумілий маршрут: замір, комплектація, попередній розрахунок, монтаж і підтримка після встановлення.",
    heroPrimary: "Відкрити калькулятор",
    heroSecondary: "Дивитися роботи",
    heroHighlights: [
      "ПВХ-вікна та двері",
      "Ролети на вікна і вхідні групи",
      "Жалюзі та контроль денного світла",
      "Підбір рішення під фасад і інтер'єр",
    ],
    heroStats: [
      { value: "Роздільна", label: "офіс і очна консультація" },
      { value: "Район + область", label: "виїзд на об'єкт за заявкою" },
      { value: "09:00–13:00", label: "час роботи офісу" },
    ],
    showcaseTitle: "Що входить у проєкт",
    showcaseBody:
      "Допомагаємо не просто замовити виріб, а зібрати робочу комплектацію: профіль, склопакет, фурнітуру, сонцезахист і монтаж під конкретний сценарій приміщення.",
    showcaseItems: [
      "підбір профілю та склопакета по теплу і світлу",
      "узгодження кольору, формату відкривання та фурнітури",
      "монтаж з орієнтацією на акуратний фасад і інтер'єр",
    ],
    solutionsKicker: "Основні напрямки",
    solutionsTitle: "Чотири продуктові зони, щоб клієнту було зрозуміло, з чим саме можна звернутися.",
    solutionsBody:
      "Головна сторінка тепер пояснює не тільки що ви продаєте, а й навіщо це людині: від тепла і тиші до приватності та сонцезахисту.",
    solutions: [
      {
        title: "Пластикові вікна",
        description:
          "Рішення для квартири, приватного будинку та офісу: від базової комплектації до тепліших систем з акцентом на герметичність і комфорт біля вікна.",
        points: ["Профіль і склопакет", "Фурнітура та мікропровітрювання", "Акуратний монтаж"],
        tone: "from-[#fdfefe] via-[#edf5f0] to-[#dbe8de]",
      },
      {
        title: "Дверні системи",
        description:
          "Вхідні та міжкімнатні рішення для об'єкта, де важливі стабільна геометрія, зовнішній вигляд і щоденна зручність користування.",
        points: ["Вхідні блоки", "Міжкімнатні рішення", "Підбір під фасад та інтер'єр"],
        tone: "from-[#fffdf9] via-[#f4ede4] to-[#e7ddd1]",
      },
      {
        title: "Ролети",
        description:
          "Підходять для приватності, захисту прорізів, керування сонцем і більш зібраного фасаду на вікнах та дверях.",
        points: ["Приватність", "Сонцезахист", "Захист прорізів"],
        tone: "from-[#fbfcfd] via-[#e9eff3] to-[#d8e2e9]",
      },
      {
        title: "Жалюзі та сонцезахист",
        description:
          "Для житлових і робочих приміщень, де важливо прибрати відблиски, тонко керувати світлом і зберегти легкість інтер'єру.",
        points: ["Контроль світла", "Комфорт протягом дня", "Чиста геометрія інтер'єру"],
        tone: "from-[#fdfcf8] via-[#f4f1e8] to-[#e9e2d2]",
      },
    ],
    comfortKicker: "Технології комфорту",
    comfortTitle: "На тепло, тишу і відчуття якості впливають не слова в рекламі, а конкретні елементи комплектації.",
    comfortBody:
      "Контент цього блоку зібраний за відкритими матеріалами виробників профільних систем, скла, ролет і сонцезахисту. Тому акцент зроблено на практичних речах, які реально відчуваються в приміщенні.",
    comfortCards: [
      {
        title: "Low-E скло та енергозбереження",
        description:
          "Низькоемісійне покриття застосовують тоді, коли потрібно зменшити тепловтрати взимку і знизити ризик перегріву приміщення у сонячний період.",
        source: "Енергоефективне скло",
      },
      {
        title: "Багатокамерний профіль та ущільнення",
        description:
          "Більш продумана геометрія профілю і кілька контурів ущільнення допомагають підвищити герметичність, стабільність і загальний комфорт біля вікна.",
        source: "Профільна система",
      },
      {
        title: "Ролети як додатковий шар захисту",
        description:
          "Ролетні системи використовують не тільки заради зовнішнього вигляду: вони допомагають із приватністю, контролем світла і додатковим захистом прорізів.",
        source: "Ролетні системи",
      },
      {
        title: "Жалюзі та керування денним світлом",
        description:
          "Сценарії з жалюзі зручні там, де важливо зменшити відблиски, відрегулювати м'якість світла і зберегти робочий або домашній комфорт протягом дня.",
        source: "Сонцезахист і світло",
      },
    ],
    processTitle: "Маршрут замовлення без перевантаження",
    processBody:
      "Ми не перевантажуємо клієнта технічними деталями на старті: спочатку допомагаємо зрозуміти задачу, далі рахуємо орієнтир і тільки після цього заглиблюємося в конфігурацію.",
    processSteps: [
      {
        title: "1. Заявка або дзвінок",
        description: "Отримуємо ввідні по об'єкту, бюджету, строках і типу виробу.",
      },
      {
        title: "2. Попередній орієнтир",
        description: "Через калькулятор або консультацію даємо напрямок по ціні та комплектації.",
      },
      {
        title: "3. Замір і уточнення",
        description: "Перевіряємо розміри, особливості прорізу, сценарій відкривання і монтажні деталі.",
      },
      {
        title: "4. Виготовлення і монтаж",
        description: "Узгоджуємо поставку, установку і фінальну передачу результату клієнту.",
      },
    ],
    calculatorTitle: "Потрібен орієнтир по бюджету до виїзду на об'єкт?",
    calculatorBody:
      "Калькулятор залишаємо як робочу точку входу: клієнт задає тип виробу і розміри, а далі ви зв'язуєтесь і докручуєте конфігурацію вже предметно.",
    calculatorPoints: [
      "для вікон, дверей, ролет і жалюзі",
      "підходить для першого контакту й оцінки можливостей",
      "після заявки можна продовжити спілкування в Telegram або Viber",
    ],
    calculatorCta: "Перейти до розрахунку",
    galleryKicker: "Портфоліо",
    galleryTitle: "Головна тепер показує свіжі роботи, а не просто порожню сітку.",
    galleryBody:
      "Останні фотографії працюють як доказ результату: клієнт бачить об'єкти, стиль виконання і може відкрити повну галерею з додатковими матеріалами.",
    galleryViewAll: "Відкрити повну галерею",
    galleryOpen: "Відкрити",
    reviewsKicker: "Відгуки",
    reviewsTitle: "Показуємо лише підтверджені відгуки після модерації.",
    reviewsBody:
      "Блок відгуків оформлений як жива стрічка: тексти можна прокручувати, а клієнтам залишена окрема форма для нового відгуку і фото готової роботи.",
    reviewsEmpty: "Відгуків поки немає. Залиште перший відгук після встановлення.",
    reviewsLeadTitle: "Після монтажу можна додати текст, оцінку і фото результату.",
    reviewsLeadBody:
      "Це допомагає наступному клієнту побачити реальний об'єкт, а вам — показати якість роботи без зайвої реклами.",
    contactsKicker: "Контакти та географія",
    contactsTitle: "Офіс у Роздільній, виїзд по району і проєктах в Одеській області.",
    contactsBody:
      "Сайт тепер посилює локальну прив'язку: вказуємо точку на карті, робочий час офісу і окремо підкреслюємо, що заявки приймаються по місту, району та області.",
    coverageTitle: "Де можна замовити замір і консультацію",
    coverage: ["м. Роздільна", "Роздільнянський район", "Одеська область"],
    contactCardTitle: "Зв'язатися напряму",
    contactCardBody:
      "Можна зателефонувати, написати в месенджер або відкрити точку офісу на карті. Основний номер залишили як головну точку входу для Telegram і Viber.",
    officeHours: "Офіс: 09:00–13:00",
    primaryCall: "Основний номер",
    secondaryCall: "Додатковий номер",
    openMap: "Відкрити точку на карті",
    faqKicker: "Часті питання",
    faqTitle: "На головній з'явилися відповіді на типові питання до заміру.",
    faqBody:
      "Це додає корисний SEO-контент і знімає частину повторюваних питань ще до дзвінка або повідомлення.",
    faqItems: [
      {
        question: "Що найбільше впливає на вартість вікна?",
        answer:
          "Зазвичай вартість змінюється через розміри, тип профілю, склопакет, фурнітуру, колір, ламінацію і складність самого монтажу.",
      },
      {
        question: "Чи можна замовити тільки ролети або тільки жалюзі?",
        answer:
          "Так. Сайт тепер прямо показує окремі напрямки, тому клієнту не потрібно здогадуватися, що ви працюєте не лише з вікнами.",
      },
      {
        question: "Калькулятор показує точну ціну?",
        answer:
          "Ні, це попередній орієнтир. Фінальна сума уточнюється після заміру, конфігурації та погодження монтажу.",
      },
      {
        question: "Працюєте тільки по Роздільній?",
        answer:
          "Основний фокус — Роздільна, Роздільнянський район і об'єкти по Одеській області. Це вже винесено в контент і блок контактів.",
      },
    ],
    sourceNote:
      "Технологічні тези сторінки орієнтовані на відкриті матеріали з енергоефективного скла, ПВХ-профілів, ролетних систем і сонцезахисту.",
  },
};

async function getLandingData() {
  if (!hasValidDatabaseUrl()) {
    return {
      gallery: [],
      reviews: [],
    };
  }

  const [gallery, reviews] = await Promise.all([
    prisma.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
      },
    }),
    prisma.comment.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        body: true,
        rating: true,
        photoUrl: true,
      },
    }),
  ]);

  return { gallery, reviews };
}

function canRenderReviewPhoto(photoUrl: string | null) {
  if (!photoUrl) return false;
  if (!photoUrl.startsWith("http")) return false;
  return true;
}

function resolveReviewPhotoUrl(photoUrl: string | null) {
  if (!canRenderReviewPhoto(photoUrl)) {
    return null;
  }

  if (!photoUrl!.includes(".r2.cloudflarestorage.com")) {
    return photoUrl;
  }

  const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (!publicBase || publicBase.includes(".r2.cloudflarestorage.com")) {
    return null;
  }

  try {
    const url = new URL(photoUrl!);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return null;
    const key = segments.slice(1).join("/");
    return `${publicBase}/${key}`;
  } catch {
    return null;
  }
}

function WindowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M12 4v16M4 12h16" />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3h10a1 1 0 0 1 1 1v16H6V4a1 1 0 0 1 1-1Z" />
      <path d="M10 11h.01" />
    </svg>
  );
}

function RollerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16" />
      <path d="M6 7v10M10 7v10M14 7v10M18 7v10" />
      <path d="M4 17h16" />
    </svg>
  );
}

function BlindsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 4h12M6 9h12M6 14h12M6 19h12" />
      <path d="M18 4v15" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.5 5.5c0 7.2 6.8 14 14 14l2-2c.6-.6.6-1.5 0-2.1l-2.4-2.4c-.5-.5-1.2-.6-1.8-.3l-1.7.9a2 2 0 0 1-2-.2 13.2 13.2 0 0 1-4.6-4.6 2 2 0 0 1-.2-2l.9-1.7c.3-.6.2-1.3-.3-1.8L8.1 3.5c-.6-.6-1.5-.6-2.1 0l-1.5 2Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M21.5 4.5 18.4 19c-.2 1-.8 1.3-1.7.8l-4.7-3.4-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.4 13 1.8 11.6c-1-.3-1-.9.2-1.3L20 3.4c.9-.3 1.7.2 1.5 1.1Z" />
    </svg>
  );
}

function ViberIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 2C6.7 2 3 5.4 3 10.3c0 2.8 1.2 4.7 3.3 6.1V22l4.1-2.2c.5.1 1 .1 1.6.1 5.3 0 9-3.4 9-8.3S17.3 2 12 2Zm4.2 11.2c-.2.6-.9 1-1.5 1.1-.4.1-.9.1-1.5 0-.4-.1-.9-.3-1.5-.6-2.4-1.1-4-3.7-4.1-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2.1c.2-.2.6-.3.9-.3h.7c.2 0 .5 0 .7.6.2.7.8 2.2.9 2.4.1.2.1.4 0 .6-.1.2-.2.4-.4.5-.2.2-.4.4-.5.5-.2.2-.3.4-.1.8.2.4 1 1.6 2.2 2.5 1.5 1.2 2.7 1.5 3.1 1.7.4.2.6.1.8-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 2 .9 2.3 1 .3.2.5.2.5.4 0 .3-.3 1-.5 1.6Z" />
    </svg>
  );
}

function getSolutionIcon(index: number) {
  switch (index) {
    case 0:
      return <WindowIcon />;
    case 1:
      return <DoorIcon />;
    case 2:
      return <RollerIcon />;
    default:
      return <BlindsIcon />;
  }
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = LANDING_COPY[locale as Locale];
  const { gallery, reviews } = await getLandingData();
  const socialButtonClass =
    "inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/86 px-4 py-2.5 text-sm font-medium text-[var(--text-main)] shadow-[0_10px_24px_rgba(20,40,30,0.08)] transition hover:border-[var(--brand)] hover:bg-white";

  const galleryFallback = [
    {
      id: "placeholder-1",
      title: locale === "uk" ? "Теплий віконний блок" : "Тёплый оконный блок",
      description:
        locale === "uk"
          ? "Приклад композиції для житлового фасаду."
          : "Пример композиции для жилого фасада.",
      imageUrl: "",
    },
    {
      id: "placeholder-2",
      title: locale === "uk" ? "Ролети та захист прорізу" : "Роллеты и защита проёма",
      description:
        locale === "uk"
          ? "Сценарій для приватності та сонцезахисту."
          : "Сценарий для приватности и солнцезащиты.",
      imageUrl: "",
    },
    {
      id: "placeholder-3",
      title: locale === "uk" ? "Жалюзі для інтер'єру" : "Жалюзи для интерьера",
      description:
        locale === "uk"
          ? "Акуратне керування світлом у кімнаті."
          : "Аккуратное управление светом в комнате.",
      imageUrl: "",
    },
  ];

  const previewGallery = (gallery.length > 0 ? gallery : galleryFallback).slice(0, 3);

  return (
    <main className="relative isolate overflow-hidden">
      <LandingAnimator />

      <section className="container-site pt-8 pb-20 sm:pt-10 sm:pb-24">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-[rgba(255,255,255,0.74)] px-6 py-8 shadow-[0_30px_70px_rgba(20,40,30,0.08)] backdrop-blur-[14px] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute inset-y-0 right-[-10%] w-[48%] rounded-full bg-[radial-gradient(circle_at_center,rgba(143,182,159,0.22),rgba(143,182,159,0))]" data-pulse-glow />
          <div className="absolute left-[-6rem] top-[-5rem] h-40 w-40 rounded-full bg-[rgba(255,255,255,0.75)] blur-3xl" data-float />
          <div className="absolute bottom-[-4rem] right-[10%] h-44 w-44 rounded-full bg-[rgba(47,122,87,0.09)] blur-3xl" data-float />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <span data-reveal className="section-kicker">
                {copy.heroBadge}
              </span>

              <h1
                data-reveal
                data-delay="0.05"
                className="mt-5 max-w-[14ch] font-[var(--font-display)] text-[clamp(2.8rem,6vw,5.9rem)] font-semibold leading-[0.92] tracking-[-0.06em]"
              >
                {copy.heroTitle}
              </h1>

              <p
                data-reveal
                data-delay="0.09"
                className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg"
              >
                {copy.heroSubtitle}
              </p>

              <div data-stagger data-delay="0.13" className="mt-6 flex flex-wrap gap-2.5">
                {copy.heroHighlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/85 bg-white/78 px-3.5 py-2 text-sm text-[var(--text-main)] shadow-[0_10px_22px_rgba(20,40,30,0.05)] transition-all duration-300 hover:border-[var(--brand)] hover:shadow-[0_12px_28px_rgba(47,122,87,0.12)] hover:scale-105"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div data-reveal data-delay="0.17" className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/calculator`}
                  data-magnetic="0.3"
                  className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))] px-5 py-3.5 font-semibold text-white shadow-[0_18px_32px_rgba(47,122,87,0.24)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_24px_40px_rgba(47,122,87,0.3)] active:translate-y-0"
                >
                  {copy.heroPrimary}
                  <ArrowUpRightIcon />
                </Link>
                <a
                  href="#gallery"
                  data-magnetic="0.2"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/84 px-5 py-3.5 font-semibold text-[var(--text-main)] transition-all duration-300 hover:border-[var(--brand)] hover:bg-white hover:translate-y-[-2px] hover:shadow-[0_16px_32px_rgba(20,40,30,0.1)]"
                >
                  {copy.heroSecondary}
                </a>
              </div>

              <div data-reveal data-delay="0.21" className="mt-10 grid gap-3 sm:grid-cols-3">
                {copy.heroStats.map((item) => (
                  <div
                    key={item.label}
                    className="soft-panel rounded-[1.45rem] px-4 py-4"
                  >
                    <p className="font-[var(--font-display)] text-[1.12rem] font-semibold tracking-[-0.04em]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <HeroServicePanel locale={locale as Locale} />
          </div>
        </div>
      </section>

      <section id="solutions" className="container-site pb-20">
        <div className="max-w-4xl">
          <span data-reveal className="section-kicker">
            {copy.solutionsKicker}
          </span>
          <h2 data-reveal className="section-title mt-5">
            {copy.solutionsTitle}
          </h2>
          <p data-reveal className="section-copy mt-4">
            {copy.solutionsBody}
          </p>
        </div>

        <div data-stagger className="mt-8 grid gap-4 lg:grid-cols-4">
          {copy.solutions.map((item, index) => (
            <article
              key={item.title}
              data-tilt="6"
              className={`soft-panel group rounded-[2rem] bg-gradient-to-br ${item.tone} p-6 transition-all duration-500 hover:shadow-[0_24px_56px_rgba(20,40,30,0.12)]`}
            >
              <div className="inline-flex rounded-2xl border border-white/80 bg-white/80 p-3 text-[var(--brand)] shadow-[0_8px_16px_rgba(20,40,30,0.05)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                {getSolutionIcon(index)}
              </div>
              <h3 className="mt-5 font-[var(--font-display)] text-[1.55rem] font-semibold leading-none tracking-[-0.04em] transition-colors duration-300 group-hover:text-[var(--brand)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-white/85 bg-white/82 px-3 py-1.5 text-xs font-medium text-[var(--text-main)] transition-all duration-300 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-site pb-20">
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="glass-panel rounded-[2.2rem] p-6 sm:p-7">
            <span data-reveal className="section-kicker">
              {copy.comfortKicker}
            </span>
            <h2 data-reveal className="section-title mt-5 max-w-3xl">
              {copy.comfortTitle}
            </h2>
            <p data-reveal className="section-copy mt-4 max-w-3xl">
              {copy.comfortBody}
            </p>

            <div data-stagger className="mt-7 grid gap-4 sm:grid-cols-2">
              {copy.comfortCards.map((item) => (
                <article
                  key={item.title}
                  data-tilt="5"
                  className="group rounded-[1.7rem] border border-white/80 bg-white/85 p-5 shadow-[0_12px_24px_rgba(20,40,30,0.04)] transition-all duration-400 hover:shadow-[0_20px_40px_rgba(20,40,30,0.1)] hover:border-[var(--brand)]/30"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)] transition-transform duration-300 group-hover:translate-x-1">
                    {item.source}
                  </p>
                  <h3 className="mt-3 font-[var(--font-display)] text-[1.25rem] font-semibold leading-tight tracking-[-0.04em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="soft-panel rounded-[2.2rem] p-6 sm:p-7">
            <span data-reveal className="section-kicker">
              {locale === "uk" ? "Процес" : "Процесс"}
            </span>
            <h2 data-reveal className="section-title mt-5">
              {copy.processTitle}
            </h2>
            <p data-reveal className="section-copy mt-4 max-w-none">
              {copy.processBody}
            </p>

            <div data-stagger className="mt-7 grid gap-4">
              {copy.processSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="group rounded-[1.7rem] border border-[var(--line-soft)] bg-white/88 p-5 transition-all duration-400 hover:border-[var(--brand)] hover:shadow-[0_16px_36px_rgba(20,40,30,0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] font-[var(--font-display)] text-lg font-semibold text-[var(--brand)] transition-all duration-300 group-hover:bg-[var(--brand)] group-hover:text-white group-hover:scale-110">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-[var(--text-main)] transition-colors duration-300 group-hover:text-[var(--brand)]">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{step.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="container-site pb-20">
        <div className="relative overflow-hidden rounded-[2.3rem] border border-white/80 bg-[rgba(255,255,255,0.78)] px-6 py-7 shadow-[0_24px_60px_rgba(20,40,30,0.08)] backdrop-blur-[14px] sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute right-[-3rem] top-[-3rem] h-36 w-36 rounded-full bg-[rgba(47,122,87,0.12)] blur-3xl" data-float />
          <div className="absolute bottom-[-2.5rem] left-[20%] h-28 w-28 rounded-full bg-[rgba(143,182,159,0.22)] blur-3xl" data-float />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div>
              <span data-reveal className="section-kicker">
                {locale === "uk" ? "Попередній розрахунок" : "Предварительный расчёт"}
              </span>
              <h2 data-reveal className="section-title mt-5 max-w-3xl">
                {copy.calculatorTitle}
              </h2>
              <p data-reveal className="section-copy mt-4 max-w-3xl">
                {copy.calculatorBody}
              </p>
            </div>

            <div className="grid gap-4">
              <div data-reveal className="grid gap-3">
                {copy.calculatorPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.3rem] border border-white/82 bg-white/86 px-4 py-3 text-sm text-[var(--text-main)]"
                  >
                    {point}
                  </div>
                ))}
              </div>

              <Link
                data-reveal
                href={`/${locale}/calculator`}
                data-magnetic="0.3"
                className="btn-shimmer inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))] px-5 py-3.5 font-semibold text-white shadow-[0_18px_32px_rgba(47,122,87,0.24)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_24px_40px_rgba(47,122,87,0.28)] active:translate-y-0"
              >
                {copy.calculatorCta}
                <ArrowUpRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingGalleryPreview
        locale={locale as Locale}
        items={previewGallery.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "",
          imageUrl: item.imageUrl,
        }))}
        kicker={copy.galleryKicker}
        title={copy.galleryTitle}
        body={copy.galleryBody}
        viewAll={copy.galleryViewAll}
        open={copy.galleryOpen}
        freshLabel={locale === "uk" ? "?????????? ????????????" : "???????????? ????????????"}
        galleryLabel={locale === "uk" ? "??????????????" : "??????????????"}
        closeLabel={locale === "uk" ? "??????????????" : "??????????????"}
        slideLabel={locale === "uk" ? "????????" : "????????"}
      />

      <section className="container-site pb-20">
        <div className="max-w-4xl">
          <span data-reveal className="section-kicker">
            {copy.reviewsKicker}
          </span>
          <h2 data-reveal className="section-title mt-5">
            {copy.reviewsTitle}
          </h2>
          <p data-reveal className="section-copy mt-4">
            {copy.reviewsBody}
          </p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
          <ReviewsShowcase
            locale={locale as Locale}
            leadTitle={copy.reviewsLeadTitle}
            leadBody={copy.reviewsLeadBody}
            emptyText={copy.reviewsEmpty}
            items={reviews.map((item) => ({
              id: item.id,
              name: item.name,
              body: item.body,
              rating: item.rating,
              photoUrl: resolveReviewPhotoUrl(item.photoUrl),
            }))}
          />

          <ReviewForm locale={locale as Locale} />
        </div>
      </section>

      <section id="contacts" className="container-site pb-20">
        <div className="max-w-4xl">
          <span data-reveal className="section-kicker">
            {copy.contactsKicker}
          </span>
          <h2 data-reveal className="section-title mt-5">
            {copy.contactsTitle}
          </h2>
          <p data-reveal className="section-copy mt-4">
            {copy.contactsBody}
          </p>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
          <aside className="grid gap-5">
            <article data-reveal className="glass-panel rounded-[2rem] p-6">
              <span className="section-kicker">{copy.coverageTitle}</span>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {copy.coverage.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/80 bg-white/84 px-4 py-2 text-sm font-medium text-[var(--text-main)]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-7 rounded-[1.6rem] border border-white/80 bg-white/84 p-4">
                <h3 className="font-[var(--font-display)] text-[1.35rem] font-semibold tracking-[-0.04em]">
                  {copy.contactCardTitle}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{copy.contactCardBody}</p>

                <div className="mt-5 grid gap-3">
                  <a
                    href={`tel:${PHONE_PRIMARY_LINK}`}
                    className="flex items-center justify-between rounded-[1.25rem] border border-[var(--line-soft)] bg-white px-4 py-3 transition hover:border-[var(--brand)]"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <PhoneIcon />
                      {copy.primaryCall}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">{PHONE_PRIMARY}</span>
                  </a>
                  <a
                    href={`tel:${PHONE_SECONDARY_LINK}`}
                    className="flex items-center justify-between rounded-[1.25rem] border border-[var(--line-soft)] bg-white px-4 py-3 transition hover:border-[var(--brand)]"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <PhoneIcon />
                      {copy.secondaryCall}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">{PHONE_SECONDARY}</span>
                  </a>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <a href={TELEGRAM_LINK} target="_blank" rel="noreferrer" data-magnetic="0.25" className={`${socialButtonClass} transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_32px_rgba(20,40,30,0.12)]`}>
                    <TelegramIcon />
                    <span>Telegram</span>
                  </a>
                  <a href={VIBER_LINK} data-magnetic="0.25" className={`${socialButtonClass} transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_32px_rgba(20,40,30,0.12)]`}>
                    <ViberIcon />
                    <span>Viber</span>
                  </a>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-[1.25rem] border border-[var(--line-soft)] bg-white/86 px-4 py-3 text-sm">
                  <span className="font-medium text-[var(--text-main)]">{copy.officeHours}</span>
                  <span className="text-[var(--text-muted)]">46.853518, 30.070530</span>
                </div>

                <a
                  href={`https://www.openstreetmap.org/?mlat=${OFFICE_LAT}&mlon=${OFFICE_LNG}#map=18/${OFFICE_LAT}/${OFFICE_LNG}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition-all duration-300 hover:gap-3 hover:text-[var(--brand-strong)]"
                >
                  {copy.openMap}
                  <ArrowUpRightIcon />
                </a>
              </div>
            </article>

            <article data-reveal className="soft-panel rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                {locale === "uk" ? "Контент-орієнтир" : "Контент-ориентир"}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{copy.sourceNote}</p>
            </article>
          </aside>

          <article data-reveal className="glass-panel overflow-hidden rounded-[2rem]">
            <iframe
              title="Office map"
              className="h-[420px] w-full border-0"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${OFFICE_BBOX}&layer=mapnik&marker=${OFFICE_LAT}%2C${OFFICE_LNG}`}
            />
          </article>
        </div>
      </section>

      <section className="container-site pb-24">
        <div className="max-w-4xl">
          <span data-reveal className="section-kicker">
            {copy.faqKicker}
          </span>
          <h2 data-reveal className="section-title mt-5">
            {copy.faqTitle}
          </h2>
          <p data-reveal className="section-copy mt-4">
            {copy.faqBody}
          </p>
        </div>

        <div data-stagger className="mt-8 grid gap-4 lg:grid-cols-2">
          {copy.faqItems.map((item) => (
            <details
              key={item.question}
              className="soft-panel group rounded-[1.8rem] p-5 open:border-[var(--brand)] transition-all duration-400 hover:shadow-[0_16px_36px_rgba(20,40,30,0.08)]"
            >
              <summary className="cursor-pointer list-none font-[var(--font-display)] text-[1.2rem] font-semibold tracking-[-0.04em] marker:hidden transition-colors duration-300 group-hover:text-[var(--brand)]">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
