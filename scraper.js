const puppeteer = require('puppeteer');

// Hàm giúp đi tới URL với retry
const gotoWithRetry = async (page, url, options = {}, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            await page.goto(url, { ...options, timeout: 60000 });
            return; // Thành công
        } catch (error) {
            console.error(`Attempt ${attempt + 1} to go to ${url} failed: ${error.message}`);
            if (attempt === retries - 1) throw error; // Ném lỗi ở lần thử cuối
        }
    }
};

const scrapeCategory = (browser, url) => new Promise(async (resolve, reject) => {
    let page;
    try {
        page = await browser.newPage();
        console.log('>> Mở tab mới ...');
        console.log('>> Đang truy cập vào URL:', url);
        await gotoWithRetry(page, url, { waitUntil: 'networkidle2' });
        console.log('>> Truy cập vào ... ' + url);
        await page.waitForSelector('#shopify-section-all-collections');

        const dataCategory = await page.$$eval('#shopify-section-all-collections > div.all-collections > div.sdcollections-content > ul.sdcollections-list > li', els => {
            return els.map(el => {
                const categoryName = el.querySelector('div.collection-name');
                const linkElement = el.querySelector('a');
                return {
                    category: categoryName ? categoryName.innerText : 'Không có tên danh mục',
                    link: linkElement ? linkElement.href : 'Không có link'
                };
            });
        });

        console.log('Dữ liệu danh mục:', dataCategory);
        resolve(dataCategory);
    } catch (error) {
        console.error('Lỗi ở scrape cate: ', error);
        console.error('Có lỗi xảy ra với URL:', url);
        reject(error);
    } finally {
        if (page) {
            await page.close();
            console.log('>> Tab đã đóng');
        }
    }
});

const scrapeItems = async (browser, url) => {
    const page = await browser.newPage();
    try {
        console.log('>> Đang truy cập vào URL:', url);
        await gotoWithRetry(page, url, { waitUntil: 'networkidle2' });
        console.log('>> Web đã load ...');

        const items = await page.$$eval('#collection-product-grid > div.grid-element', els => {
            return els.map(el => {
                const linkElement = el.querySelector('a.grid-view-item__link');
                return linkElement ? linkElement.href : null; // Trả về null nếu không có link
            }).filter(link => link !== null); // Lọc ra các giá trị null
        });

        return items; // Đảm bảo trả về mảng items
    } catch (error) {
        console.error('Lỗi ở scrape items:', error.message);
        return []; // Trả về mảng rỗng khi có lỗi
    } finally {
        await page.close();
        console.log('>> Tab đã đóng');
    }
};

const scraper = (browser, url) => new Promise(async (resolve, reject) => {
    let newPage;
    try {
        newPage = await browser.newPage();
        console.log('>> Đã mở tab mới ...');
        await gotoWithRetry(newPage, url, { waitUntil: 'networkidle2' });
        console.log('>> Đã truy cập vào trang ' + url);
        await newPage.waitForSelector('#PageContainer');
        console.log('>> Đã load xong tag main ...');

        const scrapeData = {};

        // Lấy danh mục sản phẩm
        scrapeData.category = await newPage.$$eval('nav.breadcrumb > a', els => {
            return els.map(el => el.innerText);
        });

        // Lấy tên sản phẩm
        scrapeData.name = await newPage.$eval('header.section-header h3', el => el.innerText || 'Không có tên');

        // Lấy ảnh sản phẩm
        scrapeData.thumb = await newPage.$eval('#ProductPhotoImg', el => el.src || 'Không có ảnh');

        scrapeData.images = await newPage.$$eval('#ProductThumbs > div.owl-wrapper-outer > div.owl-wrapper > div.owl-item a.product-single__thumbnail', els => {
            return els.map(el => el.href);
        });

        // Lấy giá sản phẩm
        scrapeData.price = await newPage.$eval('#ProductPrice span.money', el => el.innerText || 'Không có giá');

        // Lấy mô tả sản phẩm
        scrapeData.description = await newPage.$$eval('div.product-single__description > ul > li', els => {
            return els.map(el => el.innerText || 'Không có mô tả');
        });

        // Lấy variants
        const variants = await newPage.$$eval('form.product-single__form > div.product-form__item', (els) => {
            return els.map(el => {
                const label = el.querySelector('label.single-option-radio__label')?.innerText.trim() || 'Không có tên';
                const variantLabels = el.querySelectorAll('fieldset.single-option-radio > label');
                const values = Array.from(variantLabels).map(labelElement => labelElement.innerText.trim() || 'Không có giá trị');
                return {
                    label,
                    variants: values.length > 0 ? values : ['Không có giá trị']
                };
            });
        });
        scrapeData.variants = variants;

        // Lấy thông tin sản phẩm
        const infomationTitles = await newPage.$$eval('#tabs-information > ul > li', (els) => {
            return els.map(el => el.querySelector('a')?.innerText || 'Không có thông tin');
        });

        const desc = await newPage.$eval('#desc', el => el?.innerText || 'Không có mô tả');
        const size = await newPage.$eval('#size', el => el?.innerText || 'Không có kích thước');
        const delivery = await newPage.$eval('#delivery', el => el?.innerText || 'Không có giao hàng');
        const payment = await newPage.$eval('#payment', el => el?.innerText || 'Không có thanh toán');

        scrapeData.infomations = {
            [infomationTitles[0]]: desc,
            [infomationTitles[1]]: size,
            [infomationTitles[2]]: delivery,
            [infomationTitles[3]]: payment,
        };

        console.log('>> Dữ liệu sản phẩm:', scrapeData);
        resolve(scrapeData);
    } catch (error) {
        console.error('Lỗi ở scraper: ', error);
        reject(error);
    } finally {
        if (newPage) {
            await newPage.close();
            console.log('>> Trình duyệt đã đóng');
        }
    }
});

module.exports = {
    scrapeCategory,
    scraper,
    scrapeItems,
};
