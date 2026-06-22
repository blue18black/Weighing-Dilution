let chemicals =
JSON.parse(localStorage.getItem("chemicals"))
||
{
    "KCl":74.55,
    "NaOH":40.00,
    "H2SO4":98.08,
    "Ni(NO3)2·6H2O":290.79,
    "Co(NO3)2·6H2O":291.03,
    "HAuCl4・4H2O":411.85,
};
let backupChemicals = null;
let currentHistoryType = "秤量";
const stockContainer =
document.getElementById("stockContainer");

const reagentContainer = document.getElementById("reagentContainer");
const enableEdit =
document.getElementById("enableEdit");
const saveDictionary =
document.getElementById("saveDictionary");

document.getElementById("historySearch")
?.addEventListener("input",()=>{

    renderHistory(currentHistoryType);

});
const undoDictionary =
document.getElementById("undoDictionary");
const addChemical =
document.getElementById("addChemical");
const dilutionContainer =
document.getElementById("dilutionContainer");
function addReagentRow(){

    const div = document.createElement("div");
    div.className = "reagent";

    div.innerHTML = `
        <div class="inputGroup">
            <label>化合物</label>
            <select class="chemSelect">
                <option value="">選択または手入力</option>
                ${Object.keys(chemicals)
                    .map(name=>`<option value="${name}">${name}</option>`)
                    .join("")}
            </select>
        </div>
        <div class="inputGroup">
            <label>化合物名</label>
            <input class="chemName" placeholder="化合物名">
        </div>
        <div class="inputGroup">
            <label>分子量 (g/mol)</label>
            <input class="mw" placeholder="分子量(g/mol)" type="number" step="any">
        </div>
        <div class="inputGroup">
            <label>作製量 (mL)</label>
            <input class="volume" placeholder="溶液を何mL作製すればいいか(mL)" type="number" step="any">
        </div>      
        <div class="inputGroup">
            <label>濃度 (M)</label>          
            <input class="conc" placeholder="化合物が溶液の全量に対して何Mであればいいか(M)" type="number" step="any">
        </div>
            <button type="button"
        class="resetReagent">
        リセット
        </button>
        <button type="button" class="removeReagent">削除</button>
    `;

    reagentContainer.appendChild(div);

    const select = div.querySelector(".chemSelect");
    const name = div.querySelector(".chemName");
    const mw = div.querySelector(".mw");

    select.addEventListener("change",()=>{

        if(select.value){

            name.value = select.value;
            mw.value = chemicals[select.value];
        }
    });

    div.querySelector(".removeReagent")
    .addEventListener("click",()=>{

        if(document.querySelectorAll(".reagent").length===1){
            alert("最低1つは必要です");
            return;
        }

        div.remove();
    });
    div.querySelector(".resetReagent")
    .addEventListener("click",()=>{

        div.querySelector(".chemSelect").value="";
        div.querySelector(".chemName").value="";
        div.querySelector(".mw").value="";
        div.querySelector(".volume").value="";
        div.querySelector(".conc").value="";
    });
}

addReagentRow();

document.getElementById("addReagent")
.addEventListener("click",addReagentRow);

document.querySelectorAll(".tab").forEach(btn=>{

    btn.addEventListener("click",()=>{

        document.querySelectorAll(".tab")
        .forEach(t=>t.classList.remove("active"));

        document.querySelectorAll(".tabContent")
        .forEach(t=>t.classList.remove("active"));

        btn.classList.add("active");

        document
        .getElementById(btn.dataset.tab)
        .classList.add("active");

        if(btn.dataset.tab==="weigh"){
            currentHistoryType = "秤量";
            renderHistory("秤量");
        }

        if(btn.dataset.tab==="dilution"){
            currentHistoryType = "希釈";
            renderHistory("希釈");
        }

        if(btn.dataset.tab==="dictionary"){
            currentHistoryType = "編集";
            renderHistory("編集");
        }
        if(btn.dataset.tab==="mixedDilution"){

            currentHistoryType = "共存";

            renderHistory("共存");

        }
    });
});

let history =
JSON.parse(localStorage.getItem("reagentHistory"))
|| [];

