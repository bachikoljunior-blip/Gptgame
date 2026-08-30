from pathlib import Path
import re

path = Path('index.html')
s = path.read_text(encoding='utf-8')

def once(old: str, new: str, name: str) -> None:
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'{name}: expected 1 occurrence, got {count}')
    s = s.replace(old, new, 1)

# The Pages artifact is revision-stamped; repository source keeps a source marker.
s = re.sub(r'<meta name="app-revision" content="[^"]*">', '<meta name="app-revision" content="source-v1.1">', s, count=1)

once('.mode{display:flex;gap:8px;margin-bottom:17px}.mode button{border:1px solid var(--line);background:#fff;border-radius:999px;min-height:42px;padding:8px 14px}.mode button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}', '', 'remove input-mode CSS')
once('.keyboard{display:flex;gap:8px;margin-top:12px}.keyboard input{flex:1;min-width:0;border:1px solid var(--line);border-radius:12px;padding:13px;font-size:16px}.send,.skip{border:0;border-radius:12px;padding:12px 17px;font-weight:800}.send{background:var(--green);color:#fff}.skip{background:#eee}', '.input-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:12px}.reset,.skip{border:0;border-radius:12px;padding:12px 17px;min-height:48px;font-weight:800}.reset{background:var(--soft);color:var(--green)}.reset small{display:block;font-size:10px;font-weight:600}.skip{background:#eee}', 'replace keyboard CSS')
once('.keyboard{flex-wrap:wrap}.keyboard input{flex-basis:100%}', '.input-actions{display:grid;grid-template-columns:1fr 1fr}.reset,.skip{padding-inline:9px}', 'replace narrow keyboard CSS')

once('<div class="panel"><div class="mode" aria-label="入力方法"><button data-mode="voice" aria-pressed="true">🎙 音声で遊ぶ</button><button data-mode="keyboard" aria-pressed="false">⌨ キーで練習</button></div><h2>', '<div class="panel"><h2>', 'remove mode chooser')
once('マイクは開始ボタンを押したときだけ使用します。音声認識はChrome系ブラウザ推奨。未対応でもキー練習で遊べます。', 'マイクは開始ボタンを押したときだけ使用します。音声認識はChrome系ブラウザ推奨。HTTPSまたはlocalhostで開いてください。', 'update support copy')
once('<form class="keyboard" id="form" hidden><input id="input" maxlength="160" autocomplete="off" placeholder="お題を入力して Enter"><button class="send">送信</button></form><button class="skip" id="skip">スキップ −30点</button>', '<div class="input-actions"><button class="reset" id="reset-input">聞き取りをリセット<small>減点なし・時間はそのまま</small></button><button class="skip" id="skip">スキップ −30点</button></div>', 'replace keyboard form with reset')
once('声打 v1.0 — 記録はこのブラウザ内だけに保存されます。', '声打 v1.1 — 同音の表記ゆれに対応。記録はこのブラウザ内だけに保存されます。', 'version footer')

homophones = "const HOMOPHONES={'今日はいい天気ですね':['教はいい転機ですね'],'お寿司が食べたいです':['お鮨が食べたいです','お鮓が食べたいです'],'明日の会議は十時からです':['明日の懐疑は十時からです'],'駅前のカフェで待ち合わせ':['液前のカフェで待ち合わせ'],'週末は家族と映画を見ます':['終末は家族と栄華を見ます'],'声で文字を入力すると速い':['越えで文字を入力すると早い'],'春の風が窓から入ってきた':['春の風邪が窓から入ってきた'],'人工知能によって仕事の進め方が変わります':['人工知能によって仕事の勧め方が変わります'],'隣の客はよく柿食う客だ':['隣の脚はよく牡蠣食う客だ','隣の客はよく夏季食う脚だ'],'音声認識の精度は環境によって変わります':['音声認識の制度は環境によって変わります'],'素早く正確に話すことが高得点への近道です':['素早く性格に話すことが高得点への近道です'],'新しい技術を使って毎日の作業を効率化します':['新しい記述を使って毎日の作業を効率化します'],'国際化と地域文化の両方を大切に考える':['国際化と地域文化の両方を大雪に考える'],'継続的な改善が大きな成果につながっていきます':['継続的な改善が大きな製菓につながっていきます'],'発表の前に資料とマイクの状態を確認しましょう':['発表の前に史料とマイクの常態を確認しましょう']};"
once('\nconst state={mode:\'voice\',duration:60,', '\n' + homophones + "\nconst state={duration:60,", 'insert homophones and voice-only state')

