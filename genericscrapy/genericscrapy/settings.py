# Scrapy settings for genericscrapy project
from genericscrapy.utils import get_random_agent
import logging
import asyncio
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html


BOT_NAME = 'genericscrapy'
SPIDER_MODULES = ['genericscrapy.spiders']
NEWSPIDER_MODULE = 'genericscrapy.spiders'
#CLOSESPIDER_PAGECOUNT = 1000

#The amount of time (in secs) that the downloader should wait before downloading consecutive pages from the same website. This can be used to throttle the crawling speed to avoid hitting servers too hard. Decimal numbers are supported
DOWNLOAD_DELAY=2

COOKIES_ENABLED = False
AUTOTHROTTLE_ENABLED = True
#only info in log to reduce CPU usage
# disable it for debugging
LOG_LEVEL = 'INFO'

#USER_AGENT = get_random_agent()

CONCURRENT_REQUESTS = 10
#CONCURRENT_REQUESTS_PER_DOMAIN = 10


#time-out after 1H
#added for testing
#DOWNLOAD_TIMEOUT=3600

# splash setup. source : https://github.com/scrapy-plugins/scrapy-splash
SPLASH_URL = 'http://localhost:8050'
DOWNLOADER_MIDDLEWARES = {
    'scrapy_splash.SplashCookiesMiddleware': 723,
    'scrapy_splash.SplashMiddleware': 725,
    'scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware': 810,
}
SPIDER_MIDDLEWARES = {
    'scrapy_splash.SplashDeduplicateArgsMiddleware': 100,
}
DUPEFILTER_CLASS = 'scrapy_splash.SplashAwareDupeFilter'
HTTPCACHE_STORAGE = 'scrapy_splash.SplashAwareFSCacheStorage'

#   scrapy_pyppeteer settings
#   for fixing: "TypeError: ProactorEventLoop is not supported, got: <ProactorEventLoop running=False closed=False debug=False"
""" asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
DOWNLOAD_HANDLERS = {
    "http": "scrapy_pyppeteer.handler.ScrapyPyppeteerDownloadHandler",
    "https": "scrapy_pyppeteer.handler.ScrapyPyppeteerDownloadHandler",
}
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
#   disabling the scrapy_pyppeteer loging
pyppeteer_level = logging.WARNING
logging.getLogger('pyppeteer').setLevel(pyppeteer_level)
logging.getLogger('websockets.protocol').setLevel(pyppeteer_level)
logging.getLogger('websockets.client').setLevel(pyppeteer_level) """

#   gerapy_pyppeteer settings
""" DOWNLOADER_MIDDLEWARES = {
    'gerapy_pyppeteer.downloadermiddlewares.PyppeteerMiddleware': 543,
}
GERAPY_PYPPETEER_DOWNLOAD_TIMEOUT = 600
GERAPY_PYPPETEER_LOGGING_LEVEL = logging.ERROR """

# scrapy_playwright settings
""" DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor" """

# MONGO setup
MONGO_URI = 'mongodb+srv://posts:posts@cluster0.lkclz.mongodb.net/'
MONGO_DATABASE =  'mydb'

# Crawl responsibly by identifying yourself (and your website) on the user-agent
#USER_AGENT = 'genericscrapy (+http://www.yourdomain.com)'
#USER_AGENT='my-cool-project (http://example.com)'
#USER_AGENT = get_random_agent()
#USER_AGENT= 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Configure maximum concurrent requests performed by Scrapy (default: 16)
#CONCURRENT_REQUESTS = 32

# Configure a delay for requests for the same website (default: 0)
# See https://docs.scrapy.org/en/latest/topics/settings.html#download-delay
# See also autothrottle settings and docs
#DOWNLOAD_DELAY = 3
# The download delay setting will honor only one of:
#CONCURRENT_REQUESTS_PER_DOMAIN = 16
#CONCURRENT_REQUESTS_PER_IP = 16

# Disable cookies (enabled by default)
#COOKIES_ENABLED = False

# Disable Telnet Console (enabled by default)
#TELNETCONSOLE_ENABLED = False

# Override the default request headers:
#DEFAULT_REQUEST_HEADERS = {
#    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
#}

# Enable or disable spider middlewares
# See https://docs.scrapy.org/en/latest/topics/spider-middleware.html
#SPIDER_MIDDLEWARES = {
#    'genericscrapy.middlewares.GenericscrapySpiderMiddleware': 543,
#}

# Enable or disable downloader middlewares
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#DOWNLOADER_MIDDLEWARES = {
#    'genericscrapy.middlewares.GenericscrapyDownloaderMiddleware': 543,
#}

# Enable or disable extensions
# See https://docs.scrapy.org/en/latest/topics/extensions.html
#EXTENSIONS = {
#    'scrapy.extensions.telnet.TelnetConsole': None,
#}

# Configure item 
# See https://docs.scrapy.org/en/latest/topics/item-pipeline.html
ITEM_PIPELINES = {
   #'genericscrapy.pipelines.GenericscrapyPipeline': 300,
   #    send url to kafka
   'genericscrapy.pipelines.LinkExtratorPipeline':1,
   #    scrape card    
   'genericscrapy.pipelines.CardScraperPipeline':2,
   #    crape table
   'genericscrapy.pipelines.TableScraperPipeline':3,
}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/autothrottle.html
#AUTOTHROTTLE_ENABLED = True
# The initial download delay
#AUTOTHROTTLE_START_DELAY = 5
# The maximum download delay to be set in case of high latencies
#AUTOTHROTTLE_MAX_DELAY = 60
# The average number of requests Scrapy should be sending in parallel to
# each remote server
#AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
#AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
#HTTPCACHE_ENABLED = True
#HTTPCACHE_EXPIRATION_SECS = 0
#HTTPCACHE_DIR = 'httpcache'
#HTTPCACHE_IGNORE_HTTP_CODES = []
#HTTPCACHE_STORAGE = 'scrapy.extensions.httpcache.FilesystemCacheStorage'
