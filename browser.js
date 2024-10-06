const puppeteer = require('puppeteer');

const startBrowser = async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // Đặt true để chạy ở chế độ ẩn
            args: ['--disable-setuid-sandbox'],
           // ignoreDefaultArgs: ['--enable-automation'], // Giúp tránh một số vấn đề
            'ignoreHTTPSErrors': true // Đảm bảo không có dấu nháy đơn trước
        });
    } catch (error) {
        console.log('Không tạo được browser: ' + error);
    }
    return browser; // Trả về browser
};

module.exports = startBrowser;