export function auth(a, b) {
    return a + b;
}

export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для нажатия на кнопку "Показать больше" и проверки наличия новых карточек
export const loadMoreCards = async () => {
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

// Функция для клика с повторами при ошибке
export const clickWithRetry = async (selector, retries = 3) => {
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