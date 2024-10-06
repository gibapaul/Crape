const scrapeCategory = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage();
        console.log('>> Mở tab mới ...');
        await page.goto(url);
        console.log('>> Truy cập vào ... ' + url);
        await page.waitForSelector('#webpage');
        console.log('>> Web đã load ...');

        const dataCategory = await page.$$eval('#navbar-menu > ul > li', els => {
            return els.map(el => ({
                category: el.querySelector('a').innerText,
                link: el.querySelector('a').href
            }));
        });

        await page.close();
        console.log('>> Tab đã đóng');
        resolve(dataCategory);
    } catch (error) {
        console.log('Lỗi ở scrape cate: ' + error);
        reject(error);
    }
});

const scraper = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let newPage = await browser.newPage();
        console.log('>> Đã mở tab mới ...');
        await newPage.goto(url);
        console.log('>> Đã truy cập vào trang ' + url);
        await newPage.waitForSelector('#main');
        console.log('>> Đã load xong tag main ...');

        const scrapeData = {};

        // Lấy header
        const headerData = await newPage.$eval('header', (el) => ({
            title: el.querySelector('h1').innerText,
            description: el.querySelector('p') ? el.querySelector('p').innerText : 'Không có mô tả'
        }));
        scrapeData.header = headerData;

        // Lấy link detail item
        const detailLinks = await newPage.$$eval('#left-col > section.section-post-listing > ul > li', (els) => {
            return els.map(el => el.querySelector('.post-meta > h3 > a').href);
        });

        const detailDataArray = []; // Mảng lưu trữ detailData

        const scraperDetail = async (link) => new Promise(async (resolve, reject) => {
            try {
                let pageDetail = await browser.newPage();
                await pageDetail.goto(link);
                await pageDetail.waitForSelector('#main');

                const detailData = {};

                // Lấy hình ảnh
                const images = await pageDetail.$$eval('#left-col > article > div.post-images > div > div.swiper-wrapper > div.swiper-slide img', (els) => {
                    return els.map(el => el.src).filter(src => src !== undefined && src !== '');
                });

                detailData.images = images;
                console.log('Hình ảnh đã lấy:', detailData.images);

                // Lấy header detail
                const header = await pageDetail.$eval('header.page-header', (el) => ({
                    title: el.querySelector('h1 > a') ? el.querySelector('h1 > a').innerText : 'Không có tiêu đề',
                    star: el.querySelector('h1 > span') ? el.querySelector('h1 > span').className : 'Không có đánh giá',
                    class: {
                        content: el.querySelector('p') ? el.querySelector('p').innerText : 'Không có nội dung',
                        classType: el.querySelector('p > a > strong') ? el.querySelector('p > a > strong').innerText : 'Không có loại'
                    },
                    address: el.querySelector('address') ? el.querySelector('address').innerText : 'Không có địa chỉ',
                    attributes: {
                        price: el.querySelector('div.post-attributes > .price > span') ? el.querySelector('div.post-attributes > .price > span').innerText : 'Không có giá',
                        acreage: el.querySelector('div.post-attributes > .acreage > span') ? el.querySelector('div.post-attributes > .acreage > span').innerText : 'Không có diện tích',
                        published: el.querySelector('div.post-attributes > .published > span') ? el.querySelector('div.post-attributes > .published > span').innerText : 'Không có ngày phát hành',
                        hashtag: el.querySelector('div.post-attributes > .hashtag > span') ? el.querySelector('div.post-attributes > .hashtag > span').innerText : 'Không có hashtag',
                    }
                }));

                detailData.header = header;
                console.log('Header chi tiết:', detailData.header);

                // Thông tin mô tả
                let mainContentHeader;
                try {
                    mainContentHeader = await pageDetail.$eval('#left-col > article.the-post > section.post-main-content > div.section-header > h2', el => el.innerText);
                } catch (error) {
                    console.log('Không tìm thấy tiêu đề mô tả:', error);
                    mainContentHeader = 'Không có tiêu đề mô tả';
                }

                let mainContentContent;
                try {
                    mainContentContent = await pageDetail.$$eval('#left-col > article.the-post > section.post-main-content > section-content > p', els => els.map(el => el.innerText));
                } catch (error) {
                    console.log('Không tìm thấy nội dung mô tả:', error);
                    mainContentContent = ['Không có nội dung'];
                }

                detailData.mainContent = {
                    header: mainContentHeader,
                    content: mainContentContent
                };
                console.log('Tiêu đề mô tả:', mainContentHeader);
                console.log('Nội dung:', mainContentContent);

                // Đặc điểm tin đăng
                let overviewHeader;
                try {
                    overviewHeader = await pageDetail.$eval('#left-col > section.post-overview > div.section-header > h3', el => el.innerText);
                } catch (error) {
                    console.log('Không tìm thấy tiêu đề overview:', error);
                    overviewHeader = 'Không có tiêu đề overview';
                }

                let overviewContent;
                try {
                    overviewContent = await pageDetail.$$eval('#left-col > section.post-overview > .section-content > table.table > tbody > tr', (els) => {
                        return els.map(el => ({
                            name: el.querySelector('td:first-child').innerText,
                            content: el.querySelector('td:last-child').innerText
                        }));
                    });
                } catch (error) {
                    console.log('Không tìm thấy nội dung overview:', error);
                    overviewContent = ['Không có nội dung'];
                }

                detailData.overview = {
                    header: overviewHeader,
                    content: overviewContent
                };

                console.log('Tiêu đề overview:', overviewHeader);
                console.log('Nội dung overview:', overviewContent);

                // Lấy thông tin liên hệ
                let contactHeader;
                try {
                    contactHeader = await pageDetail.$eval('#left-col > article.the-post > section.post-contact', el => el.innerText);
                } catch (error) {
                    console.log('Không tìm thấy tiêu đề liên hệ:', error);
                    contactHeader = 'Không có tiêu đề liên hệ';
                }

                let contactContent;
                try {
                    contactContent = await pageDetail.$$eval('#left-col > article.the-post > section.post-contact > .section-content > table.table > tbody > tr', els => els.map(el => el.innerText));
                } catch (error) {
                    console.log('Không tìm thấy nội dung liên hệ:', error);
                    contactContent = ['Không có nội dung'];
                }

                detailData.contact = {
                    header: contactHeader,
                    content: contactContent
                };
                console.log('Thông tin liên hệ:', detailData.contact);

                await pageDetail.close();
                console.log('>> Đã đóng tab ' + link);
                resolve(detailData);
            } catch (error) {
                console.log('Lấy data detail lỗi: ' + error);
                reject(error);
            }
        });

        // Duyệt qua từng link chi tiết và lấy dữ liệu
        for (let link of detailLinks) {
            const detailData = await scraperDetail(link);
            console.log('Dữ liệu chi tiết:', detailData);
            detailDataArray.push(detailData); // Lưu trữ dữ liệu chi tiết vào mảng
        }

        scrapeData.body = detailDataArray; // Gán mảng detailDataArray vào scrapeData.body
        await newPage.close();
        console.log('>> Trình duyệt đã đóng');
        resolve(scrapeData);
    } catch (error) {
        console.log('Lỗi ở scraper: ' + error);
        reject(error);
    }
});

module.exports = {
    scrapeCategory,
    scraper,
};
