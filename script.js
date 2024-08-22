const d = getNodesByXPath("/html/frameset/frame[2]")[0];

d?.addEventListener(`load`, addArenaHP);
////////////////////////////////////////////////////////////////////
const isIncludes = (a,t=getD().body)=>a.some(e=>t.innerHTML.includes(e));
function createAndSetT(elm, txt) {
  const E = document.createElement(elm);
  E.innerText = txt;
  return E;
}
function createAndSetH(elm, txt) {
  const E = document.createElement(elm);
  E.innerHTML = txt;
  return E;
}
const getHero = (table, isChampion)=>{
  const heroS = `td:nth-child(${isChampion ? 1 : 3}) > img[width="48px"]`;
  return table.querySelector(heroS).alt.replaceAll(/[【】]/g, ``);
};
////////////////////////////////////////////////////////////////////
function addArenaHP(e) {
  if (!isIncludes([`レベル制限:Lv25`])) {
    return;
  }

  const tableS = `div.contents > table:not(.logtables):not([style])`;
  const turnDetailS = `div.contents > div.maintables`;
  const tableList = getD().querySelectorAll(tableS);
  const turnDetailList = getD().querySelectorAll(turnDetailS);
  const turnNum = turnDetailList.length - 1;
  const champHero = getHero(tableList[0], true);
  const challHero = getHero(tableList[0], false);
  const champMaxHP = getMaxHP(true);
  const challMaxHP = getMaxHP(false);
  let champNowHP = champMaxHP;
  let challNowHP = challMaxHP;
  const champHP = ()=>`${champNowHP}/${champMaxHP}`;
  const challHP = ()=>`${challNowHP}/${challMaxHP}`;

/*
  // 1ターン目のメーターはどちらも最大HPなので、ここで処理
  hpSet(tableList[1], champHP(), challHP());

  // 2ターン目以降は前回のターンでのダメージで変わる。その処理
  for (let turn = 1; turn <= turnNum; turn++) {
*/
  // ↑ 先制攻撃でも正常に作動すれば、上記は削除

  // 前回のターンでのダメージで変わる。その処理
  for (let turn = 0; turn <= turnNum; turn++) {
    const ataetaDamage = damageCounter(turnDetailList[turn], true);
    const uketaDamage = damageCounter(turnDetailList[turn], false);

    champNowHP -= ataetaDamage;
    challNowHP -= uketaDamage;

    if (champNowHP < 0) champNowHP = 0;
    if (challNowHP < 0) challNowHP = 0;

    if (turn !== turnNum) {
      hpSet(tableList[turn + 1], champHP(), challHP());
    }

    const txt = [
      `turn ${turn}`,
      `挑戦者 : ${challHero}`,
      `被ﾀﾞﾒList : ${getDamageList(turnDetailList[turn], false).join(`, `)}`,
      `合計被ﾀﾞﾒ : ${uketaDamage}`,
      `挑戦者の現在HP : ${challNowHP}`,
      `王者 : ${champHero}`,
      `与ﾀﾞﾒList : ${getDamageList(turnDetailList[turn], true).join(`, `)}`,
      `合計与ﾀﾞﾒ : ${ataetaDamage}`,
      `王者の現在HP : ${champNowHP}`,
      `-----------------------`,
    ].join(`\n`);
    console.log(txt);
  }
}
/* 最大HPを取得して返す */
function getMaxHP(isChampion) {
  const elem = getD().querySelectorAll(`tr > td > small:has(> hr)`);
  return elem[isChampion ? 0 : 1].innerText.match(/(?<=HP:)\d{1,}/);
}
/* メーターの下に「現在/最大」の数値を追加する */
function hpSet(table, championHP, challengerHP) {
  const champTable = table.querySelector(`td:nth-child(1)`);
  const challTable = table.querySelector(`td:nth-child(3)`);
  champTable.appendChild(createAndSetT(`center`, championHP));
  challTable.appendChild(createAndSetT(`center`, challengerHP));
}
/* ダメージをカウントして数値を返す */
function damageCounter(turnDetail, isAtaeta) {
  // 即死攻撃等の例外処理
  if (isIncludes([`一撃必殺`], turnDetail)) {
    return 9999;
  }

  const afterTxt = `の?ダメージを${isAtaeta ? "与え" : "受け"}た`;
  const reg = new RegExp(`\\d{1,}(?=${afterTxt})`, `g`);
  // null合体演算子を用いる事で、マッチしなかった場合0のみ含む配列を返す
  const damageList = turnDetail.innerText.match(reg) ?? [0];
  return damageList.map(e=>Number.parseInt(e)).reduce((e, a)=>e + a);
}
/* 変数確認用：削除予定の関数 */
function getDamageList(turnDetail, isAtaeta) {
  const afterTxt = `の?ダメージを${isAtaeta ? "与え" : "受け"}た`;
  const reg = new RegExp(`\\d{1,}(?=${afterTxt})`, `g`);
  const damageList = turnDetail.innerText.match(reg) ?? [0];
  return damageList;
}
////////////////////////////////////////////////////////////////////
function getNodesByXPath(xpath) {
  const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  return [...Array(result.snapshotLength)].map((_,i)=>result.snapshotItem(i));
}
////////////////////////////////////////////////////////////////////
// フレーム内documentを取得して返す
////////////////////////////////////////////////////////////////////
function getD() {
  const Document = window.document.getElementsByTagName("frame");

  return Document === 0 ? Document : Document[1].contentDocument;
}
