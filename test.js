import puppeteer from "puppeteer";

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Функция для создания задержки
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        await page.goto('https://vpodarok.ru');
        await page.waitForSelector('div.flex > div.menu-item > a');

        const requiredLink = await page.$('div.flex > div.menu-item:nth-child(2) > a');

        if (requiredLink) {
            const href = await page.evaluate(el => el.href, requiredLink);
            const text = await page.evaluate(el => el.textContent.trim(), requiredLink);

            console.log(`Link: ${href}`);
            console.log(`Text: "${text}"`);

            // Функция для клика с повторами при ошибке
            const clickWithRetry = async (selector, retries = 3) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        const element = await page.$(selector);
                        if (element) {
                            await page.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), element);
                            await wait(1000); // Задержка для плавности скролла
                            await element.click();
                            console.log(`Клик выполнен по разделу`);

                            // Ожидание появления кнопки "Показать больше"
                            await page.waitForSelector('button.item.more.ugc-brand-loadmore', { timeout: 10000 });
                            return;
                        } else {
                            console.log(`Элемент с селектором ${selector} не найден.`);
                        }
                    } catch (error) {
                        console.log(`Ошибка при клике: ${error}`);
                    }
                    await wait(1000);
                }
                console.log(`Не удалось выполнить клик по селектору ${selector} после ${retries} попыток.`);
            };

            await clickWithRetry('div.flex > div.menu-item:nth-child(2) > a');

            // Функция для нажатия на кнопку "Показать больше" и проверки наличия новых карточек
            const loadMoreCards = async () => {
                const loadMoreSelector = 'button.item.more.ugc-brand-loadmore';
                let previousCardCount = 0;
                let cardsPresent = true;

                while (cardsPresent) {
                    try {
                        // Ожидание появления кнопки "Показать больше"
                        await page.waitForSelector(loadMoreSelector, { timeout: 10000 });

                        const loadMoreButton = await page.$(loadMoreSelector);

                        if (loadMoreButton) {
                            await loadMoreButton.click();
                            console.log(`Нажата кнопка "Показать больше"`);

                            // Ожидание загрузки новых карточек
                            await wait(5000);

                            // Проверка наличия новых карточек
                            const cards = await page.$$('div.cards-block .card.item.v-card__item');
                            const currentCardCount = cards.length;

                            if (currentCardCount === previousCardCount) {
                                console.log(`Новые карточки не загружены. Завершаем.`);
                                cardsPresent = false;
                            } else {
                                console.log(`Найдено ${currentCardCount} карточек.`);
                                previousCardCount = currentCardCount;
                            }
                        } else {
                            console.log(`Кнопка "Показать больше" не найдена.`);
                            cardsPresent = false;
                        }
                    } catch (error) {
                        console.log(`Ошибка при нажатии кнопки "Показать больше" или проверке карточек: ${error}`);
                        cardsPresent = false;
                    }
                }
            };

            await loadMoreCards();

            // Функция для нажатия на случайную карточку
            const clickRandomCard = async () => {
                try {
                    const cards = await page.$$('div.cards-block > .card.item.v-card__item > a');
                    const cardCount = cards.length;

                    if (cardCount > 0) {
                        const randomIndex = Math.floor(Math.random() * cardCount);
                        const randomCard = cards[randomIndex];

                        await randomCard.click();
                        console.log(`Клик выполнен по случайной карточке ${randomIndex + 1}`);

                        // Увеличение тайм-аута навигации до 60 секунд
                        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 800000 });

                    } else {
                        console.log(`Карточки не найдены.`);
                    }
                } catch (error) {
                    console.log(`Ошибка при выборе случайной карточки: ${error}`);
                }
            };

            await clickRandomCard();


                    // Нажатие на кнопку "Добавить в корзину"
            const buyBtnSelector = '.product-block-btn';

            const clickButton = async (selector) => {
                try {
                    // Ожидание появления и видимости кнопки
                    await page.waitForSelector(selector, { visible: true, timeout: 1000 });
                    
                    // Скролл элемента в область видимости
                    await page.evaluate(selector => {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, selector);

                    // Ожидание после скроллинга
                    await wait(1000);

                    // Клик на кнопку
                    await page.click(selector);
                    console.log('Клик выполнен по кнопке "Добавить в корзину"');
                } catch (error) {
                    console.log(`Ошибка при попытке кликнуть по кнопке: ${error}`);
                }
            };

            await clickButton(buyBtnSelector);

            // Ожидание появления полей ввода для оформления заказа
            await page.waitForSelector('input.basket-forms-input[name="user[name]"]', { visible: true });
            
            const inputNameAttribute = 'input.basket-forms-input[name="user[name]"]';
            const inputPhoneAttribute = 'input.basket-forms-input[name="user[phone]"]';
            const inputEmailAttribute = 'input.basket-forms-input[name="user[email]"]';

            await page.type(inputNameAttribute, 'Ангелина');
            await page.type(inputPhoneAttribute, '7777777777777');
            await page.type(inputEmailAttribute, 'angelina-s-04@mail.com');

            // Нажатие на кнопку "Оформить заказ"
            const createOrderSelector = 'body > div.container__cart-flex > div.form-cart > div > div.confirm-cart > div.item.basket-buttoms > button';
            const createOrderBtn = await page.$(createOrderSelector);

            if (createOrderBtn) {
                await page.evaluate((selector) => {
                    setTimeout(() => {
                        document.querySelector(selector).click();
                    }, 2000);
                }, createOrderSelector);
            }
        } else {
            console.log('Требуемая ссылка не найдена.');
        }

    } catch (error) {
        console.log(`Ошибка в процессе выполнения скрипта: ${error}`);
    } finally {
        // await browser.close();
    }

})();
