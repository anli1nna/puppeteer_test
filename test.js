import puppeteer from "puppeteer";

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Функция для создания задержки
    try {
        await page.goto('https://vpodarok.ru');
        await page.waitForSelector('div.flex > div.menu-item > a');

        const requiredLink = await page.$('div.flex > div.menu-item:nth-child(2) > a');

        if (requiredLink) {
            const href = await page.evaluate(el => el.href, requiredLink);
            const text = await page.evaluate(el => el.textContent.trim(), requiredLink);

            console.log(`Link: ${href}`);
            console.log(`Text: "${text}"`);

            await clickWithRetry('div.flex > div.menu-item:nth-child(2) > a');

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