function saveHistory(){

    localStorage.setItem(
        "reagentHistory",
        JSON.stringify(history)
    );

    renderHistory(currentHistoryType);
}

function renderHistory(type){
    const keyword =
    document.getElementById("historySearch")
    ?.value
    ?.trim()
    ?.toLowerCase()
    || "";

    const tbody =
    document.getElementById("historyBody");

    tbody.innerHTML="";

    history
    .filter(h=>{
        if(h.type!==type) return false;

        if(keyword==="") return true;

        return h.text
            .toLowerCase()
            .includes(keyword);
    })
    .forEach(h=>{

        tbody.innerHTML+=`
        <tr>
            <td>${h.time}</td>
            <td>${h.text}</td>
        </tr>
        `;
    });
}

document
.getElementById("calcWeight")
.addEventListener("click",()=>{

    let html="";
    let historyText=[];
    document
    .querySelectorAll(".reagent")
    .forEach(r=>{

        const name =
        r.querySelector(".chemName").value;

        const mw =
        Number(r.querySelector(".mw").value);

        const vol =
        Number(r.querySelector(".volume").value);

        const conc =
        Number(r.querySelector(".conc").value);

        const mass =
        mw * conc * vol / 1000;

        html += `
        <div class="result">
        ${name}: ${mass.toFixed(4)} g
        </div>`;

        historyText.push(
            `${name}
    (${conc} M, ${vol} mL)
    → ${mass.toFixed(4)} g`
        );
        
    });
    history.unshift({

        time:new Date().toLocaleString(),

        type:"秤量",

        text:historyText.join(" / ")
    });
    
    document
    .getElementById("weightResult")
    .innerHTML = html;

    saveHistory();
    renderHistory("秤量");
});

document
.getElementById("calcDilution")
.addEventListener("click",()=>{

    let html="";
    let historyText=[];
    
    document
    .querySelectorAll(".dilutionRow")
    .forEach(row=>{
        const chemical =
        row.querySelector(".dilutionChemical")
        .value;
        const c1 =
        Number(
            row.querySelector(".stockConc").value
        );

        const c2 =
        Number(
            row.querySelector(".targetConc").value
        );

        const v2 =
        Number(
            row.querySelector(".finalVol").value
        );

        const v1 =
        c2*v2/c1;

        const solvent =
        v2-v1;

        html += `
        <div class="result">
            ${chemical}
            :
            母液:${v1.toFixed(2)}mL
            /
            溶媒:${solvent.toFixed(2)}mL
        </div>
        `;

        historyText.push(
            `${c1}M→${c2}M (${v2}mL)
            : 母液${v1.toFixed(2)}mL
            + 溶媒${solvent.toFixed(2)}mL`
        );

    });

    document
    .getElementById("dilutionResult")
    .innerHTML = html;

    history.unshift({

        time:new Date().toLocaleString(),

        type:"希釈",

        text:historyText.join(" / ")

    });

    saveHistory();
    renderHistory("希釈");
});

document
.getElementById("downloadCSV")
.addEventListener("click",()=>{

    let csv =
    "日時,種別,内容\n";

    history.forEach(h=>{

        const text =
        `"${h.text.replace(/"/g,'""')}"`;

        csv +=
        `${h.time},${h.type},${text}\n`;
    });

    const blob =
    new Blob([csv],
    {type:"text/csv"});

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href=url;
    a.download="history.csv";
    a.click();
});

document
.getElementById("clearHistory")
.addEventListener("click",()=>{

    if(confirm("履歴を削除しますか？")){

        history=[];

        saveHistory();
    }
});

let editMode=false;