lines = s.splitlines()
for i, line in enumerate(lines):
    if line.startswith('function showPrompt()'):
        lines[i] = "function showPrompt(){state.buffer='';const p=current(),t=timeout[state.difficulty];state.plateEnd=performance.now()+t*1000;$('#number').textContent=`お題 ${String(state.index+1).padStart(2,'0')}`;$('#reading').textContent=p[1];$('#phrase').textContent=p[0];$('#heard').textContent='ここに認識した言葉が表示されます';$('#feedback').textContent=''}"
    elif line.startswith('function qualifies('):
        lines[i] = "function variants(p){return[p[0],p[1],...(HOMOPHONES[p[0]]||[])]}function qualifies(text,p){const n=norm(text);return variants(p).some(v=>n===norm(v)||n.endsWith(norm(v)))}function partialMatch(text,p){const n=norm(text);return n&&variants(p).some(v=>norm(v).startsWith(n))}function homophoneMatch(text,p){const n=norm(text);return(HOMOPHONES[p[0]]||[]).some(v=>n===norm(v)||n.endsWith(norm(v)))}"
    elif line.startswith('function answer('):
        lines[i] = "function answer(value){const list=(Array.isArray(value)?value:[value]).map(String).filter(x=>x.trim());if(!state.running||!list.length)return;const p=current(),candidates=list.flatMap(text=>state.buffer?[(state.buffer+' '+text).trim(),text.trim()]:[text.trim()]);let at=candidates.findIndex(text=>qualifies(text,p));if(at<0)at=candidates.map(text=>partialMatch(text,p)?1+norm(text).length/1000:similarity(text,p[1])).reduce((best,v,i,a)=>v>a[best]?i:best,0);state.buffer=candidates[at];$('#heard').textContent=state.buffer;if(partialMatch(state.buffer,p)&&!qualifies(state.buffer,p)){ $('#feedback').textContent='ここまで聞き取れました。そのまま続けてください。';$('#feedback').className='feedback ok';return}const target=p[1],units=Math.max(norm(state.buffer).length,norm(target).length),correct=qualifies(state.buffer,p);state.total+=units;state.correct+=correct?units:Math.round(units*Math.max(0,similarity(state.buffer,target)));if(correct){const sameSound=homophoneMatch(state.buffer,p);state.combo++;state.maxCombo=Math.max(state.maxCombo,state.combo);const mult=state.combo>=21?2:state.combo>=16?1.75:state.combo>=11?1.5:state.combo>=6?1.25:1;const c=len(p[0]);state.score+=Math.round(c*10*mult);state.chars+=c;state.cleared++;state.index++;showPrompt();$('#feedback').textContent=`${sameSound?'同音の表記ゆれも正解！':'正解！'} ${state.combo}コンボ`;$('#feedback').className='feedback ok';beep()}else{$('#feedback').textContent='もう一度、はっきり読もう';$('#feedback').className='feedback bad';state.combo=0;state.buffer=''}}"
    elif line.startswith('function stopRec()'):
        lines[i] = line + "\nfunction resetInput(){if(!state.running)return;stopRec();state.buffer='';$('#heard').textContent='ここに認識した言葉が表示されます';$('#feedback').textContent='聞き取りをリセットしました。得点と残り時間はそのままです。';$('#feedback').className='feedback ok';try{startRec()}catch(e){state.ranked=false;toast(e.message||'マイクを再開できません')}}"
    elif line.startswith('function startRec()'):
        lines[i] = "function startRec(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)throw Error('このブラウザは音声認識に対応していません');const r=new R(),delivered=new Set();state.rec=r;r.lang='ja-JP';r.continuous=true;r.interimResults=true;r.maxAlternatives = 5;r.onresult=e=>{let final=[],interim='';for(let i=e.resultIndex;i<e.results.length;i++){if(delivered.has(i))continue;const result=e.results[i],options=Array.from(result).slice(0,5).map(x=>x?.transcript||'');if(result.isFinal){delivered.add(i);if(!final.length)final=options}else interim+=options[0]||''}if(interim)$('#heard').textContent=(state.buffer+' '+interim).trim();if(final.length)answer(final)};r.onerror=e=>{if(['no-speech','aborted'].includes(e.error))return;state.ranked=false;toast(e.error==='not-allowed'?'マイクが許可されていません':'音声認識エラー。マイクと通信環境を確認してください')};r.onend=()=>{if(state.running)setTimeout(()=>{try{r.start()}catch{}},250)};r.start()}"
    elif line.startswith('async function start()'):
        lines[i] = "async function start(){state.score=state.combo=state.maxCombo=state.cleared=state.chars=state.correct=state.total=state.index=0;state.buffer='';state.deck=shuffle(data[state.difficulty]);state.running=true;state.ranked=true;state.start=performance.now();state.end=state.start+state.duration*1000;$('#course').textContent=`VOICE / ${state.difficulty.toUpperCase()} / ${state.duration} SEC`;screen('game');showPrompt();try{await navigator.mediaDevices?.getUserMedia({audio:true}).then(s=>s.getTracks().forEach(t=>t.stop()));startRec()}catch(e){state.running=false;screen('home');toast(e.message||'マイクを開始できません');return}state.timer=requestAnimationFrame(update)}"
    elif line.startswith('function key()'):
        lines[i] = "function key(){return`koeda:voice:${state.difficulty}:${state.duration}`}"
