/**
 * 防闪烁内联脚本 (Anti-FOUC Inline Script)
 *
 * 此脚本在 <head> 内执行，在浏览器解析任何 CSS 或 Vue 组件之前，
 * 立即在 <html> 上设置 data-theme / data-mode / data-fx，
 * 彻底消除首屏色彩闪烁 (FOUC)。
 *
 * 必须是纯字符串（不依赖外部模块），并且 try/catch 全覆盖。
 * 失败时的安全回落：工程主题 + 系统深浅色偏好 + auto 特效。
 */

export const ANTI_FOUC_SCRIPT = `(function(){
  var THEMES=['engineering','spatial','fluid'];
  var FX_LEVELS=['auto','high','low','off'];
  var root=document.documentElement;
  try{
    var savedTheme=localStorage.getItem('ey-theme');
    var theme=THEMES.includes(savedTheme)?savedTheme:'engineering';

    // 每个主题独立记忆明暗模式
    var modeKey='ey-mode-'+theme;
    var savedMode=localStorage.getItem(modeKey);
    var sysDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
    var mode;
    if(theme==='fluid'){
      // 流体仅深色
      mode='dark';
    } else if(savedMode==='dark'||savedMode==='light'){
      mode=savedMode;
    } else {
      mode=sysDark?'dark':'light';
    }

    var savedFx=localStorage.getItem('ey-fx');
    var fx=FX_LEVELS.includes(savedFx)?savedFx:'auto';

    root.setAttribute('data-theme',theme);
    root.setAttribute('data-mode',mode);
    root.setAttribute('data-fx',fx);
    if(theme==='fluid') root.style.colorScheme='dark';
  }catch(e){
    // 隐私模式 / localStorage 不可用：安全回落
    var sysDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
    root.setAttribute('data-theme','engineering');
    root.setAttribute('data-mode',sysDark?'dark':'light');
    root.setAttribute('data-fx','auto');
  }
})();`
