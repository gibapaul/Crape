const scrapers = require('./scraper');
const fs = require('fs');

const scraperController = async (browserInstance) => {
    const url = 'https://phongtro123.com/'; // Đặt URL vào đây
    const indexes = [0, 1, 2, 3]; // Chỉ số các danh mục mà bạn muốn lấy (cập nhật để bắt đầu từ 0)
    try {
        let browser = await browserInstance;
        let categories = await scrapers.scrapeCategory(browser, url);
        
        const selectedCategories = categories.filter((category, index) => indexes.includes(index));
        console.log(selectedCategories);

        // Lấy kết quả cho danh mục đầu tiên
       /* if (selectedCategories.length > 0) {
            let result1 = await scrapers.scraper(browser, selectedCategories[0].link);

            // Ghi dữ liệu vào file JSON cho danh mục đầu tiên
            fs.writeFile('chothuephongtro.json', JSON.stringify(result1, null, 2), (err) => {
                if (err) {
                    console.log('Ghi dữ liệu vào file thất bại: ' + err);
                } else {
                    console.log('Thêm dữ liệu thành công vào danhmuc1.json!');
                }
            });
        }*/

        // Lấy kết quả cho danh mục thứ hai
        if (selectedCategories.length > 1) {
            let result2 = await scrapers.scraper(browser, selectedCategories[1].link);

            // Ghi dữ liệu vào file JSON cho danh mục thứ hai
            fs.writeFile('nhachothue.json', JSON.stringify(result2, null, 2), (err) => {
                if (err) {
                    console.log('Ghi dữ liệu vào file thất bại: ' + err);
                } else {
                    console.log('Thêm dữ liệu thành công vào nhachothue.json!');
                }
            });
        }

        // Lấy kết quả cho danh mục thứ ba
        if (selectedCategories.length > 2) {
            let result3 = await scrapers.scraper(browser, selectedCategories[2].link);

            // Ghi dữ liệu vào file JSON cho danh mục thứ ba
            fs.writeFile('chothuecanho.json', JSON.stringify(result3, null, 2), (err) => {
                if (err) {
                    console.log('Ghi dữ liệu vào file thất bại: ' + err);
                } else {
                    console.log('Thêm dữ liệu thành công vào chothuephongtro.json!');
                }
            });
        }

        // Lấy kết quả cho danh mục thứ tư
        if (selectedCategories.length > 3) {
            let result4 = await scrapers.scraper(browser, selectedCategories[3].link);

            // Ghi dữ liệu vào file JSON cho danh mục thứ tư
            fs.writeFile('chothuematbang.json', JSON.stringify(result4, null, 2), (err) => {
                if (err) {
                    console.log('Ghi dữ liệu vào file thất bại: ' + err);
                } else {
                    console.log('Thêm dữ liệu thành công vào danhmuc4.json!');
                }
            });
        }

    } catch (error) {
        console.error('Có lỗi xảy ra:', error);
    }
};

module.exports = scraperController;
