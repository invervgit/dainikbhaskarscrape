// ================================================
// NewsLens — Smart News Article Scraper
// ================================================

(function () {
    'use strict';

    // ========== i18n Translations ==========
    const i18n = {
        en: {
            heroTitle: 'Extract News Articles<br><span class="gradient-text">Beautifully & Instantly</span>',
            heroDesc: 'Paste any Dainik Bhaskar or news article link below. We\'ll extract the full content, images, and metadata in a clean, readable format.',
            inputPlaceholder: 'Paste article URL here...',
            extractBtn: 'Extract',
            bulkMode: 'Bulk Mode — Multiple Links',
            bulkPlaceholder: 'Paste multiple URLs, one per line...',
            extractAll: 'Extract All Articles',
            qf1: '100% Free',
            qf2: 'No Backend',
            qf3: 'Hindi & English',
            qf4: 'Dark Mode',
            loadingTitle: 'Extracting Article...',
            loadingSub: 'This usually takes a few seconds',
            step1: 'Fetching page',
            step2: 'Parsing content',
            step3: 'Formatting',
            errorTitle: 'Extraction Failed',
            errorDesc: 'Could not extract the article. Please check the URL and try again.',
            retry: 'Try Again',
            goBack: 'Go Back',
            newExtraction: 'New Extraction',
            keyHighlights: 'Key Highlights',
            articleImages: 'Article Images',
            viewJson: 'View Raw JSON Data',
            historyTitle: 'Extraction History',
            clearAll: 'Clear All',
            noHistory: 'No articles extracted yet',
            copied: 'Copied to clipboard!',
            downloaded: 'Article downloaded!',
            translating: 'Translating...',
            translateError: 'Translation failed. Try again.',
            translated: 'Showing translated version',
            showOriginal: 'Show Original',
        },
        hi: {
            heroTitle: 'समाचार लेख निकालें<br><span class="gradient-text">सुंदर और तुरंत</span>',
            heroDesc: 'नीचे किसी भी दैनिक भास्कर या समाचार लेख का लिंक पेस्ट करें। हम पूरी सामग्री, चित्र और मेटाडेटा को एक स्वच्छ, पठनीय प्रारूप में निकालेंगे।',
            inputPlaceholder: 'लेख का URL यहाँ पेस्ट करें...',
            extractBtn: 'निकालें',
            bulkMode: 'बल्क मोड — एकाधिक लिंक',
            bulkPlaceholder: 'एकाधिक URLs पेस्ट करें, प्रति पंक्ति एक...',
            extractAll: 'सभी लेख निकालें',
            qf1: '100% मुफ्त',
            qf2: 'कोई बैकएंड नहीं',
            qf3: 'हिंदी और अंग्रेजी',
            qf4: 'डार्क मोड',
            loadingTitle: 'लेख निकाला जा रहा है...',
            loadingSub: 'इसमें कुछ सेकंड लगते हैं',
            step1: 'पेज लाया जा रहा है',
            step2: 'सामग्री पार्स हो रही है',
            step3: 'फ़ॉर्मेटिंग',
            errorTitle: 'निकालना विफल',
            errorDesc: 'लेख निकाल नहीं सका। कृपया URL जांचें और पुन: प्रयास करें।',
            retry: 'पुन: प्रयास',
            goBack: 'वापस जाएं',
            newExtraction: 'नया निष्कर्षण',
            keyHighlights: 'मुख्य बातें',
            articleImages: 'लेख के चित्र',
            viewJson: 'रॉ JSON डेटा देखें',
            historyTitle: 'निष्कर्षण इतिहास',
            clearAll: 'सब हटाएं',
            noHistory: 'अभी तक कोई लेख नहीं निकाला गया',
            copied: 'क्लिपबोर्ड पर कॉपी हो गया!',
            downloaded: 'लेख डाउनलोड हो गया!',
            translating: 'अनुवाद हो रहा है...',
            translateError: 'अनुवाद विफल। पुन: प्रयास करें।',
            translated: 'अनुवादित संस्करण दिखा रहे हैं',
            showOriginal: 'मूल दिखाएं',
        }
    };

    // ========== App State ==========
    const state = {
        theme: localStorage.getItem('nl-theme') || 'light',
        lang: localStorage.getItem('nl-lang') || 'en',
        history: JSON.parse(localStorage.getItem('nl-history') || '[]'),
        extractedData: null,
        originalContent: '',
        translatedContent: '',
        isTranslated: false,
        fontSize: 'fs-md',
        corsProxies: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/',
        ],
    };

    // ========== DOM Cache ==========
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const dom = {};

    function cacheDom() {
        // Sections
        dom.searchHero = $('#searchHero');
        dom.loadingSection = $('#loadingSection');
        dom.errorSection = $('#errorSection');
        dom.resultsSection = $('#resultsSection');

        // Inputs
        dom.urlInput = $('#urlInput');
        dom.clearBtn = $('#clearBtn');
        dom.scrapeBtn = $('#scrapeBtn');
        dom.bulkToggleBtn = $('#bulkToggleBtn');
        dom.bulkBox = $('#bulkBox');
        dom.bulkUrls = $('#bulkUrls');
        dom.bulkScrapeBtn = $('#bulkScrapeBtn');

        // Loading
        dom.pstep1 = $('#pstep1');
        dom.pstep2 = $('#pstep2');
        dom.pstep3 = $('#pstep3');
        dom.pline1 = $('#pline1');
        dom.pline2 = $('#pline2');

        // Error
        dom.errorMessage = $('#errorMessage');
        dom.retryBtn = $('#retryBtn');
        dom.errorBackBtn = $('#errorBackBtn');

        // Reader
        dom.backBtn = $('#backBtn');
        dom.sourceFavicon = $('#sourceFavicon');
        dom.sourceName = $('#sourceName');
        dom.sourceDate = $('#sourceDate');
        dom.readerHero = $('#readerHero');
        dom.heroImage = $('#heroImage');
        dom.heroCaption = $('#heroCaption');
        dom.readerCats = $('#readerCats');
        dom.readerTitle = $('#readerTitle');
        dom.readerSubtitle = $('#readerSubtitle');
        dom.metaAuthor = $('#metaAuthor');
        dom.authorName = $('#authorName');
        dom.metaDate = $('#metaDate');
        dom.dateName = $('#dateName');
        dom.metaLocation = $('#metaLocation');
        dom.locationName = $('#locationName');
        dom.readTime = $('#readTime');
        dom.readerHighlights = $('#readerHighlights');
        dom.highlightsList = $('#highlightsList');
        dom.readerContent = $('#readerContent');
        dom.readerGallery = $('#readerGallery');
        dom.galleryGrid = $('#galleryGrid');
        dom.readerFooter = $('#readerFooter');
        dom.readerTags = $('#readerTags');
        dom.originalLink = $('#originalLink');

        // Actions
        dom.translateBtn = $('#translateBtn');
        dom.translateNotice = $('#translateNotice');
        dom.translateNoticeText = $('#translateNoticeText');
        dom.showOriginalBtn = $('#showOriginalBtn');
        dom.fontUpBtn = $('#fontUpBtn');
        dom.fontDownBtn = $('#fontDownBtn');
        dom.copyBtn = $('#copyBtn');
        dom.downloadBtn = $('#downloadBtn');
        dom.shareBtn = $('#shareBtn');
        dom.rawToggle = $('#rawToggle');
        dom.rawPre = $('#rawPre');

        // Theme / Lang
        dom.themeToggle = $('#themeToggle');
        dom.themeIcon = $('#themeIcon');
        dom.langSwitcher = $('#langSwitcher');

        // History
        dom.historyToggle = $('#historyToggle');
        dom.historyCount = $('#historyCount');
        dom.historyPanel = $('#historyPanel');
        dom.historyOverlay = $('#historyOverlay');
        dom.historyClose = $('#historyClose');
        dom.historyBody = $('#historyBody');
        dom.historyList = $('#historyList');
        dom.historyEmpty = $('#historyEmpty');
        dom.clearHistoryBtn = $('#clearHistoryBtn');

        // Modal
        dom.imgModal = $('#imgModal');
        dom.imgModalBg = $('#imgModalBg');
        dom.imgModalClose = $('#imgModalClose');
        dom.imgModalImg = $('#imgModalImg');
        dom.imgModalCap = $('#imgModalCap');

        // Toast
        dom.toast = $('#toast');
        dom.toastIcon = $('#toastIcon');
        dom.toastMsg = $('#toastMsg');
    }

    // ========== Init ==========
    function init() {
        cacheDom();
        applyTheme(state.theme);
        applyLang(state.lang);
        updateHistoryUI();
        bindEvents();
    }

    // ========== Events ==========
    function bindEvents() {
        // Scrape
        dom.scrapeBtn.addEventListener('click', handleScrape);
        dom.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleScrape();
        });

        // Clear
        dom.urlInput.addEventListener('input', () => {
            dom.clearBtn.classList.toggle('hidden', !dom.urlInput.value);
        });
        dom.clearBtn.addEventListener('click', () => {
            dom.urlInput.value = '';
            dom.clearBtn.classList.add('hidden');
            dom.urlInput.focus();
        });

        // Bulk
        dom.bulkToggleBtn.addEventListener('click', () => {
            dom.bulkBox.classList.toggle('hidden');
        });
        dom.bulkScrapeBtn.addEventListener('click', handleBulkScrape);

        // Error
        dom.retryBtn.addEventListener('click', handleScrape);
        dom.errorBackBtn.addEventListener('click', showSearch);

        // Back
        dom.backBtn.addEventListener('click', showSearch);

        // Theme
        dom.themeToggle.addEventListener('click', toggleTheme);

        // Language
        dom.langSwitcher.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (btn) {
                const lang = btn.dataset.lang;
                applyLang(lang);
            }
        });

        // History
        dom.historyToggle.addEventListener('click', openHistory);
        dom.historyClose.addEventListener('click', closeHistory);
        dom.historyOverlay.addEventListener('click', closeHistory);
        dom.clearHistoryBtn.addEventListener('click', clearHistory);

        // Reader Actions
        dom.translateBtn.addEventListener('click', handleTranslate);
        dom.showOriginalBtn.addEventListener('click', showOriginalContent);
        dom.fontUpBtn.addEventListener('click', () => changeFontSize(1));
        dom.fontDownBtn.addEventListener('click', () => changeFontSize(-1));
        dom.copyBtn.addEventListener('click', copyArticle);
        dom.downloadBtn.addEventListener('click', downloadArticle);
        dom.shareBtn.addEventListener('click', shareArticle);
        dom.rawToggle.addEventListener('click', () => dom.rawPre.classList.toggle('hidden'));

        // Modal
        dom.imgModalBg.addEventListener('click', closeImgModal);
        dom.imgModalClose.addEventListener('click', closeImgModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeImgModal();
                closeHistory();
            }
        });
    }

    // ========== Theme ==========
    function applyTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('nl-theme', theme);
        dom.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    function toggleTheme() {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    }

    // ========== Language ==========
    function applyLang(lang) {
        state.lang = lang;
        localStorage.setItem('nl-lang', lang);

        // Update toggle
        $$('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });

        // Update all [data-i18n]
        $$('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[lang] && i18n[lang][key]) {
                el.innerHTML = i18n[lang][key];
            }
        });

        // Update placeholders
        $$('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (i18n[lang] && i18n[lang][key]) {
                el.placeholder = i18n[lang][key];
            }
        });
    }

    // ========== Section Visibility ==========
    function showSearch() {
        dom.searchHero.classList.remove('hidden');
        dom.loadingSection.classList.add('hidden');
        dom.errorSection.classList.add('hidden');
        dom.resultsSection.classList.add('hidden');
        dom.scrapeBtn.disabled = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showLoading() {
        dom.searchHero.classList.add('hidden');
        dom.errorSection.classList.add('hidden');
        dom.resultsSection.classList.add('hidden');
        dom.loadingSection.classList.remove('hidden');
        dom.scrapeBtn.disabled = true;

        // Reset steps
        dom.pstep1.className = 'pstep active';
        dom.pstep2.className = 'pstep';
        dom.pstep3.className = 'pstep';
        dom.pline1.className = 'pstep-line';
        dom.pline2.className = 'pstep-line';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateStep(n) {
        if (n >= 2) {
            dom.pstep1.className = 'pstep done';
            dom.pline1.className = 'pstep-line done';
            dom.pstep2.className = 'pstep active';
        }
        if (n >= 3) {
            dom.pstep2.className = 'pstep done';
            dom.pline2.className = 'pstep-line done';
            dom.pstep3.className = 'pstep active';
        }
    }

    function showError(msg) {
        dom.searchHero.classList.add('hidden');
        dom.loadingSection.classList.add('hidden');
        dom.resultsSection.classList.add('hidden');
        dom.errorSection.classList.remove('hidden');
        dom.errorMessage.innerHTML = msg || i18n[state.lang].errorDesc;
        dom.scrapeBtn.disabled = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showResults() {
        dom.searchHero.classList.add('hidden');
        dom.loadingSection.classList.add('hidden');
        dom.errorSection.classList.add('hidden');
        dom.resultsSection.classList.remove('hidden');
        dom.scrapeBtn.disabled = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ========== Scrape Handler ==========
    async function handleScrape() {
        const url = dom.urlInput.value.trim();
        if (!url) { dom.urlInput.focus(); return; }
        if (!isValidUrl(url)) { showError('Please enter a valid URL.'); return; }
        await scrapeUrl(url);
    }

    async function handleBulkScrape() {
        const urls = dom.bulkUrls.value.split('\n').map(u => u.trim()).filter(u => u && isValidUrl(u));
        if (!urls.length) { showError('Please enter at least one valid URL.'); return; }
        await scrapeUrl(urls[0]); // Process first; extend for batch later
    }

    async function scrapeUrl(url) {
        showLoading();
        state.isTranslated = false;
        dom.translateNotice.classList.add('hidden');

        try {
            const html = await fetchWithProxy(url);
            updateStep(2);
            const data = parseArticle(html, url);
            updateStep(3);
            await delay(400);
            state.extractedData = data;
            state.originalContent = data.contentHtml || data.content;
            addToHistory(data);
            displayArticle(data);
        } catch (err) {
            console.error('Scrape error:', err);
            showError(`Could not extract the article.<br><small style="color:var(--text-tertiary)">${esc(err.message || '')}</small>`);
        }
    }

    // ========== Fetch via CORS Proxy ==========
    async function fetchWithProxy(url) {
        let lastErr;
        for (const proxy of state.corsProxies) {
            try {
                const pUrl = proxy + encodeURIComponent(url);
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);
                const res = await fetch(pUrl, {
                    signal: controller.signal,
                    headers: { 'Accept': 'text/html' }
                });
                clearTimeout(timeout);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const html = await res.text();
                if (html.length < 500) throw new Error('Response too short');
                return html;
            } catch (e) {
                lastErr = e;
                continue;
            }
        }
        throw new Error('All proxies failed. ' + (lastErr ? lastErr.message : ''));
    }

    // ========== Parse Article ==========
    function parseArticle(html, originalUrl) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const data = {
            url: originalUrl,
            title: '', subtitle: '', author: '', date: '', dateRaw: '',
            location: '', content: '', contentHtml: '',
            heroImage: '', heroCaption: '', images: [],
            categories: [], tags: [], keyPoints: [], readTime: '',
            domain: ''
        };

        try { data.domain = new URL(originalUrl).hostname; } catch (e) {}

        // Title
        data.title = meta(doc, 'og:title')
            || text(doc, 'h1.article-heading, h1._1Y9SF, h1.headline, .story-headline h1, h1[class*="title"], h1[class*="heading"]')
            || text(doc, 'h1') || doc.title || '';
        data.title = data.title.replace(/\s*[-|].*$/i, '').trim();

        // Subtitle
        data.subtitle = meta(doc, 'og:description')
            || text(doc, '.article-subheading, .story-subheadline, h2.sub-headline, [class*="subhead"], [class*="summary"]')
            || '';

        // Author
        data.author = text(doc, '.author-name, .article-author, [class*="author"] a, [class*="author"] span, .byline, [rel="author"]')
            || meta(doc, 'article:author') || meta(doc, 'author') || '';

        // Date
        data.dateRaw = meta(doc, 'article:published_time') || meta(doc, 'og:updated_time')
            || text(doc, '.article-date, .publish-date, time, [class*="date"], .story-date') || '';
        data.date = formatDate(data.dateRaw);

        // Location
        data.location = text(doc, '.article-location, .story-location, [class*="location"], .city-name') || '';

        // Hero image
        data.heroImage = meta(doc, 'og:image')
            || attr(doc, '.article-image img, .story-image img, .hero-image img, figure img', 'src') || '';
        data.heroCaption = text(doc, 'figure figcaption, .image-caption')
            || attr(doc, 'figure img, .article-image img', 'alt') || '';

        // Content
        const contentSels = [
            '.article-content', '.story-content', '.article-body', '.story-body',
            '.story-details', '.article_content', '[class*="article-content"]',
            '[class*="story-content"]', '.db_sty_cnt', '.StoryBody', '.contentArea',
            '.news-content', '.detail-story', '.entry-content', '#article-body',
            '.main-story', '.full-story', 'article .content', 'article'
        ];

        let contentEl = null;
        for (const sel of contentSels) {
            contentEl = doc.querySelector(sel);
            if (contentEl && contentEl.textContent.trim().length > 100) break;
        }

        if (contentEl) {
            const clone = contentEl.cloneNode(true);
            const removeSels = [
                'script', 'style', 'iframe', 'nav', 'header', 'footer',
                '.ad', '.ads', '[class*="ad-"]', '[class*="ads-"]',
                '.social-share', '.share-buttons', '.related-articles',
                '.comments', '.newsletter', '.sidebar', '.widget', '.popup',
                '[class*="social"]', '[class*="share"]', '[class*="related"]',
                '[class*="comment"]', '[class*="newsletter"]', '[class*="promo"]',
                '.bread-crumb', '.breadcrumb',
                '[id*="taboola"]', '[id*="outbrain"]'
            ];
            removeSels.forEach(s => clone.querySelectorAll(s).forEach(e => e.remove()));
            data.contentHtml = clone.innerHTML.trim();
            data.content = clone.textContent.replace(/\s+/g, ' ').trim();
        } else {
            const ps = [];
            doc.querySelectorAll('p').forEach(p => {
                const t = p.textContent.trim();
                if (t.length > 40 && !/cookie|subscribe|sign.?up/i.test(t)) ps.push(t);
            });
            data.content = ps.join('\n\n');
            data.contentHtml = ps.map(p => `<p>${esc(p)}</p>`).join('');
        }

        // Images
        const seen = new Set();
        if (data.heroImage) seen.add(data.heroImage);
        doc.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
            if (src && !seen.has(src) && isContentImage(src)) {
                seen.add(src);
                data.images.push({ src, alt: img.getAttribute('alt') || '' });
            }
        });

        // Categories
        doc.querySelectorAll('.breadcrumb a, .bread-crumb a, nav[class*="bread"] a, [class*="category"] a').forEach(a => {
            const t = a.textContent.trim();
            if (t && !/home/i.test(t) && t.length < 40) data.categories.push(t);
        });
        if (!data.categories.length) {
            const cs = meta(doc, 'article:section');
            if (cs) data.categories.push(cs);
        }

        // Tags
        const kw = meta(doc, 'keywords') || meta(doc, 'news_keywords') || '';
        if (kw) data.tags = kw.split(',').map(t => t.trim()).filter(t => t && t.length < 50);
        doc.querySelectorAll('.tags a, [class*="tag"] a, .keywords a').forEach(a => {
            const t = a.textContent.trim();
            if (t && !data.tags.includes(t) && t.length < 50) data.tags.push(t);
        });

        // Key points
        doc.querySelectorAll('.highlights li, .key-points li, [class*="highlight"] li, .story-highlights li').forEach(li => {
            const t = li.textContent.trim();
            if (t) data.keyPoints.push(t);
        });
        if (!data.keyPoints.length && data.content) {
            data.keyPoints = autoKeyPoints(data.content);
        }

        // Read time
        const wc = data.content.split(/\s+/).length;
        data.readTime = Math.max(1, Math.ceil(wc / 200)) + ' min read';

        return data;
    }

    function autoKeyPoints(content) {
        const sents = content.replace(/([।!?.])\s/g, '$1|||').split('|||')
            .map(s => s.trim()).filter(s => s.length > 30 && s.length < 200 && !s.includes('http'));
        return sents.slice(0, 4);
    }

    // ========== Display Article ==========
    function displayArticle(data) {
        // Source
        try {
            dom.sourceFavicon.src = `https://www.google.com/s2/favicons?domain=${data.domain}&sz=32`;
        } catch (e) {}
        dom.sourceName.textContent = data.domain || 'News Source';
        dom.sourceDate.textContent = data.date || '';
        dom.originalLink.href = data.url;

        // Hero
        if (data.heroImage) {
            dom.heroImage.src = data.heroImage;
            dom.heroImage.alt = data.title;
            dom.readerHero.classList.remove('hidden');
            dom.heroImage.onerror = () => dom.readerHero.classList.add('hidden');
            dom.heroCaption.textContent = data.heroCaption || '';
            dom.readerHero.onclick = () => openImgModal(data.heroImage, data.heroCaption);
        } else {
            dom.readerHero.classList.add('hidden');
        }

        // Categories
        if (data.categories.length) {
            dom.readerCats.innerHTML = data.categories.map(c => `<span class="cat-chip">${esc(c)}</span>`).join('');
            dom.readerCats.classList.remove('hidden');
        } else {
            dom.readerCats.innerHTML = '';
        }

        // Title
        dom.readerTitle.textContent = data.title || 'Title Not Found';

        // Subtitle
        if (data.subtitle && data.subtitle !== data.title) {
            dom.readerSubtitle.textContent = data.subtitle;
            dom.readerSubtitle.classList.remove('hidden');
        } else {
            dom.readerSubtitle.classList.add('hidden');
        }

        // Meta
        if (data.author) {
            dom.authorName.textContent = data.author;
            dom.metaAuthor.classList.remove('hidden');
        } else dom.metaAuthor.classList.add('hidden');

        if (data.date) {
            dom.dateName.textContent = data.date;
            dom.metaDate.classList.remove('hidden');
        } else dom.metaDate.classList.add('hidden');

        if (data.location) {
            dom.locationName.textContent = data.location;
            dom.metaLocation.classList.remove('hidden');
        } else dom.metaLocation.classList.add('hidden');

        dom.readTime.textContent = data.readTime || '';

        // Highlights
        if (data.keyPoints.length) {
            dom.highlightsList.innerHTML = data.keyPoints.map(p => `<li>${esc(p)}</li>`).join('');
            dom.readerHighlights.classList.remove('hidden');
        } else dom.readerHighlights.classList.add('hidden');

        // Content
        if (data.contentHtml) {
            dom.readerContent.innerHTML = sanitize(data.contentHtml);
        } else if (data.content) {
            dom.readerContent.innerHTML = data.content.split('\n\n').filter(p => p.trim())
                .map(p => `<p>${esc(p)}</p>`).join('');
        } else {
            dom.readerContent.innerHTML = '<p class="no-content">Could not extract article content.</p>';
        }

        // Gallery
        if (data.images.length) {
            dom.galleryGrid.innerHTML = data.images.slice(0, 12).map(img =>
                `<div class="gallery-item" data-src="${escAttr(img.src)}" data-alt="${escAttr(img.alt)}">
                    <img src="${escAttr(img.src)}" alt="${escAttr(img.alt)}" loading="lazy" onerror="this.parentElement.style.display='none'">
                </div>`
            ).join('');
            dom.readerGallery.classList.remove('hidden');

            // Bind gallery clicks
            dom.galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', () => {
                    openImgModal(item.dataset.src, item.dataset.alt);
                });
            });
        } else dom.readerGallery.classList.add('hidden');

        // Tags
        if (data.tags.length) {
            const existingIcon = dom.readerTags.querySelector('i');
            dom.readerTags.innerHTML = '';
            dom.readerTags.appendChild(existingIcon || createEl('i', { className: 'fas fa-tags' }));
            data.tags.slice(0, 15).forEach(t => {
                const span = createEl('span', { className: 'rtag', textContent: t });
                dom.readerTags.appendChild(span);
            });
            dom.readerFooter.classList.remove('hidden');
        } else dom.readerFooter.classList.add('hidden');

        // Raw
        dom.rawPre.textContent = JSON.stringify(data, null, 2);
        dom.rawPre.classList.add('hidden');

        // Reset font size
        dom.readerContent.className = 'reader-content ' + state.fontSize;

        showResults();
    }

    // ========== Translation ==========
    async function handleTranslate() {
        if (!state.extractedData) return;

        if (state.isTranslated) {
            showOriginalContent();
            return;
        }

        const content = state.originalContent;
        if (!content) return;

        // Detect if Hindi → translate to English, else translate to Hindi
        const isHindi = /[\u0900-\u097F]/.test(content.substring(0, 200));
        const sourceLang = isHindi ? 'hi' : 'en';
        const targetLang = isHindi ? 'en' : 'hi';

        dom.translateBtn.disabled = true;
        toast(i18n[state.lang].translating, 'fa-spinner fa-spin');

        try {
            const plainText = dom.readerContent.textContent;
            // Using free Google Translate API (unofficial)
            const translated = await translateText(plainText, sourceLang, targetLang);

            if (translated) {
                state.translatedContent = translated;
                state.isTranslated = true;

                // Display translated
                dom.readerContent.innerHTML = translated.split('\n').filter(p => p.trim())
                    .map(p => `<p>${esc(p)}</p>`).join('');

                dom.translateNotice.classList.remove('hidden');
                dom.translateNoticeText.textContent =
                    `${i18n[state.lang].translated} (${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()})`;

                toast(i18n[state.lang].translated, 'fa-check-circle');
            }
        } catch (err) {
            console.error('Translation error:', err);
            toast(i18n[state.lang].translateError, 'fa-exclamation-circle');
        }

        dom.translateBtn.disabled = false;
    }

    async function translateText(text, from, to) {
        // Chunk text if too long (Google translate limit ~5000 chars)
        const chunks = chunkText(text, 4500);
        let result = '';

        for (const chunk of chunks) {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(chunk)}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json && json[0]) {
                json[0].forEach(part => {
                    if (part[0]) result += part[0];
                });
            }
        }

        return result;
    }

    function chunkText(text, maxLen) {
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            let end = Math.min(start + maxLen, text.length);
            // Try to break at sentence boundary
            if (end < text.length) {
                const lastPeriod = text.lastIndexOf('.', end);
                const lastQuestion = text.lastIndexOf('?', end);
                const lastDanda = text.lastIndexOf('।', end);
                const bestBreak = Math.max(lastPeriod, lastQuestion, lastDanda);
                if (bestBreak > start) end = bestBreak + 1;
            }
            chunks.push(text.substring(start, end));
            start = end;
        }
        return chunks;
    }

    function showOriginalContent() {
        state.isTranslated = false;
        dom.readerContent.innerHTML = sanitize(state.originalContent);
        dom.translateNotice.classList.add('hidden');
    }

    // ========== Font Size ==========
    function changeFontSize(dir) {
        const sizes = ['fs-sm', 'fs-md', 'fs-lg', 'fs-xl'];
        let idx = sizes.indexOf(state.fontSize);
        idx = Math.max(0, Math.min(sizes.length - 1, idx + dir));
        state.fontSize = sizes[idx];
        dom.readerContent.className = 'reader-content ' + state.fontSize;
    }

    // ========== History ==========
    function addToHistory(data) {
        const entry = {
            id: Date.now(),
            url: data.url,
            title: data.title,
            image: data.heroImage,
            date: data.date,
            domain: data.domain,
            timestamp: new Date().toISOString()
        };

        // Remove duplicate
        state.history = state.history.filter(h => h.url !== data.url);
        state.history.unshift(entry);

        // Keep max 50
        if (state.history.length > 50) state.history = state.history.slice(0, 50);

        localStorage.setItem('nl-history', JSON.stringify(state.history));
        updateHistoryUI();
    }

    function updateHistoryUI() {
        const count = state.history.length;
        dom.historyCount.textContent = count;
        dom.historyCount.dataset.count = count;

        if (count === 0) {
            dom.historyEmpty.classList.remove('hidden');
            dom.historyList.classList.add('hidden');
        } else {
            dom.historyEmpty.classList.add('hidden');
            dom.historyList.classList.remove('hidden');
            dom.historyList.innerHTML = state.history.map(h => `
                <div class="history-item" data-url="${escAttr(h.url)}">
                    <img class="history-thumb" src="${escAttr(h.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 40%22><rect fill=%22%23e2e8f0%22 width=%2260%22 height=%2240%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22 font-size=%2212%22>N/A</text></svg>')}" 
                        alt="" onerror="this.style.display='none'">
                    <div class="history-info">
                        <div class="history-info-title">${esc(h.title || 'Untitled')}</div>
                        <div class="history-info-meta">
                            <span>${esc(h.domain || '')}</span>
                            <span>•</span>
                            <span>${timeAgo(h.timestamp)}</span>
                        </div>
                    </div>
                    <button class="history-delete" data-id="${h.id}" title="Remove">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `).join('');

            // Bind clicks
            dom.historyList.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.history-delete')) return;
                    const url = item.dataset.url;
                    dom.urlInput.value = url;
                    dom.clearBtn.classList.remove('hidden');
                    closeHistory();
                    handleScrape();
                });
            });

            dom.historyList.querySelectorAll('.history-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    state.history = state.history.filter(h => h.id !== id);
                    localStorage.setItem('nl-history', JSON.stringify(state.history));
                    updateHistoryUI();
                });
            });
        }
    }

    function openHistory() {
        dom.historyPanel.classList.add('open');
        dom.historyOverlay.classList.remove('hidden');
        setTimeout(() => dom.historyOverlay.classList.add('show'), 10);
    }

    function closeHistory() {
        dom.historyPanel.classList.remove('open');
        dom.historyOverlay.classList.remove('show');
        setTimeout(() => dom.historyOverlay.classList.add('hidden'), 300);
    }

    function clearHistory() {
        if (!confirm('Clear all history?')) return;
        state.history = [];
        localStorage.removeItem('nl-history');
        updateHistoryUI();
    }

    // ========== Actions ==========
    async function copyArticle() {
        if (!state.extractedData) return;
        const d = state.extractedData;
        const text = `${d.title}\n\n${d.subtitle || ''}\n\n${d.content}\n\nSource: ${d.url}`;
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        toast(i18n[state.lang].copied);
    }

    function downloadArticle() {
        if (!state.extractedData) return;
        const d = state.extractedData;
        let t = `TITLE: ${d.title}\n${'='.repeat(50)}\n\n`;
        if (d.subtitle) t += `SUBTITLE: ${d.subtitle}\n\n`;
        if (d.author) t += `AUTHOR: ${d.author}\n`;
        if (d.date) t += `DATE: ${d.date}\n`;
        if (d.location) t += `LOCATION: ${d.location}\n`;
        t += `SOURCE: ${d.url}\n${'─'.repeat(50)}\n\n`;
        if (d.keyPoints.length) {
            t += `KEY HIGHLIGHTS:\n`;
            d.keyPoints.forEach((p, i) => t += `  ${i + 1}. ${p}\n`);
            t += `\n${'─'.repeat(50)}\n\n`;
        }
        t += `ARTICLE:\n\n${d.content}\n\n`;
        if (d.tags.length) t += `TAGS: ${d.tags.join(', ')}\n`;
        if (d.heroImage) t += `\nHERO IMAGE: ${d.heroImage}\n`;
        if (d.images.length) {
            t += `\nIMAGES:\n`;
            d.images.forEach((img, i) => t += `  ${i + 1}. ${img.src}\n`);
        }

        const blob = new Blob([t], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `article-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast(i18n[state.lang].downloaded);
    }

    async function shareArticle() {
        if (!state.extractedData) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: state.extractedData.title,
                    text: state.extractedData.subtitle || state.extractedData.title,
                    url: state.extractedData.url,
                });
            } catch (e) {
                if (e.name !== 'AbortError') copyArticle();
            }
        } else {
            copyArticle();
        }
    }

    // ========== Image Modal ==========
    function openImgModal(src, caption) {
        dom.imgModalImg.src = src;
        dom.imgModalCap.textContent = caption || '';
        dom.imgModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeImgModal() {
        dom.imgModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ========== Toast ==========
    function toast(msg, iconClass) {
        dom.toastMsg.textContent = msg;
        dom.toastIcon.className = 'fas ' + (iconClass || 'fa-check-circle') + ' toast-icon';
        dom.toast.classList.add('visible');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => dom.toast.classList.remove('visible'), 3000);
    }

    // ========== Utilities ==========
    function isValidUrl(s) {
        try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
        catch (e) { return false; }
    }

    function meta(doc, prop) {
        const el = doc.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
        return el ? (el.getAttribute('content') || '').trim() : '';
    }

    function text(doc, sel) {
        const el = doc.querySelector(sel);
        return el ? el.textContent.trim() : '';
    }

    function attr(doc, sel, a) {
        const el = doc.querySelector(sel);
        return el ? (el.getAttribute(a) || '').trim() : '';
    }

    function formatDate(raw) {
        if (!raw) return '';
        try {
            const d = new Date(raw);
            if (isNaN(d.getTime())) return raw;
            return d.toLocaleDateString('en-IN', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) { return raw; }
    }

    function timeAgo(iso) {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return mins + 'm ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        const days = Math.floor(hrs / 24);
        if (days < 7) return days + 'd ago';
        return new Date(iso).toLocaleDateString();
    }

    function isContentImage(src) {
        if (!src) return false;
        const l = src.toLowerCase();
        const exclude = ['logo', 'icon', 'favicon', 'avatar', 'badge', 'button', 'arrow',
            'social', 'share', 'ad-', 'tracker', 'pixel', 'blank', '1x1', 'spacer',
            'widget', 'emoji', 'data:image', '.svg', 'base64',
            'facebook.com', 'twitter.com', 'google.com/ads'];
        if (exclude.some(p => l.includes(p))) return false;
        return /\.(jpg|jpeg|png|webp|avif)/i.test(l) || l.includes('image');
    }

    function sanitize(html) {
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '').replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    }

    function esc(t) {
        const d = document.createElement('div');
        d.textContent = t || '';
        return d.innerHTML;
    }

    function escAttr(t) {
        return (t || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
    }

    function createEl(tag, props) {
        const el = document.createElement(tag);
        Object.assign(el, props || {});
        return el;
    }

    function delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    // ========== Boot ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
