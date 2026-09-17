"""Optional UI checks: pip install playwright; requires a Chromium executable.
Runs the actual client in an isolated document. API responses are fixtures,
not a live Jev integration test. No external browser traffic is required.
"""
from pathlib import Path
import json, os, re
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]

def bundle():
    html = (ROOT / 'index.html').read_text()
    html = html.replace('<link rel="stylesheet" href="./src/style.css">', '<style>' + (ROOT / 'src/style.css').read_text() + '</style>')
    code = '\n'.join((ROOT / 'src' / file).read_text() for file in ['engine.js', 'render.js', 'main.js'])
    code = re.sub(r'^import .*?;\n', '', code, flags=re.M)
    code = re.sub(r'^export ', '', code, flags=re.M)
    return html.replace('<script type="module" src="./src/main.js"></script>', '<script>(async()=>{\n' + code + '\n})()</script>')

FIXTURE = """
window.testCalls = [];
window.fetch = async (url, options) => {
 if (!options?.body) return new Response(JSON.stringify({configured:true, accessRequired:false}));
 const s=JSON.parse(options.body).game; window.testCalls.push(s.active);
 await new Promise(r=>setTimeout(r, window.testDelay || 30));
 if(window.testFail) return new Response(JSON.stringify({error:'typesafe_network_error'}),{status:502});
 const me=s.tanks[s.active], en=s.tanks[1-s.active];
 const y=t=>{const i=Math.floor(t.x/4),p=t.x/4-i;return s.terrain[i]+(s.terrain[i+1]-s.terrain[i])*p};
 const dx=Math.abs(en.x-me.x),dy=y(en)-y(me),a=Math.PI/4;
 const power=Math.round(Math.max(24,Math.min(98,Math.sqrt(180*dx*dx/(2*Math.cos(a)**2*(dx*Math.tan(a)+dy)))/5.6)));
 return new Response(JSON.stringify({source:'jev',model:'browser-fixture-not-live',action:'shell',aim:'a45p'+power,confidence:.75,danger:2,probabilities:{shell:.75,heavy:.25},latency_ms:30}));
};
"""

def run():
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.getenv('CHROMIUM', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
        errors = []
        def page_for(fixture=False, mobile=False):
            page = browser.new_page(viewport={'width':390 if mobile else 1440, 'height':844 if mobile else 1100}, accept_downloads=True)
            page.on('pageerror', lambda e: errors.append(str(e)))
            html = bundle()
            if fixture: html = html.replace('<script>(async()=>{', '<script>' + FIXTURE + '(async()=>{')
            page.set_content(html, wait_until='load')
            if fixture: page.wait_for_function("document.querySelector('#mode').value === 'jev'")
            return page
        page = page_for()
        assert page.locator('#mode').input_value() == 'demo'
        page.select_option('#speed', '4')
        page.click('#step')
        page.wait_for_function("document.querySelector('#turn').dataset.turn === '1'")
        assert 'ДЕМО' in page.locator('#source').inner_text()
        assert page.locator('.log-row').count() == 1
        with page.expect_download() as download:
            page.click('#export')
        data = json.loads(Path(download.value.path()).read_text())
        assert data['mode'] == 'demo' and data['turns'][0]['decision']['source'] == 'demo'
        page.click('#play')
        page.wait_for_function("Number(document.querySelector('#turn').dataset.turn) >= 2")
        page.click('#play')
        turn = page.locator('#turn').get_attribute('data-turn')
        page.wait_for_timeout(800)
        assert page.locator('#turn').get_attribute('data-turn') == turn
        page.click('#reset')
        assert page.locator('#turn').get_attribute('data-turn') == '0'
        results += ['demo turn', 'replay export', 'pause', 'reset']
        page.close()
        page = page_for(fixture=True)
        assert page.locator('#mode').input_value() == 'jev'
        page.evaluate('window.testFail = true')
        page.click('#step')
        page.wait_for_selector('#error:visible')
        assert page.locator('#turn').get_attribute('data-turn') == '0'
        assert page.locator('#mode').input_value() == 'jev'
        assert page.locator('.log-row').count() == 0
        results.append('API failure stops without fallback')
        page.close()
        page = page_for(fixture=True)
        page.evaluate('window.testDelay = 500')
        page.click('#step')
        page.click('#reset')
        page.wait_for_timeout(800)
        assert page.locator('#turn').get_attribute('data-turn') == '0'
        assert 'Пока без приказа' in page.locator('#order1').inner_text()
        results.append('stale response ignored after reset')
        page.close()
        page = page_for(fixture=True)
        page.select_option('#speed', '4')
        page.click('#play')
        page.wait_for_function("Number(document.querySelector('#turn').dataset.turn) >= 2")
        page.click('#play')
        assert page.evaluate('window.testCalls.slice(0,2)') == [1,0]
        assert page.locator('#prob0 .row').count() > 0 and page.locator('#prob1 .row').count() > 0
        results.append('both tanks use API response path (mocked)')
        page.close()
        mobile = page_for(mobile=True)
        assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
        mobile.select_option('#speed', '4'); mobile.click('#step')
        mobile.wait_for_function("document.querySelector('#turn').dataset.turn === '1'")
        results.append('mobile layout and turn control')
        mobile.screenshot(path='/tmp/tank-duel-mobile-qa.png', full_page=True)
        mobile.close()
        assert not errors, errors
        browser.close()
    print(json.dumps({'passed': results, 'console_errors': errors, 'live_api': False}, ensure_ascii=False, indent=2))
if __name__ == '__main__': run()