s = '\n'.join(lines)
once("$('#feedback').textContent=auto?'お題の時間切れ。次へ！':'スキップしました';$('#feedback').className='feedback bad';beep(250);showPrompt()", "showPrompt();$('#feedback').textContent=auto?'お題の時間切れ。次へ！':'スキップしました';$('#feedback').className='feedback bad';beep(250)", 'preserve skip feedback')

# Remove the keyboard mode and form handlers from the compact event-binding line.
once("$$('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#start').textContent=state.mode==='voice'?'マイクをオンにして開始 →':'キー練習を開始 →'});", '', 'remove mode handler')
once("$('#form').onsubmit=e=>{e.preventDefault();answer($('#input').value);$('#input').value=''};", '', 'remove form handler')
once("$('#start').onclick=start;$('#skip').onclick=()=>skip(false);", "$('#start').onclick=start;$('#reset-input').onclick=resetInput;$('#skip').onclick=()=>skip(false);", 'bind reset')
once("if(!(window.SpeechRecognition||window.webkitSpeechRecognition))$('#support').textContent='このブラウザは音声認識に未対応です。「キーで練習」を選んで遊べます。';", "if(!(window.SpeechRecognition||window.webkitSpeechRecognition)){const b=$('#start');b.disabled=true;b.textContent='音声認識に未対応';$('#support').textContent='このブラウザは音声認識に対応していません。Chrome系の対応ブラウザで開いてください。'};", 'unsupported voice-only copy')

# Product invariants.
for forbidden in ['data-mode="keyboard"', 'キーで練習', 'keyboard-form', 'class="keyboard"', "state.mode", "$('#form')", "$('#input')"]:
    if forbidden in s:
        raise SystemExit(f'forbidden keyboard residue: {forbidden}')
for required in ['id="reset-input"', 'HOMOPHONES', '同音の表記ゆれも正解', 'maxAlternatives = 5', 'source-v1.1']:
    if required not in s:
        raise SystemExit(f'missing: {required}')
if len(s.encode('utf-8')) > 120_000:
    raise SystemExit('source too large')
path.write_text(s + ('\n' if not s.endswith('\n') else ''), encoding='utf-8')
print(f'patched {len(s.encode("utf-8"))} bytes')
