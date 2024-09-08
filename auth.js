import puppeteer from "puppeteer";
import fs from 'fs';
import tesseract from 'tesseract.js';  // Библиотека для OCR

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    try {
        const page = await browser.newPage();
        await page.goto('https://preprod-vpdrk.hellishworld.ru/');

        await page.waitForSelector('.header-login.flex a');
        console.log('Клик "Войти в кабинет"');
        await page.click('.header-login.flex a');

        // Ожидаем появления инпута для ввода номера телефона
        console.log('Ожидаю поле для ввода номера телефона...');
        await page.waitForSelector('input#phone.v-input__input.mask-tel');  // Более точный селектор для инпута

        // Вводим номер телефона
        const phoneNumber = '1234567890'; // Ваш номер телефона
        console.log(`Ввожу номер телефона: ${phoneNumber}`);
        await page.type('input#phone.v-input__input.mask-tel', phoneNumber);

        // Ожидаем капчу
        console.log('Ожидаю капчу...');
        const captchaImgSelector = '.v-captcha__img';
        await page.waitForSelector(captchaImgSelector, { timeout: 4000 });

        // Делаем скриншот капчи
        const captchaElement = await page.$(captchaImgSelector);
        await captchaElement.screenshot({ path: 'captcha.png' });

        // Используем Tesseract.js для распознавания цифр на капче
        console.log('Распознаю цифры на капче...');
        const result = await tesseract.recognize('captcha.png', 'eng');
        const captchaText = result.data.text.trim();
        console.log(`Распознанный текст капчи: ${captchaText}`);

        // Вводим распознанные цифры в поле ввода капчи
        const captchaInputSelector = 'input.v-captcha__input[name="captcha"]';
        await page.type(captchaInputSelector, captchaText);

        // Продолжаем выполнение скрипта, например, кликаем на кнопку подтверждения
        const submitButtonSelector = 'selector-кнопки-подтверждения';  // Замените на нужный селектор
        await page.click(submitButtonSelector);

    } catch (error) {
        console.error('Ошибка при выполнении скрипта:', error);
    } finally {
        //await browser.close();
    }
})();