function renderDictionary(){

    const area =
    document.getElementById("dictionaryList");

    area.innerHTML="";

    Object.entries(chemicals)
    .forEach(([name,mw])=>{

        area.innerHTML += `
        <div class="dictRow">

            <input
            class="dictName"
            value="${name}"
            ${!editMode?"disabled":""}
            >

            <input
            class="dictMw"
            value="${mw}"
            ${!editMode?"disabled":""}
            >

            ${
                editMode
                ?
                `<button
                type="button"
                class="deleteChemical">
                削除
                </button>
                
                <button
                type="button"
                class="moveUp">
                ↑
                </button>

                <button
                type="button"
                class="moveDown">
                ↓
                </button>`
                :
                ""
            }

        </div>
        `;
    });
    if(editMode){
        addChemical.style.display="inline-block";
    }else{
        addChemical.style.display="none";
        saveDictionary.style.display="none";
        undoDictionary.style.display="none";
    }
    document
    .querySelectorAll(".deleteChemical")
    .forEach(btn=>{

        btn.addEventListener("click",()=>{

            if(
                !confirm("この試薬を削除しますか？")
            ){
                return;
            }

            btn.parentElement.remove();

        });

    });
    document
    .querySelectorAll(".moveUp")
    .forEach(btn=>{

        btn.onclick=()=>{

            const row=
            btn.parentElement;

            const prev=
            row.previousElementSibling;

            if(prev){

                row.parentNode.insertBefore(
                    row,
                    prev
                );

            }
        };
    });

    document
    .querySelectorAll(".moveDown")
    .forEach(btn=>{

        btn.onclick=()=>{

            const row=
            btn.parentElement;

            const next=
            row.nextElementSibling;

            if(next){

                row.parentNode.insertBefore(
                    next,
                    row
                );

            }
        };
    });
}

function buildChemicalOptionsHtml(placeholderText){

    const placeholder =
    `<option value="">${placeholderText}</option>`;

    const options =
    Object.keys(chemicals)
    .map(name=>`<option value="${name}">${name}</option>`)
    .join("");

    return placeholder + options;
}

function refreshChemicalSelects(){

    const configs = [
        {selector:".chemSelect", placeholder:"選択または手入力"},
        {selector:".dilutionChemical", placeholder:"選択"},
        {selector:".stockChemical", placeholder:"選択"},
        {selector:".impurityName", placeholder:"選択"}
    ];

    configs.forEach(({selector,placeholder})=>{

        document.querySelectorAll(selector)
        .forEach(select=>{

            const current = select.value;

            select.innerHTML =
            buildChemicalOptionsHtml(placeholder);

            if(current && chemicals.hasOwnProperty(current)){
                select.value = current;
            }
        });
    });
}

enableEdit.addEventListener("click",()=>{
    backupChemicals =
    JSON.parse(
        JSON.stringify(chemicals)
    );

    editMode=true;
    addChemical.style.display="inline-block";
    undoDictionary.style.display="inline-block";
    saveDictionary.style.display="inline-block";
    saveDictionary.disabled=false;

    renderDictionary();
});

saveDictionary.addEventListener("click",()=>{
    const oldChemicals = {...chemicals};
    let changes=[];
    const names =
    document.querySelectorAll(".dictName");

    const mws =
    document.querySelectorAll(".dictMw");

    chemicals = {};
    
    for(let i=0;i<names.length;i++){

        const name = names[i].value.trim();
        const mw = Number(mws[i].value);

        if(!name){
            alert("化合物名が空欄です");
            return;
        }

        if(isNaN(mw)){
            alert("分子量を入力してください");
            return;
        }
        if(!(name in oldChemicals)){

            changes.push(
                `追加: ${name} (${mw} g/mol)`
            );

        }else if(oldChemicals[name] !== mw){

            changes.push(
                `変更: ${name} (${oldChemicals[name]} → ${mw} g/mol)`
            );

        }
        
        chemicals[name] = mw;
    }
    Object.keys(oldChemicals)
    .forEach(oldName=>{

        if(!(oldName in chemicals)){

            changes.push(
                `削除: ${oldName}(${oldChemicals[oldName]} g/mol)`
            );

        }

    });
    history.unshift({

        time:new Date().toLocaleString(),

        type:"編集",

        text:
        changes.length
        ? changes.join(" / ")
        : "変更なし"
    });
    saveHistory();
    renderHistory("編集");
    localStorage.setItem(
        "chemicals",
        JSON.stringify(chemicals)
    );

    refreshChemicalSelects();

    editMode=false;

    addChemical.style.display="none";
    saveDictionary.style.display="none";

    saveDictionary.disabled=true;
    undoDictionary.style.display="none";
    renderDictionary();

    alert("保存しました");
});

