const scrapers = require('./scraper');
const fs = require('fs');

const scraperController = async (browserInstance) => {
    const url = 'https://digital-world-2.myshopify.com/';
    try {
        const browser = await browserInstance;
        console.log('Mở trình duyệt...');

        // Lấy danh sách các danh mục
        const categories = await scrapers.scrapeCategory(browser, url);
        console.log('Danh sách danh mục:', categories);

        // Lấy tất cả các link sản phẩm từ các danh mục
        const catePromises = categories.map(category => {
            console.log('Truy cập vào danh mục:', category.link); // Log link category
            return scrapers.scrapeItems(browser, category.link);
        });

        const itemLinks = await Promise.all(catePromises);
        console.log('Liên kết sản phẩm:', itemLinks);

        // Lấy thông tin từng sản phẩm từ các link
        const productPromises = [];
        for (const items of itemLinks) {
            if (!Array.isArray(items)) {
                console.error('Dữ liệu không hợp lệ, mong đợi mảng:', items);
                continue; // Bỏ qua phần tử không hợp lệ
            }

            for (const link of items) {
                if (link) { // Kiểm tra link không null hoặc undefined
                    console.log('Truy cập vào sản phẩm:', link); // Log link product
                    productPromises.push(scrapers.scraper(browser, link));
                } else {
                    console.warn('Link sản phẩm không hợp lệ:', link);
                }
            }
        }

        const results = await Promise.all(productPromises);
        console.log('Dữ liệu sản phẩm:', results);

        // Ghi dữ liệu vào file JSON
        fs.writeFile('product_data.json', JSON.stringify(results, null, 2), (err) => {
            if (err) {
                console.error('Ghi data vào file thất bại:', err);
            } else {
                console.log('Thêm dữ liệu thành công!');
            }
        });

        await browser.close(); // Đóng trình duyệt
        console.log('Đã đóng trình duyệt');

    } catch (error) {
        console.error('Có lỗi xảy ra:', error);
    }
};

module.exports = scraperController;
