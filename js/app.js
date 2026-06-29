// ============================================
// Dainik Bhaskar News Scraper - Main App
// ============================================

class NewsScraper {
    constructor() {
        // CORS Proxies (free, no API key needed)
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/',
        ];
        
        this.currentProxyIndex = 0;
        this.extractedData = null;
        
        this.initElements();
        this.bindEvents();
    }

    // ---- Initialize DOM Elements ----
    initElements() {
        // Input elements
        this.urlInput = document.getElementById('urlInput');
        this.scrapeBtn = document.getElementById('scrapeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.bulkModeBtn = document.getElementById('bulkModeBtn');
        this.bulkInput = document.getElementById('bulkInput');
        this.bulkUrls = document.getElementById('bulkUrls');
        this.bulkScrapeBtn = document.getElementById('bulkScrapeBtn');
        
        // State sections
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.results = document.getElementById('results');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Loading steps
        this.step1 = document.getElementById('step1');
        this.step2 = document.getElementById('step2');
        this.step3 = document.getElementById('step3');
        
        // Article elements
        this.articleTitle = document.getElementById('articleTitle');
        this.articleSubtitle = document.getElementById('articleSubtitle');
        this.articleDate = document.getElementById('articleDate');
        this.articleAuthor = document.getElementById('articleAuthor');
        this.articleLocation = document.getElementById('articleLocation');
        this.articleBody = document.getElementById('articleBody');
        this.heroImage = document.getElementById('heroImage');
        this.heroImageContainer = document.getElementById('heroImageContainer');
        this.imageCaption = document.getElementById('imageCaption');
        this.categoryTags = document.getElementById('categoryTags');
        this.keyPointsList = document.getElementById('keyPointsList');
        this.keyPoints = document.getElementById('keyPoints');
        this.galleryGrid = document.getElementById('galleryGrid');
        this.imageGallery = document.getElementById('imageGallery');
        this.articleTags = document.getElementById('articleTags');
        this.tagsSection = document.getElementById('tagsSection');
        this.authorInfo = document.getElementById('authorInfo');
        this.readTime = document.getElementById('readTime');
        this.locationInfo = document.getElementById('locationInfo');
        this.originalLink = document.getElementById('originalLink');
        
        // Action buttons
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.rawDataToggle = document.getElementById('rawDataToggle');
        this.rawData = document.getElementById('rawData');
        
        // Modal
        this.imageModal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalCaption = document.getElementById('modalCaption');
        this.modalClose = document.getElementById('modalClose');
        
        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
    }

    // ---- Bind Events ----
    bindEvents() {
        // Main scrape
        this.scrapeBtn.addEventListener('click', () => this.handleScrape());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleScrape();
        });
        
        // Clear button
        this.urlInput.addEventListener('input', () => {
            this.clearBtn.classList.toggle('hidden', !this.urlInput.value);
        });
        this.clearBtn.addEventListener('click', () => {
            this.urlInput.value = '';
            this.clearBtn.classList.add('hidden');
            this.urlInput.focus();
        });
        
        // Bulk mode
        this.bulkModeBtn.addEventListener('click', () => {
            this.bulkInput.classList.toggle('hidden');
            const isOpen = !this.bulkInput.classList.contains('hidden');
            this.bulkModeBtn.innerHTML = isOpen 
                ? '<i class="fas fa-times"></i> Close Bulk Mode'
                : '<i class="fas fa-list"></i> Bulk Mode (Multiple Links)';
        });
        
        this.bulkScrapeBtn.addEventListener('click', () => this.handleBulkScrape());
        
        // Example links
        document.querySelectorAll('.example-link').forEach(btn => {
            btn.addEventListener('click', () => {
                this.urlInput.value = btn.dataset.url;
                this.clearBtn.classList.remove('hidden');
                this.handleScrape();
            });
        });
        
        // Action buttons
        this.copyBtn.addEventListener('click', () => this.copyArticle());
        this.downloadBtn.addEventListener('click', () => this.downloadArticle());
        this.shareBtn.addEventListener('click', () => this.shareArticle());
        this.retryBtn.addEventListener('click', () => this.handleScrape());
        
        // Raw data toggle
        this.rawDataToggle.addEventListener('click', () => {
            this.rawData.classList.toggle('hidden');
        });
        
        // Modal
        this.modalClose.addEventListener('click', () => this.closeModal());
        document.querySelector('.modal-overlay')?.addEventListener('click', () => this.closeModal());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    // ---- Main Scrape Handler ----
    async handleScrape() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a URL');
            this.urlInput.focus();
            return;
        }
        
        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL');
            return;
        }
        
        await this.scrapeUrl(url);
    }

    // ---- Bulk Scrape Handler ----
    async handleBulkScrape() {
        const urls = this.bulkUrls.value
            .split('\n')
            .map(u => u.trim())
            .filter(u => u && this.isValidUrl(u));
        
        if (urls.length === 0) {
            this.showError('Please enter at least one valid URL');
            return;
        }
        
        // For now, scrape the first URL (can be extended for batch)
        for (const url of urls) {
            await this.scrapeUrl(url);
            break; // Remove this to process all
        }
    }

    // ---- Scrape a URL ----
    async scrapeUrl(url) {
        this.showLoading();
        this.currentProxyIndex = 0;
        
        try {
            const html = await this.fetchWithProxy(url);
            this.updateStep(2);
            
            const data = this.parseArticle(html, url);
            this.updateStep(3);
            
            await this.delay(500); // Brief pause for UX
            
            this.extractedData = data;
            this.displayArticle(data);
            
        } catch (err) {
            console.error('Scrape error:', err);
            this.showError(
                `Failed to extract article. ${err.message || 'The website might be blocking automated requests.'}
                <br><br>
                <strong>Tip:</strong> Try opening the link in a new tab, copy the page content, and check if the URL is correct.`
            );
        }
    }

    // ---- Fetch HTML via CORS Proxy ----
    async fetchWithProxy(url) {
        let lastError = null;
        
        for (let i = 0; i < this.corsProxies.length; i++) {
            try {
                const proxyUrl = this.corsProxies[i] + encodeURIComponent(url);
                
                const response = await fetch(proxyUrl, {
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml',
                    },
                    signal: AbortSignal.timeout(15000) // 15s timeout
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const html = await response.text();
                
                if (html.length < 500) throw new Error('Response too short');
                
                this.updateStep(1, true);
                return html;
                
            } catch (err) {
                lastError = err;
                console.warn(`Proxy ${i + 1} failed:`, err.message);
                continue;
            }
        }
        
        throw new Error(`All proxies failed. Last error: ${lastError?.message}`);
    }

    // ---- Parse Article from HTML ----
    parseArticle(html, originalUrl) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const data = {
            url: originalUrl,
            title: '',
            subtitle: '',
            author: '',
            date: '',
            location: '',
            content: '',
            contentHtml: '',
            heroImage: '',
            heroImageCaption: '',
            images: [],
            categories: [],
            tags: [],
            keyPoints: [],
            readTime: '',
        };
        
        // ---- Extract Title ----
        data.title = this.getMetaContent(doc, 'og:title') 
            || this.getText(doc, 'h1.article-heading, h1._1Y9SF, h1.headline, .story-headline h1, h1[class*="title"], h1[class*="heading"], .article-title h1')
            || this.getText(doc, 'h1')
            || doc.title || '';
        
        data.title = data.title.replace(/\s*[-|].*Dainik Bhaskar.*$/i, '').trim();
        
        // ---- Extract Subtitle / Description ----
        data.subtitle = this.getMetaContent(doc, 'og:description')
            || this.getText(doc, '.article-subheading, .story-subheadline, h2.sub-headline, .article-subtitle, [class*="subhead"], [class*="summary"]')
            || '';
        
        // ---- Extract Author ----
        data.author = this.getText(doc, '.author-name, .article-author, [class*="author"] a, [class*="author"] span, .byline, [rel="author"], .contributor-name')
            || this.getMetaContent(doc, 'article:author')
            || this.getMetaContent(doc, 'author')
            || 'Dainik Bhaskar';
        
        // ---- Extract Date ----
        data.date = this.getMetaContent(doc, 'article:published_time')
            || this.getMetaContent(doc, 'og:updated_time')
            || this.getText(doc, '.article-date, .publish-date, time, [class*="date"], [class*="time"], .story-date, .updated-date')
            || '';
        
        if (data.date) {
            try {
                const d = new Date(data.date);
                if (!isNaN(d.getTime())) {
                    data.date = d.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            } catch (e) {}
        }
        
        // ---- Extract Location ----
        data.location = this.getText(doc, '.article-location, .story-location, [class*="location"], .city-name, .place')
            || '';
        
        // ---- Extract Hero Image ----
        data.heroImage = this.getMetaContent(doc, 'og:image')
            || this.getAttr(doc, '.article-image img, .story-image img, .hero-image img, .featured-image img, figure img, [class*="article"] img', 'src')
            || '';
        
        data.heroImageCaption = this.getText(doc, '.article-image figcaption, .story-image .caption, figure figcaption, .image-caption')
            || this.getAttr(doc, '.article-image img, figure img', 'alt')
            || '';
        
        // ---- Extract Article Content ----
        const contentSelectors = [
            '.article-content',
            '.story-content',
            '.article-body',
            '.story-body',
            '.story-details',
            '.article_content',
            '[class*="article-content"]',
            '[class*="story-content"]',
            '.db_sty_cnt',        // Dainik Bhaskar specific
            '.StoryBody',
            '.contentArea',
            '.news-content',
            '.detail-story',
            'article .content',
            '.entry-content',
            '#article-body',
            '.main-story',
            '.full-story',
            'article',
        ];
        
        let contentElement = null;
        for (const selector of contentSelectors) {
            contentElement = doc.querySelector(selector);
            if (contentElement && contentElement.textContent.trim().length > 100) {
                break;
            }
        }
        
        if (contentElement) {
            // Remove unwanted elements
            const removeSelectors = [
                'script', 'style', 'iframe', 'nav', 'header', 'footer',
                '.ad', '.ads', '.advertisement', '[class*="ad-"]', '[class*="ads-"]',
                '.social-share', '.share-buttons', '.related-articles',
                '.comments', '.comment-section', '.newsletter',
                '.sidebar', '.widget', '.popup', '.modal',
                '[class*="social"]', '[class*="share"]', '[class*="related"]',
                '[class*="comment"]', '[class*="newsletter"]', '[class*="promo"]',
                '[class*="recommend"]', '.bread-crumb', '.breadcrumb',
                '[id*="taboola"]', '[id*="outbrain"]', '.taboola', '.outbrain',
            ];
            
            const cloned = contentElement.cloneNode(true);
            removeSelectors.forEach(sel => {
                cloned.querySelectorAll(sel).forEach(el => el.remove());
            });
            
            data.contentHtml = cloned.innerHTML.trim();
            data.content = cloned.textContent.replace(/\s+/g, ' ').trim();
            
        } else {
            // Fallback: grab all paragraphs
            const paragraphs = doc.querySelectorAll('p');
            const contentParagraphs = [];
            paragraphs.forEach(p => {
                const text = p.textContent.trim();
                if (text.length > 40 && !text.includes('cookie') && !text.includes('subscribe')) {
                    contentParagraphs.push(text);
                }
            });
            data.content = contentParagraphs.join('\n\n');
            data.contentHtml = contentParagraphs.map(p => `<p>${p}</p>`).join('');
        }
        
        // ---- Extract All Images ----
        const allImages = doc.querySelectorAll('img');
        const seenUrls = new Set();
        if (data.heroImage) seenUrls.add(data.heroImage);
        
        allImages.forEach(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
            const alt = img.getAttribute('alt') || '';
            
            if (src && !seenUrls.has(src) && this.isContentImage(src)) {
                seenUrls.add(src);
                data.images.push({ src, alt });
            }
        });
        
        // ---- Extract Categories ----
        const breadcrumbs = doc.querySelectorAll('.breadcrumb a, .bread-crumb a, nav[class*="bread"] a, [class*="category"] a');
        breadcrumbs.forEach(a => {
            const text = a.textContent.trim();
            if (text && text.toLowerCase() !== 'home' && text.length < 40) {
                data.categories.push(text);
            }
        });
        
        if (data.categories.length === 0) {
            const catMeta = this.getMetaContent(doc, 'article:section');
            if (catMeta) data.categories.push(catMeta);
        }
        
        // ---- Extract Tags / Keywords ----
        const keywords = this.getMetaContent(doc, 'keywords') || this.getMetaContent(doc, 'news_keywords') || '';
        if (keywords) {
            data.tags = keywords.split(',').map(t => t.trim()).filter(t => t.length > 0 && t.length < 50);
        }
        
        const tagLinks = doc.querySelectorAll('.tags a, .tag-list a, [class*="tag"] a, .keywords a');
        tagLinks.forEach(a => {
            const text = a.textContent.trim();
            if (text && !data.tags.includes(text) && text.length < 50) {
                data.tags.push(text);
            }
        });
        
        // ---- Generate Key Points ----
        // Try to find existing key points / highlights
        const highlightElements = doc.querySelectorAll('.highlights li, .key-points li, .article-highlights li, [class*="highlight"] li, .story-highlights li');
        highlightElements.forEach(li => {
            const text = li.textContent.trim();
            if (text) data.keyPoints.push(text);
        });
        
        // Auto-generate key points from content if none found
        if (data.keyPoints.length === 0 && data.content) {
            data.keyPoints = this.generateKeyPoints(data.content);
        }
        
        // ---- Calculate Read Time ----
        const wordCount = data.content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / 200); // ~200 words per minute for Hindi
        data.readTime = `${minutes} min read`;
        
        return data;
    }

    // ---- Generate Key Points from Content ----
    generateKeyPoints(content) {
        const sentences = content
            .replace(/([।!?.])\s/g, '$1|||')
            .split('|||')
            .map(s => s.trim())
            .filter(s => s.length > 30 && s.length < 200);
        
        // Take first 3-4 meaningful sentences as key points
        const points = [];
        for (let i = 0; i < Math.min(sentences.length, 4); i++) {
            if (sentences[i] && !sentences[i].includes('http')) {
                points.push(sentences[i]);
            }
        }
        return points;
    }

    // ---- Display Article ----
    displayArticle(data) {
        // Hide loading, show results
        this.loading.classList.add('hidden');
        this.error.classList.add('hidden');
        this.results.classList.remove('hidden');
        
        // Title & Subtitle
        this.articleTitle.textContent = data.title || 'Title Not Found';
        
        if (data.subtitle && data.subtitle !== data.title) {
            this.articleSubtitle.textContent = data.subtitle;
            this.articleSubtitle.classList.remove('hidden');
        } else {
            this.articleSubtitle.classList.add('hidden');
        }
        
        // Date
        if (data.date) {
            this.articleDate.innerHTML = `<i class="fas fa-calendar-alt"></i> ${data.date}`;
            this.articleDate.classList.remove('hidden');
        } else {
            this.articleDate.classList.add('hidden');
        }
        
        // Author
        if (data.author) {
            this.articleAuthor.textContent = data.author;
            this.authorInfo.classList.remove('hidden');
        } else {
            this.authorInfo.classList.add('hidden');
        }
        
        // Read time
        if (data.readTime) {
            this.readTime.querySelector('span').textContent = data.readTime;
            this.readTime.classList.remove('hidden');
        }
        
        // Location
        if (data.location) {
            this.articleLocation.textContent = data.location;
            this.locationInfo.classList.remove('hidden');
        } else {
            this.locationInfo.classList.add('hidden');
        }
        
        // Hero Image
        if (data.heroImage) {
            this.heroImage.src = data.heroImage;
            this.heroImage.alt = data.title;
            this.heroImageContainer.classList.remove('hidden');
            this.heroImage.onerror = () => {
                this.heroImageContainer.classList.add('hidden');
            };
            
            if (data.heroImageCaption) {
                this.imageCaption.textContent = data.heroImageCaption;
                this.imageCaption.classList.remove('hidden');
            } else {
                this.imageCaption.classList.add('hidden');
            }
            
            this.heroImageContainer.onclick = () => this.openModal(data.heroImage, data.heroImageCaption);
        } else {
            this.heroImageContainer.classList.add('hidden');
        }
        
        // Categories
        if (data.categories.length > 0) {
            this.categoryTags.innerHTML = data.categories
                .map(c => `<span class="category-tag">${this.escapeHtml(c)}</span>`)
                .join('');
            this.categoryTags.classList.remove('hidden');
        } else {
            this.categoryTags.classList.add('hidden');
        }
        
        // Key Points
        if (data.keyPoints.length > 0) {
            this.keyPointsList.innerHTML = data.keyPoints
                .map(p => `<li>${this.escapeHtml(p)}</li>`)
                .join('');
            this.keyPoints.classList.remove('hidden');
        } else {
            this.keyPoints.classList.add('hidden');
        }
        
        // Article Body
        if (data.contentHtml) {
            // Sanitize the HTML content
            this.articleBody.innerHTML = this.sanitizeHtml(data.contentHtml);
        } else if (data.content) {
            this.articleBody.innerHTML = data.content
                .split('\n\n')
                .filter(p => p.trim())
                .map(p => `<p>${this.escapeHtml(p)}</p>`)
                .join('');
        } else {
            this.articleBody.innerHTML = '<p class="no-content">Could not extract article content. Try opening the original link.</p>';
        }
        
        // Image Gallery
        if (data.images.length > 0) {
            this.galleryGrid.innerHTML = data.images
                .slice(0, 12) // Max 12 images
                .map(img => `
                    <div class="gallery-item" onclick="scraper.openModal('${this.escapeAttr(img.src)}', '${this.escapeAttr(img.alt)}')">
                        <img src="${this.escapeAttr(img.src)}" alt="${this.escapeAttr(img.alt)}" loading="lazy" onerror="this.parentElement.style.display='none'">
                    </div>
                `)
                .join('');
            this.imageGallery.classList.remove('hidden');
        } else {
            this.imageGallery.classList.add('hidden');
        }
        
        // Tags
        if (data.tags.length > 0) {
            this.articleTags.innerHTML = data.tags
                .slice(0, 15)
                .map(t => `<span class="tag">${this.escapeHtml(t)}</span>`)
                .join('');
            this.tagsSection.classList.remove('hidden');
        } else {
            this.tagsSection.classList.add('hidden');
        }
        
        // Original link
        this.originalLink.href = data.url;
        
        // Raw data
        this.rawData.textContent = JSON.stringify(data, null, 2);
        this.rawData.classList.add('hidden');
        
        // Scroll to results
        this.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ---- UI State Helpers ----
    showLoading() {
        this.results.classList.add('hidden');
        this.error.classList.add('hidden');
        this.loading.classList.remove('hidden');
        
        // Reset steps
        this.step1.className = 'step active';
        this.step2.className = 'step';
        this.step3.className = 'step';
        
        this.scrapeBtn.disabled = true;
        
        this.loading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    updateStep(step, done = false) {
        if (step >= 1) this.step1.className = `step ${done && step === 1 ? 'done' : step > 1 ? 'done' : 'active'}`;
        if (step >= 2) this.step2.className = `step ${done && step === 2 ? 'done' : step > 2 ? 'done' : 'active'}`;
        if (step >= 3) this.step3.className = `step ${done && step === 3 ? 'done' : 'active'}`;
    }

    showError(message) {
        this.loading.classList.add('hidden');
        this.results.classList.add('hidden');
        this.error.classList.remove('hidden');
        this.errorMessage.innerHTML = message;
        this.scrapeBtn.disabled = false;
        
        this.error.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ---- Modal ----
    openModal(src, caption = '') {
        this.modalImage.src = src;
        this.modalCaption.textContent = caption;
        this.imageModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.imageModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ---- Toast ----
    showToast(message) {
        this.toastMessage.textContent = message;
        this.toast.classList.remove('hidden');
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
            setTimeout(() => this.toast.classList.add('hidden'), 300);
        }, 3000);
    }

    // ---- Action Buttons ----
    async copyArticle() {
        if (!this.extractedData) return;
        
        const text = `${this.extractedData.title}\n\n${this.extractedData.subtitle}\n\n${this.extractedData.content}\n\nSource: ${this.extractedData.url}`;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Article copied to clipboard!');
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('Article copied!');
        }
    }

    downloadArticle() {
        if (!this.extractedData) return;
        
        const data = this.extractedData;
        let text = `TITLE: ${data.title}\n`;
        text += `${'='.repeat(60)}\n\n`;
        
        if (data.subtitle) text += `SUBTITLE: ${data.subtitle}\n\n`;
        if (data.author) text += `AUTHOR: ${data.author}\n`;
        if (data.date) text += `DATE: ${data.date}\n`;
        if (data.location) text += `LOCATION: ${data.location}\n`;
        text += `SOURCE: ${data.url}\n`;
        text += `${'-'.repeat(60)}\n\n`;
        
        if (data.keyPoints.length > 0) {
            text += `KEY HIGHLIGHTS:\n`;
            data.keyPoints.forEach((p, i) => {
                text += `  ${i + 1}. ${p}\n`;
            });
            text += `\n${'-'.repeat(60)}\n\n`;
        }
        
        text += `ARTICLE:\n\n${data.content}\n\n`;
        
        if (data.tags.length > 0) {
            text += `TAGS: ${data.tags.join(', ')}\n`;
        }
        
        if (data.heroImage) {
            text += `\nHERO IMAGE: ${data.heroImage}\n`;
        }
        
        if (data.images.length > 0) {
            text += `\nALL IMAGES:\n`;
            data.images.forEach((img, i) => {
                text += `  ${i + 1}. ${img.src}\n`;
            });
        }
        
        const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `article-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Article downloaded!');
    }

    async shareArticle() {
        if (!this.extractedData) return;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: this.extractedData.title,
                    text: this.extractedData.subtitle || this.extractedData.title,
                    url: this.extractedData.url,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.copyArticle();
                }
            }
        } else {
            this.copyArticle();
        }
    }

    // ---- Utility Functions ----
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    getMetaContent(doc, property) {
        const meta = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
        return meta ? meta.getAttribute('content')?.trim() || '' : '';
    }

    getText(doc, selector) {
        const el = doc.querySelector(selector);
        return el ? el.textContent.trim() : '';
    }

    getAttr(doc, selector, attr) {
        const el = doc.querySelector(selector);
        return el ? el.getAttribute(attr)?.trim() || '' : '';
    }

    isContentImage(src) {
        if (!src) return false;
        const lower = src.toLowerCase();
        // Filter out icons, logos, tracking pixels etc.
        const excludePatterns = [
            'logo', 'icon', 'favicon', 'avatar', 'badge',
            'button', 'arrow', 'social', 'share', 'ad-',
            'advertisement', 'tracker', 'pixel', 'blank',
            '1x1', 'spacer', 'widget', 'emoji', 'smiley',
            'data:image', '.svg', 'base64',
            'facebook.com', 'twitter.com', 'google.com/ads',
        ];
        return !excludePatterns.some(p => lower.includes(p)) 
            && (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.webp') || lower.includes('image'));
    }

    sanitizeHtml(html) {
        // Basic sanitization - remove scripts, event handlers
        let clean = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/<iframe[^>]*>/gi, '')
            .replace(/<\/iframe>/gi, '');
        
        return clean;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeAttr(text) {
        return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ---- Initialize ----
const scraper = new NewsScraper();

// Enable scrape button after load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('scrapeBtn').disabled = false;
});