function addDilutionRow(){

    const div=document.createElement("div");

    div.className="dilutionRow";

    div.innerHTML=`
        <div class="inputGroup">
            <label>化合物</label>

            <select class="dilutionChemical">

                <option value="">
                選択
                </option>

                ${
                    Object.keys(chemicals)
                    .map(name=>
                    `<option value="${name}">
                        ${name}
                    </option>`
                    )
                    .join("")
                }

            </select>
            <label>母液濃度(M)</label>
            <input class="stockConc"
            placeholder="母液濃度(M)">
        </div>
        <div class="inputGroup">
            <label>目標濃度(M)</label>
            <input class="targetConc"
            placeholder="目標濃度(M)">
        </div>
        <div class="inputGroup">
            <label>作製量(mL)</label>
            <input class="finalVol"
            placeholder="作製量(mL)">
        </div>
        <button class="resetDilution">
        リセット
        </button>
        <button class="removeDilution">
        削除
        </button>
    `;

    dilutionContainer.appendChild(div);

    div.querySelector(".removeDilution")
    .addEventListener("click",()=>{

        if(
        document.querySelectorAll(".dilutionRow")
        .length===1
        ){
            alert("最低1つ必要です");
            return;
        }

        div.remove();
    });
    div.querySelector(".resetDilution")
    .addEventListener("click",()=>{

        div.querySelector(".stockConc").value="";
        div.querySelector(".targetConc").value="";
        div.querySelector(".finalVol").value="";
    });
}

addChemical.addEventListener("click",()=>{

    if(!editMode) return;

    const area=
    document.getElementById("dictionaryList");

    area.innerHTML += `
    <div class="dictRow">

        <input
        class="dictName"
        placeholder="化合物名"
        >

        <input
        class="dictMw"
        placeholder="分子量"
        >

        <button
        type="button"
        class="deleteChemical">
        削除
        </button>

    </div>
    `;
    const newBtn =
    area.lastElementChild
    .querySelector(".deleteChemical");

    newBtn.addEventListener("click",()=>{

        if(confirm("削除しますか？")){
            newBtn.parentElement.remove();
        }

    });
});
undoDictionary.addEventListener("click",()=>{

    if(!backupChemicals){
        return;
    }

    if(!confirm("編集前の状態に戻しますか？")){
        return;
    }

    chemicals =
    JSON.parse(
        JSON.stringify(backupChemicals)
    );

    refreshChemicalSelects();

    renderDictionary();
});

document
.getElementById("addDilution")
.addEventListener(
    "click",
    addDilutionRow
);

document
.getElementById("calcMixed")
.addEventListener("click",()=>{

    const finalVol =
    Number(
        document.getElementById(
            "finalVolume"
        ).value
    );

    let result = "";

    let totalVolume = 0;

    document
    .querySelectorAll(".stockRow")
    .forEach(stock=>{

        const chemical =
        stock.querySelector(
            ".stockChemical"
        ).value;

        const stockConc =
        Number(
            stock.querySelector(
                ".stockConc"
            ).value
        );

        const targetConc =
        Number(
            stock.querySelector(
                ".targetConc"
            ).value
        );

        const stockVol =
        targetConc
        * finalVol
        / stockConc;

        totalVolume += stockVol;

        result += `
        <div class="result">
        ${chemical}: ${stockVol.toFixed(2)} µL
        </div>
        `;

        stock
        .querySelectorAll(
            ".impurityRow"
        )
        .forEach(imp=>{

            const name =
            imp.querySelector(
                ".impurityName"
            ).value;

            const impurityConc =
            Number(
                imp.querySelector(
                    ".impurityConc"
                ).value
            );

            const targetImpurity =
            Number(
                imp.querySelector(
                    ".targetImpurityConc"
                ).value
            );

            const currentAmount =
            impurityConc
            * stockVol;

            const needAmount =
            targetImpurity
            * finalVol;

            const lack =
            needAmount
            - currentAmount;

            const supplements =
            Array.from(
                imp.querySelectorAll(
                    ".supplementConc"
                )
            )
            .filter(s=>s.value!=="");

            if(
                lack > 0 &&
                supplements.length > 0
            ){

                const lackEach =
                lack / supplements.length;

                supplements.forEach((supplement,i)=>{

                    const supplementConc =
                    Number(supplement.value);

                    const supplementVol =
                    lackEach
                    / supplementConc;

                    totalVolume +=
                    supplementVol;

                    const label =
                    supplements.length > 1
                    ? `${name}補充液(${i+1})`
                    : `${name}補充液`;

                    result += `
                    <div class="result">
                    ${label}: ${supplementVol.toFixed(2)} µL
                    </div>
                    `;
                });
            }

        });

    });

    result += `
    <div class="result">
    溶媒: ${(finalVol-totalVolume).toFixed(2)} µL
    </div>
    `;

    document
    .getElementById(
        "mixedResult"
    )
    .innerHTML =
    result;

});

