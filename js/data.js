const gameData = [
    {
        name: "Дачные войны",
        questions: [
            { id: "cat1_100", price: 100, text: "Главный полосатый враг картошки?", answer: "Колорадский жук", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=colorado%20potato%20beetle%20macro%20funny%20garden&image_size=landscape_16_9" },
            { id: "cat1_200", price: 200, text: "Обувь, которая передается по наследству на даче?", answer: "Старые калоши (или тапки)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=old%20rubber%20galoshes%20garden%20shoes&image_size=landscape_16_9" },
            { id: "cat1_300", price: 300, text: "Что делают из старых капроновых колготок на даче?", answer: "Подвязывают помидоры", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=tomato%20plants%20tied%20with%20old%20tights%20garden&image_size=landscape_16_9" },
            { id: "cat1_400", price: 400, text: "Шашлычный 'допинг', который отлично отпугивает комаров?", answer: "Дым от мангала", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=shashlik%20manghal%20smoke%20barbecue%20funny&image_size=landscape_16_9" },
            { id: "cat1_500", price: 500, text: "Сорняк, который лечит вообще все болезни, если приложить к ране?", answer: "Подорожник", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=plantain%20leaf%20plant%20healing%20funny&image_size=landscape_16_9" }
        ]
    },
    {
        name: "Медицина после 40",
        questions: [
            { id: "cat2_100", price: 100, text: "Звук, с которым обычно встают с дивана?", answer: "Кряхтение (или 'Ох')", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=middle%20aged%20man%20standing%20up%20holding%20lower%20back%20pain&image_size=landscape_16_9" },
            { id: "cat2_200", price: 200, text: "Легендарная мазь, которая пахнет на всю квартиру, но лечит спину?", answer: "Звездочка (или Финалгон)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=vintage%20red%20star%20balm%20ointment%20box&image_size=landscape_16_9" },
            { id: "cat2_300", price: 300, text: "Прибор, который становится лучшим другом при резкой смене погоды?", answer: "Тонометр", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=blood%20pressure%20monitor%20device%20on%20table&image_size=landscape_16_9" },
            { id: "cat2_400", price: 400, text: "Лекарство 'от нервов', которое капают в рюмку?", answer: "Валерьянка (Корвалол)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=valerian%20drops%20in%20glass%20calming%20nerves&image_size=landscape_16_9" },
            { id: "cat2_500", price: 500, text: "Что начинает хрустеть громче, чем чипсы при просмотре кино?", answer: "Суставы (колени)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=human%20knee%20joint%20funny%20xray%20chips&image_size=landscape_16_9" }
        ]
    },
    {
        name: "Дети и Гаджеты",
        questions: [
            { id: "cat3_100", price: 100, text: "Какую кнопку ищут на пульте, чтобы сделать 'как было'?", answer: "Назад (Отмена)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=confused%20grandma%20holding%20modern%20tv%20remote&image_size=landscape_16_9" },
            { id: "cat3_200", price: 200, text: "Слово, которым старшее поколение называет любой планшет или приставку?", answer: "Компьютер", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=old%20person%20looking%20at%20ipad%20tablet%20funny&image_size=landscape_16_9" },
            { id: "cat3_300", price: 300, text: "Куда 'уходят' все деньги с телефона, по мнению родителей?", answer: "На вирусы (или Интернет)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=flying%20money%20from%20smartphone%20screen%20funny&image_size=landscape_16_9" },
            { id: "cat3_400", price: 400, text: "Главная проблема дедушек при звонке по видеосвязи?", answer: "Показывают только лоб (или ухо)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=grandpa%20face%20too%20close%20to%20smartphone%20camera%20video%20call&image_size=landscape_16_9" },
            { id: "cat3_500", price: 500, text: "Как называется 'тот интернет', который раздает коробочка с антеннами?", answer: "Вай-фай (Wi-Fi)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=wifi%20router%20with%20glowing%20antennas%20magic&image_size=landscape_16_9" }
        ]
    },
    {
        name: "Застольные привычки",
        questions: [
            { id: "cat4_100", price: 100, text: "Куда обязательно нужно спрятать пустую бутылку на застолье?", answer: "Под стол", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=empty%20glass%20bottle%20hidden%20under%20festive%20table&image_size=landscape_16_9" },
            { id: "cat4_200", price: 200, text: "Что кричат хором, если кто-то случайно разбил бокал?", answer: "На счастье!", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=broken%20wine%20glass%20on%20floor%20celebration&image_size=landscape_16_9" },
            { id: "cat4_300", price: 300, text: "Хлеб какого цвета идеален для бутерброда со шпротами?", answer: "Черный", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=sprat%20sandwich%20on%20black%20bread%20russian%20food&image_size=landscape_16_9" },
            { id: "cat4_400", price: 400, text: "Какую песню обязательно затягивают, когда гостям уже 'хорошо'?", answer: "Ой, мороз, мороз", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=drunk%20happy%20people%20singing%20at%20feast%20table&image_size=landscape_16_9" },
            { id: "cat4_500", price: 500, text: "Зачем нарезают сырокопченую колбасу так тонко, что она просвечивает?", answer: "Чтоб на всех хватило (или для красоты)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=transparent%20thin%20slice%20of%20salami%20sausage%20funny&image_size=landscape_16_9" }
        ]
    },
    {
        name: "Школа 80-90х",
        questions: [
            { id: "cat5_100", price: 100, text: "Что торжественно мыли дежурные после уроков?", answer: "Доску (и пол)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=soviet%20school%20blackboard%20chalk%20and%20rag&image_size=landscape_16_9" },
            { id: "cat5_200", price: 200, text: "Как называлась главная 'валюта' из вкладышей от жвачек?", answer: "Турбо (или Дональд)", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=retro%20turbo%20bubble%20gum%20wrappers%20collection&image_size=landscape_16_9" },
            { id: "cat5_300", price: 300, text: "Какое лакомство нужно было грызть сухим прямо из брикета?", answer: "Кисель", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=briquette%20of%20dry%20kissel%20fruit%20jelly%20bitten&image_size=landscape_16_9" },
            { id: "cat5_400", price: 400, text: "Главное оружие на задней парте, сделанное из ручки?", answer: "Плевалка", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=school%20spitball%20shooter%20made%20from%20pen%20funny&image_size=landscape_16_9" },
            { id: "cat5_500", price: 500, text: "Какую часть тела, по мнению учителя, ученик мог забыть дома?", answer: "Голову", image: "https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=strict%20soviet%20teacher%20pointing%20at%20head%20funny&image_size=landscape_16_9" }
        ]
    }
];