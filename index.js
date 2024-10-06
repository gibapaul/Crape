const startBrowser = require('./browser');
const scraperController = require('./scrapeController');



let browser = startBrowser()
scraperController(browser)
/*(async () => {
    // Khởi tạo browser và chờ nó hoàn thành
    const browser = await startBrowser();
    if (browser) {
        // Gọi scraperController với browser
        await scraperController(browser);
        
        // Đừng quên đóng browser sau khi sử dụng
        await browser.close();
    } else {
        console.log('Không thể khởi tạo browser.');
    }
})();*/
