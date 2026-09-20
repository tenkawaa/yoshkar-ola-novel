export const SCENARIO = {
  start: {
    speaker: "Экскурсовод",
    characterKey: "default",
    bgKey: "default",
    text: "Привет! Добро пожаловать в Йошкар-Олу. Давай я проведу тебя по самым красивым местам города!",
    nextId: "embankment_choice",
  },

  embankment_choice: {
      speaker: 'Экскурсовод',
      bgKey: 'default',
      characterKey: 'guide',
      text: 'Мы вышли на набережную Брюгге! Куда отправимся дальше?',
      choices: [
        {
          text: '🏰 Посмотреть на Замок Шереметева',
          nextId: 'visit_castle'
        },
        {
          text: '🐱 Найти Йошкиного кота',
          nextId: 'find_cat'
        },
        {
          text: '🍕 Сделать перерыв и попробовать марийские подкогили',
          nextId: 'cafe_break'
        }
      ]
    },
  
    visit_castle: {
      speaker: 'Экскурсовод',
      bgKey: 'scene1',
      characterKey: 'guide',
      text: 'Перед нами великолепный замок! Давай рассмотрим его архитектуру поближе.',
      nextId: 'scene1' // Возврат или переход к следующей общей сцене
    },
  
    find_cat: {
      speaker: 'Экскурсовод',
      bgKey: 'scene1',
      characterKey: 'guide',
      text: 'А вот и знаменитый Йошкин кот! Говорят, если погладить его по лапе и загадать желание — оно обязательно сбудется.',
      nextId: 'scene1'
    },
  
    cafe_break: {
      speaker: 'Экскурсовод',
      bgKey: 'scene1',
      characterKey: 'guide',
      text: 'Отличный выбор! Подкогили — это традиционные марийские вареники с самыми разными начинками.',
      nextId: 'scene1'
    },

  
  scene1: {
    speaker: "Гид",
    characterKey: "default",
    bgKey: "scene1",
    text: "Scene1 sjhdfouihsdflsjkdf;siljd fiosp;d jfhsiudlkfjsl difk",
    nextId: "scene2",
  },
  scene2: {
    speaker: "Гид",
    characterKey: "default",
    bgKey: "scene2",
    text: "Scene2 lhdsgfsjdflkjsdhflis kdflisuhjdf;osidlkf;osijldkfsd;",
    isEnd: true
  },
};