function addStockRow(){

    const div =
    document.createElement("div");

    div.className = "stockRow";

    div.innerHTML = `
    <h3>母液</h3>

    <select class="stockChemical">
        <option value="">選択</option>
        ${
            Object.keys(chemicals)
            .map(name=>
            `<option>${name}</option>`)
            .join("")
        }
    </select>

    <input
        class="stockConc"
        placeholder="母液濃度(M)"
        type="number">

    <input
        class="targetConc"
        placeholder="目標濃度(M)"
        type="number">

    <div class="impurityContainer">
    </div>

    <button
        class="addImpurity"
        type="button">

        共存成分追加

    </button>

    <button
        class="removeStock"
        type="button">

        母液削除

    </button>
    `;

    stockContainer.appendChild(div);

    div
    .querySelector(".addImpurity")
    .addEventListener("click",()=>{

        addImpurityRow(div);

    });

    div
    .querySelector(".removeStock")
    .addEventListener("click",()=>{

        if(document.querySelectorAll(".stockRow").length===1){
            alert("最低1つは必要です");
            return;
        }

        div.remove();

    });

}
function addImpurityRow(stockDiv){

    const container =
    stockDiv.querySelector(
        ".impurityContainer"
    );

    const row =
    document.createElement("div");

    row.className =
    "impurityRow";

    row.innerHTML = `

    <div class="impurityCard">

        <h4>共存成分</h4>

        <select class="impurityName">

            <option value="">
            選択
            </option>

            ${
                Object.keys(chemicals)
                .map(name=>
                `<option>${name}</option>`
                )
                .join("")
            }

        </select>

        <input
            class="impurityConc"
            placeholder="母液中濃度(M)"
            type="number">

        <input
            class="targetImpurityConc"
            placeholder="目標濃度(M)"
            type="number">

        <div class="supplementContainer">
        </div>

        <button
            class="addSupplement"
            type="button">

            補充母液追加

        </button>

        <button
            class="removeImpurity"
            type="button">

            共存成分削除

        </button>

    </div>
    `;

    container.appendChild(row);

    row
    .querySelector(".addSupplement")
    .addEventListener("click",()=>{

        addSupplementRow(row);

    });

    row
    .querySelector(".removeImpurity")
    .addEventListener("click",()=>{

        row.remove();

    });

}

function addSupplementRow(
    impurityRow
){

    const area =
    impurityRow.querySelector(
        ".supplementContainer"
    );

    const div =
    document.createElement("div");

    div.className =
    "supplementRow";

    div.innerHTML = `

    <input
        class="supplementConc"
        placeholder="補充母液濃度(M)"
        type="number">

    <button
        class="removeSupplement"
        type="button">

        削除

    </button>
    `;

    area.appendChild(div);

    div
    .querySelector(".removeSupplement")
    .addEventListener("click",()=>{

        div.remove();

    });

}

document
.getElementById("addStock")
.addEventListener(
    "click",
    addStockRow
);

addChemical.style.display="none";
saveDictionary.style.display="none";
undoDictionary.style.display="none";

renderDictionary();
renderHistory(currentHistoryType);
addDilutionRow();
addStockRow();